import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { OPTIONS, ROLES, SERVICES, courtStatus, employeeAddressType, planFeatures, yearsList } from 'src/app/helpers';
import { CourtDetailsComponent } from '../court-details/court-details.component';
import { KycService } from 'src/app/core/services/kyc.service';
import { UploadService, UserService } from 'src/app/core';
import { AddressService } from 'src/app/core/services/address.service';
import { verificationFieldForm } from 'src/app/helpers/form-error.helper';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-court-list',
	templateUrl: './court-list.component.html',
	styleUrls: ['./court-list.component.scss'],
})
export class CourtListComponent implements OnInit {
	@Input() id: number;
	@Input() modelData: any = [];
	@Input() canEdit: boolean = true;
	@Input() userId: number;
	@Input() vendorId: number;
	@Input() userData: any;
	@Input() verificationMedia: any = [];
	courtList: any;
	headerColumn: string[] = ['Court', 'Jurisdiction', 'Cases since', 'Status'];
	yearList = yearsList(34);
	currentUser: any;
	dataForm = new FormGroup({
		verificationMedia: new FormArray([]),
		vendorId: new FormControl(null, [Validators.required]),
	});
	mediaDocuments = [
		{
			label: 'Supporting Document',
			mediaType: 'supporting_document',
		},
	];
	dataArray = [];
	courtStatus = courtStatus;
	aadharCard: any = {};
	userAddress: any = [];
	roles = ROLES;
	errorMessages = verificationFieldForm;
	media = this.dataForm.get('verificationMedia') as FormArray;
	vendorList = [];
	pageVendor: number = 1;
	pageSizeVendor: number = 20;
	collectionSizeVendor: number;
	constructor(
		private formBuilder: FormBuilder,
		modalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private activeModalService: NgbActiveModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private verificationDetailsService: VerificationDetailsService,
		private kycService: KycService,
		private addressService: AddressService,
		private userService: UserService,
		private uploadService: UploadService,
		private vendorService: VendorService
	) {
		modalConfig.backdrop = 'static';
		modalConfig.keyboard = false;
		this.addItems();
	}

	ngOnInit(): void {
		this.form['vendorId'].setValue(this.vendorId);
		this.currentUser = this.userService.getCurrentUser();
		this.spinnerService.start();
		this.getUserAddress();
		this.getAadharData();
		this.loadVendorData();
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	downloadDocument(url: string) {
		window.open(url, '_blank');
	}

	getUserAddress() {
		let params = {
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/address` : `/address`,
		};
		if (this.userId) {
			params['userId'] = this.userId;
		}
		this.addressService.getData(params).subscribe({
			next: (data) => {
				if (data.data.count != 0) {
					this.userAddress = data.data['rows'];
					this.mediaDocuments.forEach((element, index) => {
						let item = this.verificationMedia.find((access) => access.mediaType === element.mediaType);
						if (item) {
							this.media.controls[index].patchValue(item);
						}
					});
					this.loadData();
				} else {
					this.toastService.error('No address added');
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
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
	loadData(): void {
		this.verificationDetailsService.getCourtList().subscribe({
			next: (result) => {
				this.courtList = result.data;
				this.courtList.forEach((court) => {
					let parentForm = {
						category: court.category,
						data: [],
					};
					court.data.forEach((element) => {
						let data = this.modelData.find((e) => e.courtId === element.id);
						const address = this.userAddress.find((e) =>
							e.type
								.toLowerCase()
								.replace('_', ' ')
								.replace('_', ' ')
								.includes(element.label.toLowerCase())
						);
						let jurisdiction = address
							? `${address.city}, ${address.state}, ${address.countryName} - PIN ${address.pincode}`
							: '-';
						if (address && address.type === employeeAddressType.PHYSICAL_PERMANENT_ADDRESS) {
							let aadharCardAddress = this.aadharCard.additionalDetails;
							if (aadharCardAddress.address) {
								jurisdiction = `${aadharCardAddress?.address.house},` ?? '';
								jurisdiction += `${aadharCardAddress?.address.loc},` ?? '';
								jurisdiction += `${aadharCardAddress?.address.landmark},` ?? '';
								jurisdiction += `${aadharCardAddress?.address.street},` ?? '';
								jurisdiction += `${aadharCardAddress?.address.dist},` ?? '';
								jurisdiction += `${aadharCardAddress?.address.state},` ?? '';
								jurisdiction += `PIN ${aadharCardAddress?.address.pincode}` ?? '';
							} else {
								jurisdiction = `${aadharCardAddress?.inputAddress},` ?? '';
								jurisdiction += `${aadharCardAddress?.city},` ?? '';
								jurisdiction += `${aadharCardAddress?.state},` ?? '';
								jurisdiction += `PIN ${aadharCardAddress?.pincode}` ?? '';
							}
						}
						if (data) {
							data.court = element;
							data.court.jurisdiction = jurisdiction;
							parentForm.data.push(this.createItem(data));
						} else {
							parentForm.data.push(
								this.createItem({
									id: null,
									courtId: element.id,
									yearDate: '',
									noOfCases: 0,
									status: courtStatus[0].value,
									court: {
										id: element.id,
										label: element.label,
										jurisdiction: jurisdiction,
									},
								})
							);
						}
					});
					this.dataArray.push(parentForm);
				});
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	createItemMedia(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(''),
			filePath: new FormControl('', []),
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: new FormControl(''),
			status: new FormControl('pending'),
			mediaType: new FormControl(item.mediaType, [Validators.required]),
		});
	}

	addItems(): void {
		this.mediaDocuments.forEach((element) => {
			this.media.push(this.createItemMedia(element));
		});
	}
	get form() {
		return this.dataForm.controls;
	}
	clearFile() {
		this.form['verificationMedia'].setValue([]);
	}
	setControl(file, isToRemove, index): void {
		if (isToRemove) {
			file.fileType = '';
			file.filePath = '';
			file.fileName = 'Select file';
			file.fileSize = '';
		}
		this.media.controls[index].setValue({
			id: this.media.controls[index].value.id,
			fileType: file.fileType,
			filePath: file.filePath,
			fileName: file.fileName,
			fileSize: file.fileSize,
			status: file.status ? file.status : 'pending',
			label: this.media.controls[index].value.label,
			mediaType: this.media.controls[index].value.mediaType,
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

	createItem(item: any): any {
		return {
			id: item?.id || null,
			courtId: item?.courtId || '',
			yearDate: item?.yearDate || '',
			noOfCases: item?.noOfCases || '',
			status: item?.status || 'no_case_found',
			court: item?.court,
			verificationMedia: item.verificationMedia || [],
		};
	}

	onSubmit(): void {
		let isValid = true;
		this.dataArray.forEach((e) => {
			if (e.data.some((item) => !item.yearDate && item.status === courtStatus[1].value)) {
				isValid = false;
			}
		});
		if (!isValid) {
			this.toastService.error('Please fill all the details');
			return;
		}
		this.activeModalService.close({ courtCheck: this.dataArray, formData: this.dataForm.getRawValue() });
	}
	openCourtDetails(item) {
		const modalRef = this.modalService.open(CourtDetailsComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = {
			noOfCases: item.noOfCases,
			verificationMedia: item.verificationMedia || [],
		};
		modalRef.componentInstance.canEdit = this.canEdit;
		modalRef.result.then(
			(result) => {
				item.noOfCases = result.noOfCases;
				item.verificationMedia = result.media;
			},
			(dismiss) => {}
		);
	}
	dismissModal() {
		this.modalService.dismissAll();
	}
	resetValue(item) {
		if (item.status === courtStatus[0].value) {
			item.noOfCases = 0;
			item.verificationMedia = [];
		}
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
		this.verificationDetailsService.sendReportToVendor({ id: this.id, type: planFeatures.COURT_CHECK }).subscribe({
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
}
