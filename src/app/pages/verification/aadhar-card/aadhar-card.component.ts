import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UploadService, UserService } from 'src/app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import {
	confirmMessages,
	planFeatures,
	kycStatus,
	OPTIONS,
	SERVICES,
	genderType,
	verificationLevel,
} from 'src/app/helpers';
import { kycFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ROLES, defaultStatus } from 'src/app/helpers';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { AadharCardAddressComponent } from '../aadhar-card-address/aadhar-card-address.component';

@Component({
	selector: 'app-aadhar-card',
	templateUrl: './aadhar-card.component.html',
	styleUrls: ['./aadhar-card.component.scss'],
})
export class AadharCardComponent implements OnInit, OnDestroy {
	userData: any = {};
	errorMessages = kycFieldForm;
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.AADHAR_CARD),
		cardNumber: new FormControl('', [Validators.required]),
		frontImage: new FormControl(null),
		backImage: new FormControl(null),
		additionalDetails: new FormControl(),
		userId: new FormControl(),
		requestId: new FormControl(),
		otp: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(),
	});
	userId = null;
	kycStatus = kycStatus;
	genderType = genderType;
	otpSend: boolean = false;
	aadharVerified: boolean = false;
	aadharCard: any = {};
	employeeData: any = {};
	roles = ROLES;
	defaultStatus = defaultStatus;
	duration: number = 90;
	minutes: any = '00';
	seconds: any = '00';
	canResendAadharOTP: boolean = false;
	setTimeOut: any;
	currentUser: any;
	verificationLevel = verificationLevel;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
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
		private employeeService: EmployeeService,
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
			this.userData = {
				id: this.activatedRoute.snapshot.queryParams['id'],
				name: this.activatedRoute.snapshot.queryParams['name'],
			};
			this.form['userId'].setValue(this.userId);
			this.getData();
			this.getEmployeeData();
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
	}

	get form() {
		return this.dataForm.controls;
	}
	toggleResend() {
		this.canResendAadharOTP = !this.canResendAadharOTP;
	}
	startTimer() {
		// this.toggleResend();
		this.setTimeOut = setInterval(() => {
			if (this.duration <= 0) {
				this.stopTimer();
				return;
			} else {
				this.duration--;
				let min = this.duration / 60;
				let sec = this.duration % 60;
				this.minutes = String('0' + Math.floor(min)).slice(-2);
				this.seconds = String('0' + Math.floor(sec)).slice(-2);
			}
		}, 1000);
	}
	ngOnDestroy() {
		clearInterval(this.setTimeOut);
	}
	stopTimer() {
		this.canResendAadharOTP = true;
		clearInterval(this.setTimeOut);
		console.log(this.canResendAadharOTP);
	}

	clearFile(controlName) {
		this.form[controlName].setValue('');
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}

	uploadFile(event, type) {
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
					this.update();
				}
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
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
					this.dataForm.patchValue(result.data);
					this.aadharCard = result.data;
					this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
					this.form['additionalDetails'].setValue(this.aadharCard.additionalDetails);
					if (
						this.currentUser.role === ROLES.EMPLOYEE &&
						this.aadharCard?.additionalDetails?.profilePicture
					) {
						this.aadharVerified = true;
					}
					console.log(this.aadharCard);
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
					this.aadharVerified = true;
					this.updateCardValidator(false);
					this.dataForm.disable();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.requestOtp();
	}
	setDuration() {
		this.duration = 90;
	}
	requestOtp() {
		let params = { cardNumber: this.form['cardNumber'].value };
		this.kycService.requestOtp(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.otpSend = true;
				this.canResendAadharOTP = false;
				this.setDuration();
				this.startTimer();
				if (result.data.isNumberLinked) {
					this.form['requestId'].setValue(result.data.requestId);
					// this.toastService.success(result.message);
				} else {
					this.toastService.error(result.message);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	verifyAadhar() {
		if (!this.form['otp'].value) {
			return;
		}
		this.spinnerService.start();
		let params = {
			otp: this.form['otp'].value,
			cardNumber: this.form['cardNumber'].value,
			requestId: this.form['requestId'].value,
			userId: this.form['userId'].value,
		};
		this.kycService.verifyAadhar(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.aadharVerified = true;
				this.otpSend = false;
				this.dataForm.controls['additionalDetails'].setValue(result.data);
				this.aadharCard = {
					additionalDetails: result.data,
				};
				this.formSubmit();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	updateCardValidator(shouldAdd: boolean) {
		if (shouldAdd) {
			this.form['cardNumber'].setValidators([Validators.required, Validators.pattern(OPTIONS.aadharCardPattern)]);
		} else {
			this.form['cardNumber'].clearValidators();
		}
		this.form['cardNumber'].updateValueAndValidity();
	}
	addAadharCardAddress() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		const modalRef = this.modalService.open(AadharCardAddressComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = this.form['additionalDetails'].value;
		modalRef.result.then(
			(result) => {
				this.dataForm.controls['additionalDetails'].setValue(result);
				this.formSubmit();
			},
			(dismiss) => {}
		);
	}
	formSubmit() {
		this.form['remark'].clearValidators();
		this.form['remark'].updateValueAndValidity();
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if (this.form['id'].value === null) this.create();
		else this.update();
	}
	create(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/kyc` : `/kyc`;
		this.kycService.create(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.aadharCard = result.data;
				this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
				this.dataForm.patchValue(this.aadharCard);
				this.updateEmployee();
				this.updateCardValidator(false);
				this.verificationDetailsService.updateCheckList('aadhar-card', this.form['status'].value);
				this.verificationDetailsService.showCompleteModal('aadhar-card', this.form['status'].value, 1);
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
		this.kycService.update(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.updateCardValidator(false);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				this.aadharCard = result.data;
				this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
				this.form['additionalDetails'].setValue(this.aadharCard.additionalDetails);
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
					this.aadharVerified = true;
					this.updateCardValidator(false);
				}
				this.verificationDetailsService.updateCheckList('aadhar-card', this.form['status'].value);
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
				this.aadharCard = null;
				this.otpSend = false;
				this.aadharVerified = false;
				this.dataForm.reset();
				this.updateCardValidator(true);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationDetailsService.updateCheckList('aadhar-card', null);
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
		this.verificationDetailsService.navigateToNext(path, 'aadhar-card', this.userData);
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
	getEmployeeData() {
		this.employeeService.getById(this.userId).subscribe({
			next: (result) => {
				this.employeeData = result.data;
			},
			error: (error) => {},
		});
	}
	// call to add employee Id
	updateEmployee(): void {
		if (this.form['additionalDetails'].value) {
			this.employeeData['aadharImage'] = this.form['additionalDetails'].value.profilePicture;
			this.employeeData.name = this.form['additionalDetails'].value.fullName;
			this.userData['name'] = this.form['additionalDetails'].value.fullName;
			this.router.navigate([], {
				relativeTo: this.activatedRoute,
				queryParams: {
					id: this.userData.id,
					name: this.employeeData['name'],
				},
				queryParamsHandling: 'merge', // remove to replace all query params by provided
			});
			this.employeeService.update(this.employeeData).subscribe();
		}
	}

	get showApprovedReject(): Boolean {
		if (
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN].includes(this.currentUser.role) &&
			this.dataForm.value.status == defaultStatus.PENDING
		) {
			return true;
		}
		return false;
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.AADHAR_CARD)
		);
	}
}
