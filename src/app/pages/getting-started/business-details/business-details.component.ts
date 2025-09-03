import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/core';
import { BusinessDetailsService } from 'src/app/core/services/business-details.service';
import { ClientService } from 'src/app/core/services/client.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { businessType, industryType, OPTIONS } from 'src/app/helpers';
import { businessDetailsFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-business-details',
	templateUrl: './business-details.component.html',
	styleUrls: ['./business-details.component.scss'],
})
export class BusinessDetailsComponent implements OnInit {
	dataForm = new FormGroup({
		id: new FormControl(null),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		type: new FormControl('', [Validators.required]),
		industry: new FormControl('', [Validators.required]),
		registeredName: new FormControl('', [Validators.required]),
		employeeCount: new FormControl(0),
		panNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.panCardPattern)]),
		gstNumber: new FormControl('', [Validators.required]),
		cinNumber: new FormControl(''),
		yearINC: new FormControl('', [Validators.pattern(/^(19[0-9][0-9]|20[01][0-9]||20[2][0-2])$/)]),
		website: new FormControl('', [Validators.pattern(OPTIONS.websiteWithOutHttpPattern)]),
		gstDetails: new FormControl(''),
		userId: new FormControl(null),
	});
	errorMessages = businessDetailsFieldForm;
	industryType = industryType;
	businessType = businessType;
	maxYear = new Date().getFullYear();
	@Output() changeAccordion = new EventEmitter<number>();
	@Input() userId: number = null;
	@Input() canEdit: boolean = true;
	@Input() showCancel: boolean = true;
	@Input() canGoBack: boolean = false;

	isMobileNumberValid: boolean = false;
	clientDetails: any = {};
	constructor(
		private businessDetailsService: BusinessDetailsService,
		private clientService: ClientService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private verificationDetailsService: VerificationDetailsService
	) {}

	ngOnInit(): void {
		this.form['userId'].setValue(this.userId);
		if (this.userId) this.getDataById();
	}

	get form() {
		return this.dataForm.controls;
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	onSubmit(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}
	getDataById(): void {
		this.clientService.getById(this.userId).subscribe({
			next: (result) => {
				this.clientDetails = result.data;
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data.businessDetails);
				if (!this.canEdit) {
					this.dataForm.disable();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	create(): void {
		this.businessDetailsService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				// this.changeAccordion.emit(1);
				if (this.canGoBack) {
					this.goBack();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	update(): void {
		this.businessDetailsService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.toastService.success(result.message);
				// this.changeAccordion.emit(1);
				if (this.canGoBack) {
					this.goBack();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	goBack(): void {
		this.location.back();
	}
	searchGST() {
		if (!this.form['gstNumber'].value) {
			return;
		}
		let params = {
			gstNumber: this.form['gstNumber'].value,
		};
		this.spinnerService.start();
		this.verificationDetailsService.searchGST(params).subscribe(
			(result) => {
				this.form['gstDetails'].setValue(result.data);
				this.spinnerService.stop();
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
}
