import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbInputDatepickerConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/core/services/client.service';
import { educcationFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { PastEmploymentService } from 'src/app/core/services/past-employment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UploadService, UserService } from 'src/app/core/services';
import { OPTIONS, ROLES, SERVICES, courtStatus, planFeatures, verificationLevel, yearsList } from 'src/app/helpers';
import { EducaationDetailsService } from 'src/app/core/services/educaation-details.service';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';

@Component({
	selector: 'app-educational-details',
	templateUrl: './educational-details.component.html',
	styleUrls: ['./educational-details.component.scss'],
})
export class EducationalDetailsComponent implements OnInit {
	@Input() userId: number;
	@Input() modelData: any;
	@Input() isPopup: boolean = true;
	yearsList = yearsList(38);
	dataForm = new FormGroup({
		id: new FormControl(null),
		userId: new FormControl(null),
		status: new FormControl(''),
		qualification: new FormControl('', [Validators.required]),
		registrationNumber: new FormControl('', [Validators.required]),
		board: new FormControl('', [Validators.required]),
		college: new FormControl('', [Validators.required]),
		yearOfPassing: new FormControl('', [Validators.required]),
		leavingDocument: new FormControl(''),
		finalYearDocument: new FormControl('', [Validators.required]),
		certificateDocument: new FormControl(''),
		passingDocument: new FormControl('', [Validators.required]),
		verifier: new FormGroup({
			name: new FormControl(''),
			countryCode: new FormControl('91'),
			mobileNumber: new FormControl(''),
			designation: new FormControl(''),
			resultOfVerification: new FormControl(''),
		}),
		supportingDocument: new FormControl(''),
	});
	errorMessages = educcationFieldForm;
	isMobileNumberValid: boolean = false;
	isCurrentlyWorking = false;
	roles = ROLES;
	verificationLevel = verificationLevel;
	media: any = [];
	organizationList: any = {
		data: [],
		count: -1,
	};
	minDate = { year: 1990, month: 1, day: 1 };
	maxDate;
	currentUser: any;
	@Output() updateEvent: EventEmitter<any> = new EventEmitter();
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	constructor(
		nodalConfig: NgbModalConfig,
		config: NgbInputDatepickerConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private uploadService: UploadService,
		private userService: UserService,
		private educationDetailsService: EducaationDetailsService
	) {
		this.maxDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
		config.maxDate = this.maxDate;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.form['userId'].setValue(this.userId);
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			if (!this.modelData?.verifier.countryCode) {
				this.modelData.verifier.countryCode = '91';
			}
			this.dataForm.patchValue(this.modelData);
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
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
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

	// loadClients(filter = {}): void {
	// 	let params = {
	// 		status: 'active',
	// 		...filter,
	// 	};
	// 	this.clientService.list(params).subscribe({
	// 		next: (result) => {
	// 			this.organizationList = result.data;
	// 		},
	// 	});
	// }
	receiveValidNumberEvent($event: any) {
		this.isMobileNumberValid = $event;
	}
	get form() {
		return this.dataForm.controls;
	}
	get formVerifier() {
		return this.dataForm.controls['verifier']['controls'];
	}
	dismissModal(dismiss: boolean = false) {
		this.modalService.dismissAll(dismiss);
	}
	onSubmit() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();

		let payload = this.dataForm.getRawValue();
		if (this.form['id'].value === null) this.create(payload);
		else this.update(payload);
	}

	removeMediaItem(index): void {
		if (this.media[index].id) {
			this.media[index].status = 'deleted';
		} else {
			this.media.splice(index, 1);
		}
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
		this.uploadService.uploadFile(url, formData, SERVICES.VERIFICATION).subscribe({
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
		this.educationDetailsService.create(payload).subscribe({
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
		this.educationDetailsService.update(payload).subscribe({
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
	downloadDocument(url: string) {
		if (url) {
			window.open(url, '_blank');
		}
	}
	triggerEvent(type: string) {
		this.updateEvent.emit({ type });
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
			!this.assignedVerificationChecks.includes(this.planFeatures.EDUCATIONAL)
		);
	}
}
