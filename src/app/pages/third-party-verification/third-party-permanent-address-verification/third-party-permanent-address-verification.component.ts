import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { JwtService, UploadService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import {
	selfVerificationDocument,
	planFeatures,
	kycStatus,
	OPTIONS,
	ROLES,
	SERVICES,
	accommodationType,
	addressTypeList,
	ownershipType,
} from 'src/app/helpers';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { environment } from 'src/environments/environment';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';

declare const google: any;
@Component({
	selector: 'app-third-party-permanent-address-verification',
	templateUrl: './third-party-permanent-address-verification.component.html',
	styleUrls: ['./third-party-permanent-address-verification.component.scss'],
})
export class ThirdPartyPermanentAddressVerificationComponent implements OnInit {
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
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.PERMANENT_ADDRESS),
		verificationMedia: new FormArray([]),
		additionalDetails: new FormControl({ formattedAddress: null }),
		userId: new FormControl(),
		status: new FormControl(''),
		latitude: new FormControl(),
		longitude: new FormControl(),
		periodOfStay: new FormGroup({
			years: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
			months: new FormControl('', [Validators.required]),
		}),
		accommodationType: new FormControl(),
		addressType: new FormControl(),
		ownershipType: new FormControl(),
		verifier: new FormGroup({
			name: new FormControl(''),
			countryCode: new FormControl('91'),
			mobileNumber: new FormControl(''),
			designation: new FormControl(''),
		}),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	errorMessages = businessDocumentsFieldForm;
	kycStatus = kycStatus;
	imageType = OPTIONS.imageType;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	userData: any = {};
	token: string;
	accommodationType = Object.values(accommodationType);
	addressType = Object.values(addressTypeList);
	ownershipType = Object.values(ownershipType);
	hasLocationAccess: boolean = false;
	@ViewChild('fileInput0') private fileInput0: ElementRef;
	@ViewChild('fileInput1') private fileInput1: ElementRef;
	months = Array.from(Array(12).keys());
	params: any = {};
	isMobileNumberValid: boolean = false;
	constructor(
		private formBuilder: FormBuilder,
		nodalConfig: NgbModalConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private thirdPartyService: ThirdPartyService,
		private activatedRoute: ActivatedRoute,
		private jwtService: JwtService,
		private modalService: NgbModal
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.addItems();
	}
	receiveValidNumberEvent($event: any) {
		this.isMobileNumberValid = $event;
	}
	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			this.token = params['token'];
			this.params = this.activatedRoute.snapshot.queryParams;
			this.jwtService.saveToken(this.token);
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['userId'].setValue(this.userData.id);
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
	get formVerifier() {
		return this.dataForm.controls['verifier']['controls'];
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(''),
			filePath: new FormControl('', [Validators.required]),
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
		console.log(this.verificationMedia.controls);
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
		this.spinnerService.start();
		this.uploadService.uploadFile(url, formData, SERVICES.VERIFICATION).subscribe({
			next: (value) => {
				this.spinnerService.stop();
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
		if (!this.form['latitude'].value) {
			this.toastService.error('Geolocation is not enabled');
			return;
		}
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}

		this.spinnerService.start();
		const url = `${environment.VERIFICATION_API_URL}/verify/${this.token}/physical-verification`;
		this.thirdPartyService.post(url, this.dataForm.getRawValue(), null).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	getAddress({ latitude, longitude }): void {
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
			if (status === 'OK') {
				if (results[0]) {
					// console.log('address selected', results[0].formatted_address);
					this.form['additionalDetails'].value['formattedAddress'] = results[0].formatted_address;
				} else {
					this.toastService.error('No address found');
				}
			} else {
				this.toastService.error('Try after some time');
			}
		});
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
}
