import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { ReferenceCheckService } from 'src/app/core/services/reference-check.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ROLES } from 'src/app/helpers';
import { pastEmployeeFieldsForm, referenceCheckFieldForms } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-reference-check-details',
	templateUrl: './reference-check-details.component.html',
	styleUrls: ['./reference-check-details.component.scss'],
})
export class ReferenceCheckDetailsComponent implements OnInit {
	@Input() userId: number;
	@Input() modelData: any;

	dataForm = new FormGroup({
		id: new FormControl(null),
		userId: new FormControl(null),
		organizationName: new FormControl('', [Validators.required]),
		location: new FormControl('', [Validators.required]),
		designation: new FormControl('', [Validators.required]),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required]),
		countryCode: new FormControl('91', []),
		mobileNumber: new FormControl('', [Validators.required]),
		currentlyWorking: new FormControl(false),
	});
	errorMessages = referenceCheckFieldForms;
	isMobileNumberValid: boolean = false;
	designationList = ['manager', 'colleague'];

	roles = ROLES;
	currentUser: any;
	constructor(
		private formBuilder: FormBuilder,
		private sharedService: SharedService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private referenceCheckService: ReferenceCheckService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.form['userId'].setValue(this.userId);
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
		}
	}

	receiveValidNumberEvent($event: any) {
		this.isMobileNumberValid = $event;
	}

	get form() {
		return this.dataForm.controls;
	}

	dismissModal(dismiss: boolean = false) {
		this.modalService.dismissAll(dismiss);
	}

	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
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

	create(payload) {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/employee/reference-check`
			: `/employee/reference-check`;
		this.referenceCheckService.create(payload, url).subscribe({
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
			? `/admin/employee/reference-check/${payload.id}`
			: `/employee/reference-check/${payload.id}`;
		this.referenceCheckService.update(payload, url).subscribe({
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
}
