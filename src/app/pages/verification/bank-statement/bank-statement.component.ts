import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { confirmMessages, planFeatures, kycStatus, OPTIONS, SERVICES, ROLES, verificationLevel } from 'src/app/helpers';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Location } from '@angular/common';
import { kycFieldForm } from 'src/app/helpers/form-error.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { ChangeStatusComponent } from '../change-status/change-status.component';

@Component({
	selector: 'app-bank-statement',
	templateUrl: './bank-statement.component.html',
	styleUrls: ['./bank-statement.component.scss'],
})
export class BankStatementComponent implements OnInit {
	@ViewChild('frontFileInput') frontFileInput: ElementRef;

	userData: any = {};
	errorMessages = kycFieldForm;
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.BANK_STATEMENT),
		cardNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.accountNumberPattern)]),
		frontImage: new FormControl('', [Validators.required]),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(),
	});
	userId = null;
	kycStatus = kycStatus;
	currentUser: any;
	verificationLevel = verificationLevel;
	roles = ROLES;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	bankStatement = null;
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
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
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
					this.updateCardValidator(false);
					this.bankStatement = result.data;
					this.dataForm.patchValue(result.data);
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
	uploadFile(event, name = null) {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkImageType(file) && this.uploadService.checkDocumentType(file)) {
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
				if (!name) this.form['frontImage'].setValue(value.cdn);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	clearFile(name) {
		this.form[name].setValue('');
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
				this.toastService.success('bank statement details added successfully');
				this.bankStatement = result.data;
				this.dataForm.patchValue(result.data);
				this.verificationDetailsService.updateCheckList('bank-statement', null);
				this.verificationDetailsService.showCompleteModal('bank-statement', 'pending', 1);
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
				this.toastService.success('bank statement details added successfully');
				this.bankStatement = result.data;
				this.dataForm.patchValue(result.data);
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
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('bank-statement', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'bank-statement', this.userData);
	}

	downloadDocument(url: string) {
		window.open(url, '_blank');
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.BANK_STATEMENT)
		);
	}
}
