import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AddressService } from 'src/app/core/services/address.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import {
	selfVerificationDocument,
	planFeatures,
	kycStatus,
	OPTIONS,
	ROLES,
	SERVICES,
	confirmMessages,
	verificationLevel,
	accommodationType,
	addressTypeList,
	ownershipType,
} from 'src/app/helpers';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { SharedService } from 'src/app/core/services/shared.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-physical-verification',
	templateUrl: './physical-verification.component.html',
	styleUrls: ['./physical-verification.component.scss'],
})
export class PhysicalVerificationComponent implements OnInit {
	businessDocuments = [
		{
			label: 'Image of Home Exterior',
			mediaType: selfVerificationDocument.FRONT_HOUSE,
		},
		{
			label: 'Image of Home Interior',
			mediaType: selfVerificationDocument.INSIDE_HOUSE,
		},
		{
			label: 'Attachment from vendor',
			mediaType: 'attachment',
		},
	];
	userData: any = {};
	dataForm = new FormGroup({
		id: new FormControl(null),
		type: new FormControl(planFeatures.PHYSICAL_VERIFICATION),
		verificationMedia: new FormArray([]),
		additionalDetails: new FormGroup({
			formattedAddress: new FormControl(),
		}),
		geometry: new FormControl(),
		latitude: new FormControl(),
		longitude: new FormControl(),
		userId: new FormControl(),
		status: new FormControl(''),
		remark: new FormControl(),
		periodOfStay: new FormGroup({
			years: new FormControl(''),
			months: new FormControl(''),
		}),
		accommodationType: new FormControl(),
		addressType: new FormControl(),
		ownershipType: new FormControl(),
		physicalVerificationAddress: new FormGroup({
			addressLine1: new FormControl('', [Validators.required]),
			addressLine2: new FormControl(''),
			city: new FormControl('', [Validators.required]),
			state: new FormControl('', [Validators.required]),
			pincode: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{2}[0-9]{3}$/)]),
			countryName: new FormControl('India', [Validators.required]),
			countryCode: new FormControl('IN'),
			periodOfStay: new FormGroup({
				years: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
				months: new FormControl('', [Validators.required]),
			}),
			accommodationType: new FormControl('', [Validators.required]),
			addressType: new FormControl('', [Validators.required]),
			ownershipType: new FormControl('', [Validators.required]),
			isSameAsPermanent: new FormControl(false),
		}),
		verifier: new FormGroup({
			name: new FormControl(''),
			countryCode: new FormControl('91'),
			mobileNumber: new FormControl(''),
			designation: new FormControl(''),
		}),
		verifierType: new FormControl('field_officer'),
		vendorId: new FormControl(''),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	errorMessages = businessDocumentsFieldForm;
	userId = null;
	kycStatus = kycStatus;
	imageType = OPTIONS.imageType;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	currentUser: any;
	roles = ROLES;
	websiteLink: string;
	accommodationType = Object.values(accommodationType);
	addressType = Object.values(addressTypeList);
	ownershipType = Object.values(ownershipType);
	months = Array.from(Array(12).keys());
	userAddress: any = [];
	isMobileNumberValid: boolean = false;
	verificationLevel = verificationLevel;
	aadharCard: any = null;
	vendorList = [];
	page: number = 1;
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
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private userService: UserService,
		private clipboard: Clipboard,
		private sharedService: SharedService,
		private kycService: KycService,
		private vendorService: VendorService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
		this.addItems();
	}
	get formVerifier() {
		return this.dataForm.controls['verifier']['controls'];
	}
	receiveValidNumberEvent($event: any) {
		this.isMobileNumberValid = $event;
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
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	get form() {
		return this.dataForm.controls;
	}
	get periodOfStayForm() {
		return this.dataForm.controls['periodOfStay']['controls'];
	}
	get additionalFormattedAddress() {
		return this.dataForm.controls['additionalDetails']['controls'];
	}
	get physicalVerificationAddress() {
		return this.dataForm.controls['physicalVerificationAddress']['controls'];
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(''),
			filePath: new FormControl('', item?.id ? [Validators.required] : null),
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: new FormControl(''),
			status: new FormControl('pending'),
			mediaType: new FormControl(item.mediaType, [Validators.required]),
		});
	}
	addItems(): void {
		this.businessDocuments.forEach((element) => {
			this.verificationMedia.push(this.createItem(element));
		});
	}
	searchPincode() {
		this.spinnerService.start();
		if (this.physicalVerificationAddress['pincode'].value.toString().length < 6) {
			return;
		}
		this.sharedService.searchPincode(this.physicalVerificationAddress['pincode'].value).subscribe(
			(result) => {
				if (result.PostOffice) {
					this.physicalVerificationAddress['city'].setValue(result.PostOffice[0].District);
					this.physicalVerificationAddress['state'].setValue(result.PostOffice[0].State);
				} else if (result.Status === 'Error') {
					this.toastService.error('Invalid pincode');
				}
				this.spinnerService.stop();
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
	getAadhaarData() {
		const payload = {
			userId: this.userId,
			type: planFeatures.AADHAR_CARD,
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role)
				? `/admin/kyc/${planFeatures.AADHAR_CARD}`
				: `/kyc/${planFeatures.AADHAR_CARD}`,
		};
		this.kycService.getType(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();

				if (result.data) {
					this.aadharCard = result.data;
					this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
					this.physicalVerificationAddress['pincode'].setValue(
						this.aadharCard.additionalDetails.address.pincode
					);
					this.physicalVerificationAddress['addressLine1'].setValue(
						`${this.aadharCard.additionalDetails.address.house},${this.aadharCard.additionalDetails.address.loc}`
					);
					this.physicalVerificationAddress['addressLine2'].setValue(
						`${this.aadharCard.additionalDetails.address.landmark},${this.aadharCard.additionalDetails.address.street}`
					);
					this.searchPincode();
				} else {
					this.toastService.error('Need to enter Aadhaar details');
					this.dataForm.get('physicalVerificationAddress.isSameAsPermanent').setValue(false);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
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
					this.verificationData = result.data[0];
					this.dataForm.patchValue(result.data[0]);

					this.businessDocuments.forEach((element, index) => {
						let item = result.data[0].verificationMedia.find(
							(access) => access.mediaType === element.mediaType
						);
						if (item) {
							this.verificationMedia.controls[index].patchValue(item);
						}
					});
					this.loadVendorData();
					if (result.data[0].additionalDetails && result.data[0].additionalDetails != 'null') {
						const address = JSON.parse(result.data[0].additionalDetails).formattedAddress;
						this.additionalFormattedAddress['formattedAddress'].setValue(address);
						if (result.data[0].geometry && result.data[0].geometry.coordinates) {
							this.form['latitude'].setValue(result.data[0].geometry.coordinates[0]);
							this.form['longitude'].setValue(result.data[0].geometry.coordinates[1]);
						}
					}
					if (
						![
							ROLES.PROTO_SUPER_ADMIN,
							ROLES.PROTO_ADMIN,
							ROLES.PROTO_USER,
							ROLES.EMPLOYEE,
							ROLES.PROTO_OPERATION,
						].includes(this.currentUser.role)
					) {
						this.dataForm.disable();
					}
					this.form['vendorId'].setValidators([Validators.required]);
					this.form['vendorId'].updateValueAndValidity();
				} else {
					this.loadVendorData();
				}
				if (result.websiteLink) {
					this.websiteLink = result.websiteLink;
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	loadVendorData(filters = {}): void {
		let params = {
			start: (this.pageVendor - 1) * this.pageSizeVendor,
			limit: this.pageSizeVendor,
			...filters,
			designation: this.form['verifierType'].value,
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
		this.form['vendorId'].setValue('');
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

	copyLink(): void {
		this.clipboard.copy(this.websiteLink);
		this.toastService.success('Link copied');
	}
	patchOptionalAddress($event) {
		if ($event.target.checked) {
			if (!this.aadharCard) {
				this.getAadhaarData();
			}
		} else {
		}
	}
	onSubmit(): void {
		this.form['remark'].clearValidators();
		this.form['remark'].updateValueAndValidity();
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.verificationMediaService.createBulk(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationData = result.data;
				this.dataForm.patchValue(result.data);
				if (result.websiteLink) {
					this.websiteLink = result.websiteLink;
				}
				this.verificationDetailsService.showCompleteModal('physical-verification', 'pending', 1);
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
				this.verificationDetailsService.updateCheckList('physical-verification', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'physical-verification', this.userData);
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

	sendEmailToVendor() {
		this.spinnerService.stop();
		this.verificationDetailsService
			.sendReportToVendor({
				id: this.form['id'].value,
				type: this.form['type'].value,
			})
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
			!this.assignedVerificationChecks.includes(this.planFeatures.PHYSICAL_VERIFICATION)
		);
	}
}
