import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VendorService } from 'src/app/core/services/vendor.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { OPTIONS, ROLES } from 'src/app/helpers';
import { authFieldsErrors, vendorFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-vendor-details',
	templateUrl: './vendor-details.component.html',
	styleUrls: ['./vendor-details.component.scss'],
})
export class VendorDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		companyName: new FormControl('', [Validators.required]),
		designation: new FormControl('', [Validators.required]),
	});

	errorMessages = vendorFieldForm;
	isMobileNumberValid: boolean = false;
	designationList: Array<{ label: string; value: string }> = [
		{ label: 'Vendor', value: 'vendor' },
		{ label: 'Field Officer', value: 'field_officer' },
	];

	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private vendorService: VendorService,
		private verificationDetailsService: VerificationDetailsService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.getData();
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	/**
	 * close modal
	 */
	closeModal() {
		this.activeModal.close('close with cancel button');
	}
	/**
	 * dismiss modal
	 */
	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	searchGST() {
		if (!this.form['gstNumber'].value) {
			return;
		}
		let params = {
			gstNumber: this.form['gstNumber'].value,
		};
		this.verificationDetailsService.searchGST(params).subscribe(
			(result) => {
				this.form['additionalDetails'].setValue(result.data);
				this.form['name'].setValue(result.data.legalName);
				this.form['mobileNumber'].setValue(result.data.contact.mobile_no);
				this.form['email'].setValue(result.data.contact.email);
				this.form['address'].setValue(result.data.address.registered_address);
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
	getData(): void {
		this.vendorService.getById(this.modelData.id).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				this.form['address'].setValue(result.data.additionalDetails.address.registered_address);
				console.log(this.dataForm.getRawValue());
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
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

	create(): void {
		this.vendorService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		this.vendorService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
