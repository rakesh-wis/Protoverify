import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { pastEmployeeFieldsForm } from '../../../helpers/form-error.helper';
import { validateField } from '../../../shared/validators/form.validator';
import { SharedService } from '../../../core/services/shared.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { PastEmploymentService } from '../../../core/services/past-employment.service';
import { ToastService } from '../../../core/services/toast.service';
import { UploadService, UserService } from '../../../core/services';
import { OPTIONS, ROLES, SERVICES, employmentType } from '../../../helpers';
import moment, { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';

export const MY_FORMATS = {
	parse: {
		dateInput: 'DD MMM YYYY',
	},
	display: {
		dateInput: 'DD MMM YYYY',
		monthYearLabel: 'YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'YYYY',
	},
};

@Component({
	selector: 'app-past-employment-check-details',
	templateUrl: './past-employment-check-details.component.html',
	styleUrls: ['./past-employment-check-details.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},

		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class PastEmploymentCheckDetailsComponent implements OnInit {
	@Input() userId: number;
	@Input() modelData: any;

	dataForm = new FormGroup({
		id: new FormControl(null),
		userId: new FormControl(null),
		organizationName: new FormControl('', [Validators.required]),
		salary: new FormControl('', [Validators.required]),
		reasonOfDiscontinuance: new FormControl('', [Validators.required]),
		anyExitFormalitiesPending: new FormControl('', [Validators.required]),
		formalitiesFromWhom: new FormControl(''),
		employeeId: new FormControl('', [Validators.required]),
		designation: new FormControl('', [Validators.required]),
		employmentType: new FormControl('', [Validators.required]),
		fromDate: new FormControl('', [Validators.required]),
		toDate: new FormControl(),
		status: new FormControl(''),
		startDate: new FormControl(''),
		endDate: new FormControl(),
		hrDetails: new FormGroup({
			name: new FormControl('', [Validators.required]),
			email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
			countryCode: new FormControl('91', [Validators.required]),
			mobileNumber: new FormControl('', [Validators.required]),
			status: new FormControl(),
			emailAttachment: new FormControl(),
		}),
		reportingManager: new FormGroup({
			name: new FormControl(''),
			email: new FormControl('', []),
			countryCode: new FormControl('91', []),
			mobileNumber: new FormControl('', []),
			status: new FormControl(),
			emailAttachment: new FormControl(),
		}),
		media: new FormArray([]),
		supportingDocument: new FormControl(''),
	});
	exitingFormalitiesList = ['yes', 'no'];
	formalitiesFromWhomList = ['employee', 'employer'];
	media = this.dataForm.get('media') as FormArray;
	errorMessages = pastEmployeeFieldsForm;
	isMobileNumberValid: boolean = false;
	isCurrentlyWorking = false;
	minDate = { year: 1990, month: 1, day: 1 };
	maxDate;
	employmentType = employmentType;
	mediaDocuments = [
		{
			label: 'Latest Salary Slip',
			mediaType: 'latest_salary_slip',
		},
		{
			label: 'Appointment Letter/Increment Letter',
			mediaType: 'offer_letter',
		},
		{
			label: 'Relieving Letter',
			mediaType: 'other_document',
		},
	];
	roles = ROLES;
	currentUser: any;
	constructor(
		private formBuilder: FormBuilder,
		config: NgbInputDatepickerConfig,
		private sharedService: SharedService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private uploadService: UploadService,
		private pastEmploymentService: PastEmploymentService,
		private userService: UserService
	) {
		this.maxDate = new Date();
		config.maxDate = this.maxDate;
		this.addItems();
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.form['userId'].setValue(this.userId);
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
			this.form['startDate'].setValue(this.form['fromDate'].value);
			this.form['endDate'].setValue(this.form['toDate'].value);
			this.mediaDocuments.forEach((element, index) => {
				let item = this.modelData.media.find((access) => access.mediaType === element.mediaType);
				if (item) {
					this.media.controls[index].patchValue(item);
				}
			});
		}
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
	handleCurrentlyWorking(e: any): void {
		this.isCurrentlyWorking = e.target.checked;
	}

	receiveValidNumberEvent($event: any) {
		this.isMobileNumberValid = $event;
	}
	downloadDocument(url: string) {
		if (url) {
			window.open(url, '_blank');
		}
	}
	setDate(datepicker: MatDatepicker<Moment>, fieldName) {
		this.form[fieldName].setValue(moment(this.form[fieldName].value).format('YYYY-MM-DD'));
		datepicker.close();
	}

	toggleExitingFormalitiesPendingFromWhom() {
		if (this.form['exitingFormalities'].value.toLowerCase() === 'no') {
			this.form['exitingFormalitiesPendingFromWhom'].clearValidators();
		} else {
			this.form['exitingFormalitiesPendingFromWhom'].addValidators(Validators.required);
		}
		this.dataForm.get('exitingFormalitiesPendingFromWhom').updateValueAndValidity();
	}
	get form() {
		return this.dataForm.controls;
	}
	dismissModal(dismiss: boolean = false) {
		this.modalService.dismissAll(dismiss);
	}
	createItem(item: any): FormGroup {
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
			this.media.push(this.createItem(element));
		});
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
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
	onSubmit() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if (this.dataForm.value.hrDetails.email == this.dataForm.value.reportingManager.email) {
			this.toastService.error(' HR & Reporting Manger can not have same email');
			return;
		}
		if (this.dataForm.value.hrDetails.mobileNumber == this.dataForm.value.reportingManager.mobileNumber) {
			this.toastService.error(' HR & Reporting Manger can not have same mobile number');
			return;
		}
		this.spinnerService.start();

		let payload = this.dataForm.getRawValue();
		if (this.form['id'].value === null) this.create(payload);
		else this.update(payload);
	}

	uploadFileMedia(event: any, index: number): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkDocumentType(file) && this.uploadService.checkImageType(file)) {
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
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
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
	uploadFile(event: any, type: string): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkDocumentType(file) && this.uploadService.checkImageType(file)) {
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
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
			next: (value) => {
				this.form[type].setValue(value.cdn);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	create(payload) {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/employee/past-organization`
			: `/employee/past-organization`;
		this.pastEmploymentService.create(payload, url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dismissModal(true);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	update(payload) {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/employee/past-organization/${payload.id}`
			: `/employee/past-organization/${payload.id}`;
		this.pastEmploymentService.update(payload, url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dismissModal(true);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	clearFile(controlName: string) {
		this.form[controlName].setValue('');
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
