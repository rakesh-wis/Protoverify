import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import {
	planFeatures,
	kycStatus,
	OPTIONS,
	SERVICES,
	confirmMessages,
	selfVerificationDocument,
	ROLES,
	verificationLevel,
	accommodationType,
	addressTypeList,
	ownershipType,
} from 'src/app/helpers';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';

@Component({
	selector: 'app-self',
	templateUrl: './self.component.html',
	styleUrls: ['./self.component.scss'],
})
export class SelfComponent implements OnInit {
	businessDocuments = [
		{
			label: 'Image of Home Exterior',
			mediaType: selfVerificationDocument.FRONT_HOUSE,
		},
		{
			label: 'Image of Home Interior',
			mediaType: selfVerificationDocument.INSIDE_HOUSE,
		},
	];
	userData: any = {};
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.SELF_VERIFICATION),
		verificationMedia: new FormArray([]),
		additionalDetails: new FormControl(),
		geometry: new FormControl(),
		latitude: new FormControl(),
		longitude: new FormControl(),
		addressLine1: new FormControl('', [Validators.required]),
		pincode: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{2}[0-9]{3}$/)]),
		userId: new FormControl(),
		status: new FormControl(''),
		remark: new FormControl(),
		periodOfStay: new FormGroup({
			years: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
			months: new FormControl('', [Validators.required]),
		}),
		accommodationType: new FormControl('', [Validators.required]),
		addressType: new FormControl('', [Validators.required]),
		ownershipType: new FormControl('', [Validators.required]),
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
	verificationLevel = verificationLevel;
	accommodationType = Object.values(accommodationType);
	addressType = Object.values(addressTypeList);
	ownershipType = Object.values(ownershipType);
	months = Array.from(Array(12).keys());
	hasLocationAccess: boolean = false;
	@ViewChild('fileInput0') private fileInput0: ElementRef;
	@ViewChild('fileInput1') private fileInput1: ElementRef;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	selfVerification = null;
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
		private userService: UserService
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
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(''),
			filePath: new FormControl('', !['gst_certificate'].includes(item.mediaType) ? [Validators.required] : []),
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
					this.selfVerification = result.data[0];
					this.dataForm.patchValue(result.data[0]);
					this.form['additionalDetails'].setValue(JSON.parse(result.data[0].additionalDetails));
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
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	private setCurrentLocation(index) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				this.form['longitude'].setValue(position.coords.longitude);
				this.form['latitude'].setValue(position.coords.latitude);
				this.getAddress({ latitude: position.coords.longitude, longitude: position.coords.latitude });
				if (!this.hasLocationAccess) {
					this.hasLocationAccess = true;
					if (index === 0) {
						this.fileInput0.nativeElement.click();
					}
					if (index === 1) {
						this.fileInput1.nativeElement.click();
					}
				}
			});
		}
	}

	handlePermission(index) {
		navigator.permissions.query({ name: 'geolocation' }).then((result) => {
			if (result.state == 'granted') {
				this.setCurrentLocation(index);
			} else if (result.state == 'prompt') {
				this.setCurrentLocation(index);
			} else if (result.state == 'denied') {
				this.toastService.error('Geolocation is not enabled');
			}
		});
	}
	openCamera(index) {
		if (!this.hasLocationAccess) {
			this.handlePermission(index);
		} else {
			if (index === 0) {
				this.fileInput0.nativeElement.click();
			}
			if (index === 1) {
				this.fileInput1.nativeElement.click();
			}
		}
	}
	getAddress({ latitude, longitude }): void {
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
			if (status === 'OK') {
				if (results[0]) {
					// console.log('address selected', results[0].formatted_address);
					this.form['additionalDetails'].setValue({
						formattedAddress: results[0].formatted_address,
						addressComponent: results[0].address_components,
					});
				} else {
					this.toastService.error('No address found');
				}
			} else {
				this.toastService.error('Try after some time');
			}
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
	uploadFile(event: any, index: number): void {
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
				this.setControl(payload, false, index);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
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
				this.selfVerification = result.data;
				this.dataForm.patchValue(result.data);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.verificationDetailsService.showCompleteModal('self-verification', 'pending', 1);
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
					this.verificationDetailsService.updateCheckList('self-verification');
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('self-verification', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'self-verification', this.userData);
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
			!this.assignedVerificationChecks.includes(this.planFeatures.SELF_VERIFICATION)
		);
	}
}
