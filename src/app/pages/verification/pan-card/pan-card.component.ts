import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { KycService } from 'src/app/core/services/kyc.service';
import {
	confirmMessages,
	planFeatures,
	kycStatus,
	OPTIONS,
	SERVICES,
	ROLES,
	defaultStatus,
	verificationLevel,
} from 'src/app/helpers';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Location } from '@angular/common';
import { kycFieldForm } from 'src/app/helpers/form-error.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { ChangeStatusComponent } from '../change-status/change-status.component';

@Component({
	selector: 'app-pan-card',
	templateUrl: './pan-card.component.html',
	styleUrls: ['./pan-card.component.scss'],
})
export class PanCardComponent implements OnInit, OnDestroy {
	userData: any = {};
	errorMessages = kycFieldForm;
	roles = ROLES;
	currentUser: any;
	defaultStatus = defaultStatus;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	dataForm = new FormGroup({
		id: new FormControl(null),
		type: new FormControl(planFeatures.PAN_CARD),
		cardNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.panCardPattern)]),
		frontImage: new FormControl('', [Validators.required]),
		backImage: new FormControl(),
		additionalDetails: new FormControl(),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(),
	});
	panCard: any = null;
	userId = null;
	kycStatus = kycStatus;
	verificationLevel = verificationLevel;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;

	constructor(
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private kycService: KycService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private userService: UserService,
		private verificationDetailsService: VerificationDetailsService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['userId'].setValue(this.userId);
			this.getData();
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
	}
	ngOnDestroy(): void {}
	get form() {
		return this.dataForm.controls;
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	getData() {
		const payload = {
			userId: this.userId,
			type: this.form['type'].value,
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role)
				? `/admin/kyc/${this.form['type'].value}`
				: `/kyc/${this.form['type'].value}`,
		};
		this.kycService.getType(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) {
					this.panCard = result.data;
					this.updateCardValidator(false);
					this.dataForm.patchValue(result.data);
					this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
					// if (this.form['status'].value === verificationLevel.CLEAR_REPORT) {
					// 	this.dataForm.disable();
					// }
				}
				if (
					![
						ROLES.PROTO_SUPER_ADMIN,
						ROLES.PROTO_ADMIN,
						ROLES.PROTO_USER,
						ROLES.PROTO_OPERATION,
						ROLES.EMPLOYEE,
					].includes(this.currentUser.role)
				) {
					this.updateCardValidator(false);
					this.dataForm.disable();
				}
				if ([ROLES.EMPLOYEE].includes(this.currentUser.role) && this.form['id'].value) {
					this.dataForm.disable();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	uploadFile(event) {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkImageType(file)) {
			this.toastService.error(OPTIONS.documentFileType);
			return;
		}
		if (this.uploadService.checkFileSize(file)) {
			this.toastService.error(OPTIONS.sizeLimit);
			return;
		}
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.VERIFICATION).subscribe({
			next: (value) => {
				this.form['frontImage'].setValue(value.cdn);
				if ([ROLES.EMPLOYEE].includes(this.currentUser.role) && this.form['id'].value) {
					this.onSubmit();
				}
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	clearFile() {
		this.form['frontImage'].setValue('');
	}

	updateCardValidator(shouldAdd: boolean) {
		if (shouldAdd) {
			this.form['cardNumber'].setValidators([Validators.required, Validators.pattern(OPTIONS.panCardPattern)]);
		} else {
			this.form['cardNumber'].clearValidators();
		}
		this.form['cardNumber'].updateValueAndValidity();
	}
	onSubmit(): void {
		this.form['remark'].clearValidators();
		this.form['remark'].updateValueAndValidity();
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/kyc` : `/kyc`;
		this.kycService.create(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.updateCardValidator(false);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.panCard = result.data;
				this.dataForm.patchValue(result.data);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.verificationDetailsService.showCompleteModal('pan-card', 'pending', 1);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	update(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/kyc/${this.form['id'].value}`
			: `/kyc/${this.form['id'].value}`;
		this.kycService.update(this.dataForm.value, url).subscribe({
			next: (result) => {
				this.updateCardValidator(false);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.panCard = result.data;
				this.dataForm.patchValue(result.data);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	openConfirmStatus(status) {
		if ([verificationLevel.CLEAR_REPORT, verificationLevel.MAJOR_DISCREPANCY].includes(status)) {
			const modalRef = this.modalService.open(AlertModalComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
			modalRef.componentInstance.description = `${confirmMessages.hideDescription}${
				status === verificationLevel.CLEAR_REPORT ? 'approve' : 'reject'
			} ? \n`;
			modalRef.componentInstance.okText = 'Yes';
			modalRef.componentInstance.cancelText = 'Cancel';
			modalRef.result.then(
				(result) => {
					let payload = {
						status,
						id: this.form['id'].value,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		} else {
			const modalRef = this.modalService.open(ChangeStatusComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.modelData = this.dataForm.getRawValue();
			modalRef.result.then(
				(result) => {
					let payload = {
						status: result.status,
						id: this.form['id'].value,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		}
	}
	patch(payload) {
		this.kycService.patch(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(result.data.status);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('pan-card', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	openConfirmDelete() {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} this ? This will erase all the saved changes.`;
		modalRef.componentInstance.okText = 'Delete';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.componentInstance.iconName = 'ant-design:delete-outlined';
		modalRef.componentInstance.customClass = 'fs-1 text-danger';
		modalRef.result.then(
			(result) => {
				this.delete();
			},
			(dismiss) => {}
		);
	}
	delete(): void {
		const url = `/kyc/${this.form['id'].value}`;
		this.kycService.delete(url).subscribe({
			next: (result) => {
				this.dataForm.enable();
				this.dataForm.reset();
				this.updateCardValidator(true);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationDetailsService.updateCheckList('pan-card', null);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	goBack() {
		this.location.back();
	}
	goNext() {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.verificationDetailsService.navigateToNext(path, 'pan-card', this.userData);
	}

	downloadDocument(url: string) {
		window.open(url, '_blank');
	}

	showImage(file) {
		const modalRef = this.modalService.open(FileViewerComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.files = [file];
		modalRef.componentInstance.fileType = 'images';
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.PAN_CARD)
		);
	}
}
