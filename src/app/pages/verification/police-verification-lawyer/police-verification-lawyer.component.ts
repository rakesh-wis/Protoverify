import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import { planFeatures, kycStatus, OPTIONS, SERVICES, confirmMessages, ROLES, verificationLevel } from 'src/app/helpers';
import { businessDocumentsFieldForm, kycFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { KycService } from 'src/app/core/services/kyc.service';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-police-verification-lawyer',
	templateUrl: './police-verification-lawyer.component.html',
	styleUrls: ['./police-verification-lawyer.component.scss'],
})
export class PoliceVerificationLawyerComponent implements OnInit {
	businessDocuments = [
		{
			label: 'Police verification Certificate',
			mediaType: 'police_verification_certificate_lawyer',
		},
	];
	userData: any = {};
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER),
		comment: new FormControl(''),
		verificationMedia: new FormArray([]),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(''),
		policeStationDateOfVisit: new FormControl('', [Validators.required]),
		policeStationName: new FormControl(''),
		policeStationCountryCode: new FormControl('91'),
		policeStationNumber: new FormControl('', [Validators.required]),
		policeStationAuthorityName: new FormControl('', [Validators.required]),
		policeStationAuthorityDesignation: new FormControl('', [Validators.required]),
		// policeStationYearCovered: new FormControl('', [Validators.required]),
		policeStationVerificationResult: new FormControl('', [Validators.required]),
		selectedDate: new FormControl(),
		vendorId: new FormControl('', [Validators.required]),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	errorMessages = businessDocumentsFieldForm;
	userId = null;
	kycStatus = kycStatus;
	currentUser: any;
	roles = ROLES;

	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	verificationLevel = verificationLevel;
	isMobileNumberValid: boolean = false;
	policeStationYearCovered = Array.from({ length: 10 }, (_, i) => i);
	policeStationVerificationResult = [
		{ label: 'No criminal record found', name: verificationLevel.CLEAR_REPORT, color: '#12B76A' },
		{ label: 'Criminal record found', name: verificationLevel.MAJOR_DISCREPANCY, color: '#dd2025' },
	];
	aadharCard: any = {};
	vendorList = [];
	pageVendor: number = 1;
	pageSizeVendor: number = 20;
	collectionSizeVendor: number;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	verificationData = null;
	constructor(
		private formBuilder: FormBuilder,
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private verificationDetailsService: VerificationDetailsService,
		private verificationMediaService: VerificationMediaService,
		private location: Location,
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private kycService: KycService,
		private vendorService: VendorService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
		// this.addItems();
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['userId'].setValue(this.userId);
			this.getData();
			this.getAadharData();
			this.loadVendorData();
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
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			fileType: new FormControl(item.fileType),
			filePath: new FormControl(item.filePath),
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: new FormControl(item.fileSize),
			status: new FormControl('pending'),
			mediaType: new FormControl('police_verification_certificate_lawyer'),
		});
	}
	setDisplayDate(value: string) {
		let newDate = new Date(value);
		console.log(newDate);
		if (value) {
			return {
				day: newDate.getDate(),
				month: newDate.getMonth() + 1,
				year: newDate.getFullYear(),
			};
		}
		return null;
	}
	getAadharData() {
		const payload = {
			userId: this.userId,
			type: planFeatures.AADHAR_CARD,
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role)
				? `/admin/kyc/${planFeatures.AADHAR_CARD}`
				: `/kyc/${planFeatures.AADHAR_CARD}`,
		};
		this.kycService.getType(payload).subscribe({
			next: (result) => {
				if (result.data) {
					this.aadharCard = result.data;
					this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
				}
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
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
					result.data[0].verificationMedia.forEach((element, index) => {
						this.verificationMedia.push(this.createItem(element));
					});
					this.verificationData = result.data[0];
					this.dataForm.patchValue(result.data[0]);
					this.form['selectedDate'].setValue(this.form['policeStationDateOfVisit'].value);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	setControl(file, isToRemove, index): void {
		if (isToRemove) {
			file.fileType = '';
			file.filePath = '';
			file.fileName = 'Select file';
			file.fileSize = '';
			file.status = 'deleted';
		}
		this.verificationMedia.controls[index].setValue({
			id: this.verificationMedia.controls[index].value.id,
			fileType: file.fileType,
			filePath: file.filePath,
			fileName: file.fileName,
			fileSize: file.fileSize,
			status: file.status ? file.status : 'pending',
			label: this.verificationMedia.controls[index].value.label,
			mediaType: this.verificationMedia.controls[index].value.mediaType,
		});
	}
	uploadFile(event: any): void {
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
				let payload = {
					fileType: file.type,
					filePath: value.cdn,
					fileName: file.name,
					fileSize: file.size,
				};
				this.verificationMedia.push(this.createItem(payload));
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	changeValidityComment() {
		if (this.form['policeStationVerificationResult'].value === verificationLevel.MAJOR_DISCREPANCY) {
			this.form['comment'].setValidators([Validators.required]);
		} else {
			this.form['comment'].clearValidators();
		}
		this.form['comment'].updateValueAndValidity();
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	changeDate() {
		this.form['policeStationDateOfVisit'].setValue(this.form['selectedDate'].value);
	}
	onSubmit(): void {
		this.changeValidityComment();
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.form['status'].setValue(this.form['policeStationVerificationResult'].value);
		this.verificationMediaService.createBulk(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.verificationData = result.data;
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.form['selectedDate'].setValue(this.form['policeStationDateOfVisit'].value);
				this.toastService.success(result.message);
				this.verificationDetailsService.showCompleteModal('police-lawyer', 'pending', 1);
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
		this.verificationDetailsService.patch(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(result.data.status);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('police-lawyer', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'police-lawyer', this.userData);
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
	loadVendorData(filters = {}): void {
		let params = {
			start: (this.pageVendor - 1) * this.pageSizeVendor,
			limit: this.pageSizeVendor,
			...filters,
			designation: 'vendor',
		};
		this.spinnerService.start();
		this.vendorService.list(params).subscribe({
			next: (result) => {
				this.vendorList = [...this.vendorList, ...result.data['rows']];
				this.collectionSizeVendor = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchVendor($event) {
		this.loadVendorData({ search: $event.term });
	}
	onChangeVerificationType() {
		this.vendorList = [];
		this.collectionSizeVendor = 0;
		this.loadVendorData();
	}
	onScrollVendor() {
		if (this.vendorList.length === this.collectionSizeVendor) {
			return;
		}
		this.pageVendor++;
		this.loadVendorData();
	}
	sendEmailToVendor() {
		this.spinnerService.stop();
		this.verificationDetailsService
			.sendReportToVendor({ id: this.form['id'].value, type: this.form['type'].value })
			.subscribe({
				next: (result) => {
					this.spinnerService.stop();
					this.toastService.success(result.message);
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER)
		);
	}
}
