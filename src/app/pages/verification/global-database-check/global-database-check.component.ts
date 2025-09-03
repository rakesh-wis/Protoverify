import { Component, OnInit } from '@angular/core';
import { OPTIONS, ROLES, SERVICES, kycStatus, planFeatures, verificationLevelList } from 'src/app/helpers';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { KycService } from 'src/app/core/services/kyc.service';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Location } from '@angular/common';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-global-database-check',
	templateUrl: './global-database-check.component.html',
	styleUrls: ['./global-database-check.component.scss'],
})
export class GlobalDatabaseCheckComponent implements OnInit {
	userData: any = {};
	dataForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.GLOBAL_DATABASE_CHECK),
		comment: new FormControl(),
		userId: new FormControl(),
		status: new FormControl('pending'),
		remark: new FormControl(''),
		createdAt: new FormControl(),
		vendorId: new FormControl('', [Validators.required]),
		verificationMedia: new FormArray([]),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	aadharCard: any = {};
	userId = null;
	kycStatus = kycStatus;
	currentUser: any;
	roles = ROLES;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Global Database Check',
			value: null,
			sorting: false,
		},
		{
			label: 'Provided Information',
			value: null,
			sorting: false,
		},
		{
			label: 'Verified Information',
			value: null,
			sorting: false,
		},
	];
	statusList: any = verificationLevelList;
	errorMessages = businessDocumentsFieldForm;
	businessDocuments = [
		{
			label: 'Attachment',
			mediaType: 'global_database_check',
		},
	];
	vendorList = [];
	pageVendor: number = 1;
	pageSizeVendor: number = 20;
	collectionSizeVendor: number;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	globalCheck = null;
	constructor(
		private formBuilder: FormBuilder,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private verificationDetailsService: VerificationDetailsService,
		private verificationMediaService: VerificationMediaService,
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		private location: Location,
		private router: Router,
		private kycService: KycService,
		private vendorService: VendorService
	) {
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
	get form() {
		return this.dataForm.controls;
	}

	get getLevelColor(): string {
		let level = verificationLevelList.find((e) => e.name === this.form['status'].value);
		return level ? level.color : '';
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
					this.globalCheck = result.data[0];
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
				this.globalCheck = result.data;
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.toastService.success(result.message);
				this.verificationDetailsService.showCompleteModal(
					'global-database-check',
					this.form['status'].value,
					1
				);
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
		this.verificationDetailsService.navigateToNext(path, 'global-database-check', this.userData);
	}

	removeUnderScore(value) {
		return value.replace(/_/g, ' ');
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
			!this.assignedVerificationChecks.includes(this.planFeatures.GLOBAL_DATABASE_CHECK)
		);
	}
}
