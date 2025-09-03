import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { kycStatus, ROLES, confirmMessages, planFeatures, verificationLevel } from 'src/app/helpers';
import { bankDetailsFieldForm, verificationFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { CourtListComponent } from '../court-list/court-list.component';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';

@Component({
	selector: 'app-crime-check',
	templateUrl: './crime-check.component.html',
	styleUrls: ['./crime-check.component.scss'],
})
export class CrimeCheckComponent implements OnInit {
	userData: any = {};
	errorMessages = verificationFieldForm;
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.COURT_CHECK),
		comment: new FormControl(),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(),
		courtCheck: new FormControl([], [Validators.required]),
		verificationMedia: new FormControl([]),
		vendorId: new FormControl('', [Validators.required]),
	});
	// verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	userId = null;
	bankDetails: any = null;
	kycStatus = kycStatus;
	roles = ROLES;
	currentUser: any;

	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	verificationLevel = verificationLevel;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	crimeCheck = null;
	constructor(
		private formBuilder: FormBuilder,
		modalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private router: Router,
		private verificationDetailsService: VerificationDetailsService,
		private verificationMediaService: VerificationMediaService
	) {
		modalConfig.backdrop = 'static';
		modalConfig.keyboard = false;
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

	getData() {
		const params = {
			userId: this.userId,
			type: this.form['type'].value,
		};
		this.verificationDetailsService.list(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data && result.data.length > 0) {
					this.crimeCheck = result.data[0];
					this.dataForm.patchValue(result.data[0]);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if (this.form['id'].value === null) this.create();
		else this.update();
	}
	create() {
		this.spinnerService.start();
		this.verificationDetailsService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.crimeCheck = result.data;
				this.dataForm.patchValue(result.data);
				this.verificationDetailsService.showCompleteModal('court-check', 'pending', 1);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	update() {
		this.spinnerService.start();
		this.verificationMediaService.createBulk(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.crimeCheck = result.data;
				this.toastService.success(result.message);
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
			modalRef.componentInstance.description = `${
				confirmMessages.hideDescription
			} save status as ${verificationLevel.CLEAR_REPORT.replace(/_/g, ' ')} ? \n`;
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
		this.verificationDetailsService.patch(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('court-check', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: [item.fileType],
			filePath: [item.filePath],
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: [item.fileSize],
			status: new FormControl(item.status || 'pending'),
			mediaType: new FormControl(item.mediaType, [Validators.required]),
		});
	}
	openCourtList() {
		const modalRef = this.modalService.open(CourtListComponent, {
			centered: true,
			size: 'xl',
			backdrop: 'static',
		});
		modalRef.componentInstance.id = this.form['id'].value;
		modalRef.componentInstance.modelData = this.form['courtCheck'].value || [];
		modalRef.componentInstance.comment = this.form['comment'].value;
		modalRef.componentInstance.verificationMedia = this.form['verificationMedia'].value;
		modalRef.componentInstance.userId = this.userId;
		modalRef.componentInstance.vendorId = this.form['vendorId'].value;
		modalRef.componentInstance.userData = this.userData;
		modalRef.componentInstance.canEdit = true;
		modalRef.result.then(
			(result) => {
				let courts = [];
				result.courtCheck.map((e) => (courts = courts.concat(e.data)));
				this.form['courtCheck'].setValue(courts);
				this.form['comment'].setValue(result.formData.comment);
				this.form['vendorId'].setValue(result.formData.vendorId);
				this.form['verificationMedia'].setValue([result.formData.verificationMedia[0]]);
				// if (this.verificationMedia.controls.values.length > 0) {
				// 	this.verificationMedia.controls[0].setValue(result.formData.verificationMedia[0]);
				// } else {
				// 	this.verificationMedia.controls.push(this.createItem(result.formData.verificationMedia[0]));
				// }
				this.onSubmit();
			},
			(dismiss) => {}
		);
	}

	goBack() {
		this.location.back();
	}

	goNext() {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.verificationDetailsService.navigateToNext(path, 'court-check', this.userData);
	}

	downloadDocument(url: string) {
		window.open(url, '_blank');
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.COURT_CHECK)
		);
	}
}
