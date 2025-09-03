import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { confirmMessages, planFeatures, kycStatus, OPTIONS, SERVICES, ROLES, verificationLevel } from 'src/app/helpers';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Location } from '@angular/common';
import { businessDocumentsFieldForm, kycFieldForm } from 'src/app/helpers/form-error.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-social-media-check',
	templateUrl: './social-media-check.component.html',
	styleUrls: ['./social-media-check.component.scss'],
})
export class SocialMediaCheckComponent implements OnInit {
	userData: any = {};
	errorMessages = businessDocumentsFieldForm;
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.SOCIAL_MEDIA_CHECK),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(''),
		verificationMedia: new FormArray([]),
		vendorId: new FormControl('', [Validators.required]),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	userId = null;
	kycStatus = kycStatus;
	currentUser: any;
	verificationLevel = verificationLevel;
	roles = ROLES;
	aadharCard: any = {};
	businessDocuments = [
		{
			label: 'Attachment',
			mediaType: 'social_media_check',
		},
	];
	vendorList = [];
	pageVendor: number = 1;
	pageSizeVendor: number = 20;
	collectionSizeVendor: number;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	socialMedia = null;
	constructor(
		private formBuilder: FormBuilder,
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private kycService: KycService,
		private userService: UserService,
		private verificationMediaService: VerificationMediaService,
		private verificationDetailsService: VerificationDetailsService,
		private vendorService: VendorService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
		this.addItems();
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['userId'].setValue(this.userId);
			this.getAadharData();
			this.getData();
			this.loadVendorData();
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
	addItems(): void {
		this.businessDocuments.forEach((element) => {
			this.verificationMedia.push(this.createItem(element));
		});
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(item.fileType),
			filePath: new FormControl(item.filePath),
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: new FormControl(item.fileSize),
			status: new FormControl('pending'),
			mediaType: new FormControl(item.mediaType, [Validators.required]),
		});
	}
	setControl(file, isToRemove, index): void {
		if (isToRemove) {
			file.fileType = '';
			file.filePath = '';
			file.fileName = 'Select file';
			file.fileSize = '';
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
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
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
					this.businessDocuments.forEach((element, index) => {
						let item = result.data[0].verificationMedia.find(
							(access) => access.mediaType === element.mediaType
						);
						if (item) {
							this.verificationMedia.controls[index].patchValue(item);
						}
					});
					this.socialMedia = result.data[0];
					this.dataForm.patchValue(result.data[0]);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	uploadFile(event: any, index: number): void {
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
				let payload = {
					fileType: file.type,
					filePath: value.cdn,
					fileName: file.name,
					fileSize: file.size,
				};
				this.setControl(payload, false, index);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.verificationMediaService.createBulk(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.socialMedia = result.data;
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.toastService.success(result.message);
				this.verificationDetailsService.showCompleteModal('social-media-check', 'pending', 1);
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
				this.verificationDetailsService.updateCheckList('social-media-check', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'social-media-check', this.userData);
	}

	downloadDocument(url: string) {
		window.open(url, '_blank');
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
				console.log(this.vendorList);
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
			!this.assignedVerificationChecks.includes(this.planFeatures.SOCIAL_MEDIA_CHECK)
		);
	}
}
