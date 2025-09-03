import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbInputDatepickerConfig, NgbCalendar, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { UploadService, UserService } from 'src/app/core';
import { KycService } from 'src/app/core/services/kyc.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { confirmMessages, planFeatures, kycStatus, OPTIONS, SERVICES, ROLES, verificationLevel } from 'src/app/helpers';
import { kycFieldForm } from 'src/app/helpers/form-error.helper';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ChangeStatusComponent } from '../change-status/change-status.component';

@Component({
	selector: 'app-driving-license',
	templateUrl: './driving-license.component.html',
	styleUrls: ['./driving-license.component.scss'],
	providers: [NgbInputDatepickerConfig], // add config to the component providers
})
export class DrivingLicenseComponent implements OnInit {
	userData: any = {};
	errorMessages = kycFieldForm;
	isDraft = true;
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.DRIVING_LICENSE),
		cardNumber: new FormControl('', [Validators.required]),
		frontImage: new FormControl(null),
		backImage: new FormControl(null),
		additionalAttachment: new FormControl(null),
		rto: new FormControl(''),
		city: new FormControl(),
		state: new FormControl(),
		dateOfBirth: new FormControl('', [Validators.required]),
		selectedDate: new FormControl(),
		additionalDetails: new FormControl(),
		userId: new FormControl(),
		status: new FormControl(''),
		remark: new FormControl(),
		fullName: new FormControl(),
		dlNumber: new FormControl(),
		bloodGroup: new FormControl(),
		issueDate: new FormControl(),
		userAddress: new FormControl(),
		dob: new FormControl(),
		expiryDate: new FormControl(),
		vehicalCategory: new FormControl(),
		isDraft: new FormControl(),
	});
	userId = null;
	maxDate;
	minDate = { year: 1950, month: 1, day: 1 };
	kycStatus = kycStatus;
	roles = ROLES;
	currentUser: any;
	drivingLicense: any = null;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
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
		config: NgbInputDatepickerConfig,
		private verificationDetailsService: VerificationDetailsService
	) {
		this.maxDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
		config.maxDate = this.maxDate;
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

	get form() {
		return this.dataForm.controls;
	}

	changeDate() {
		this.form['dateOfBirth'].setValue(this.form['selectedDate'].value);
	}
	setDisplayDate(value: string) {
		let newDate = new Date(value);
		if (value) {
			return {
				day: newDate.getDate(),
				month: newDate.getMonth() + 1,
				year: newDate.getFullYear(),
			};
		}
		return null;
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
					this.drivingLicense = result.data;
					this.dataForm.patchValue(result.data);
					let additionalDetails = JSON.parse(result.data.additionalDetails);
					this.form['additionalDetails'].setValue(additionalDetails);
					this.form['state'].setValue(additionalDetails?.state);
					this.form['fullName'].setValue(additionalDetails?.user_full_name);
					this.form['dlNumber'].setValue(additionalDetails?.dl_number);
					this.form['bloodGroup'].setValue(additionalDetails?.user_blood_group);
					this.form['issueDate'].setValue(additionalDetails?.issued_date);
					this.form['userAddress'].setValue(additionalDetails?.user_address);
					this.form['dob'].setValue(additionalDetails?.user_dob);
					this.form['expiryDate'].setValue(additionalDetails?.expiry_date);
					this.form['vehicalCategory'].setValue(additionalDetails?.vehicle_category_details);
					const dob = additionalDetails.user_dob.split('-');
					if (additionalDetails?.dl_number) {
						this.form['dateOfBirth'].setValue(`${dob[2]}-${dob[1]}-${dob[0]}`);
					} else {
						this.form['dateOfBirth'].setValue(`${dob[0]}-${dob[1]}-${dob[2]}`);
					}
					this.form['selectedDate'].setValue(this.form['dateOfBirth'].value);
				}
				if (
					![
						ROLES.PROTO_SUPER_ADMIN,
						ROLES.PROTO_ADMIN,
						ROLES.PROTO_USER,
						ROLES.PROTO_OPERATION,
						ROLES.EMPLOYEE,
						ROLES.CLIENT_SUPER_ADMIN,
						ROLES.CLIENT_ADMIN,
						ROLES.CLIENT_USER,
						ROLES.CLIENT_USER_VIEW,
					].includes(this.currentUser.role)
				) {
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
	clearFile(controlName) {
		this.form[controlName].setValue('');
	}
	get vehicles() {
		return this.form['vehicalCategory']?.value?.map((e) => e.cov);
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}

	uploadFile(event, type, isDraft: boolean = false) {
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
				this.form[type].setValue(value.cdn);
				if ([ROLES.EMPLOYEE].includes(this.currentUser.role) && this.form['id'].value) {
					this.onSubmit(isDraft);
				}
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	onSubmit(isDraft: boolean = false): void {
		this.form['remark'].clearValidators();
		this.form['remark'].updateValueAndValidity();
		if (![ROLES.EMPLOYEE].includes(this.currentUser.role) && isDraft) {
			this.form['additionalAttachment'].setValidators([Validators.required]);
		} else {
			this.form['additionalAttachment'].clearValidators();
		}
		this.form['additionalAttachment'].updateValueAndValidity();

		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		let payload = this.dataForm.getRawValue();
		if (isDraft) {
			if (!payload.additionalDetails) {
				payload.additionalDetails = {};
			}
			payload.additionalDetails.user_dob = this.form['dateOfBirth'].value;
		}
		payload.isDraft = isDraft;
		if (this.form['id'].value === null) this.create(payload);
		else this.update(payload);
	}

	create(payload): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/kyc` : `/kyc`;
		this.kycService.create(payload, url).subscribe({
			next: (result) => {
				this.drivingLicense = result.data;
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				let additionalDetails = JSON.parse(result.data.additionalDetails);
				this.form['additionalDetails'].setValue(additionalDetails);
				this.form['state'].setValue(additionalDetails?.state);
				this.form['fullName'].setValue(additionalDetails?.user_full_name);
				this.form['dlNumber'].setValue(additionalDetails?.dl_number);
				this.form['bloodGroup'].setValue(additionalDetails?.user_blood_group);
				this.form['issueDate'].setValue(additionalDetails?.issued_date);
				this.form['userAddress'].setValue(additionalDetails?.user_address);
				this.form['dob'].setValue(additionalDetails?.user_dob);
				this.form['expiryDate'].setValue(additionalDetails?.expiry_date);
				this.form['vehicalCategory'].setValue(additionalDetails?.vehicle_category_details);
				const dob = additionalDetails.user_dob.split('-');
				if (additionalDetails?.dl_number) {
					this.form['dateOfBirth'].setValue(`${dob[2]}-${dob[1]}-${dob[0]}`);
				} else {
					this.form['dateOfBirth'].setValue(`${dob[0]}-${dob[1]}-${dob[2]}`);
				}
				this.form['selectedDate'].setValue(this.form['dateOfBirth'].value);
				this.verificationDetailsService.updateCheckList('driving-license', null);
				this.verificationDetailsService.showCompleteModal('driving-license', 'pending', 1);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	update(payload): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/kyc/${this.form['id'].value}`
			: `/kyc/${this.form['id'].value}`;
		this.kycService.update(payload, url).subscribe({
			next: (result) => {
				this.drivingLicense = result.data;
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				let additionalDetails = JSON.parse(result.data.additionalDetails);
				this.form['additionalDetails'].setValue(additionalDetails);
				this.form['state'].setValue(additionalDetails?.state);
				const dob = additionalDetails.user_dob.split('-');
				if (additionalDetails?.dl_number) {
					this.form['dateOfBirth'].setValue(`${dob[2]}-${dob[1]}-${dob[0]}`);
				} else {
					this.form['dateOfBirth'].setValue(`${dob[0]}-${dob[1]}-${dob[2]}`);
				}
				//this.form['dateOfBirth'].setValue(`${dob[2]}-${dob[1]}-${dob[0]}`);
				this.form['selectedDate'].setValue(this.form['dateOfBirth'].value);
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
				this.verificationDetailsService.updateCheckList('driving-license', this.form['status'].value);
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
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationDetailsService.updateCheckList('driving-license', null);
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
		this.verificationDetailsService.navigateToNext(path, 'driving-license', this.userData);
	}
	downloadDocument(url: string) {
		if (url) {
			window.open(url, '_blank');
		}
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
			!this.assignedVerificationChecks.includes(this.planFeatures.DRIVING_LICENSE)
		);
	}
}
