import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest } from 'rxjs';
import { UploadService } from 'src/app/core';
import { ContactUsService } from 'src/app/core/services/contact-us.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { contactFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-contact-us-details',
	templateUrl: './contact-us-details.component.html',
	styleUrls: ['./contact-us-details.component.scss'],
})
export class ContactUsDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		address: new FormControl('', [Validators.required]),
		pincode: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{2}[0-9]{3}$/)]),
		state: new FormControl('', [Validators.required]),
		city: new FormControl('', [Validators.required]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		countryName: new FormControl(''),
	});
	errorMessages = contactFieldForm;
	isMobileNumberValid: boolean = false;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private contactUsService: ContactUsService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private sharedService: SharedService
	) {}

	ngOnInit(): void {
		if (this.modelData) {
			console.log(this.modelData);
			this.dataForm.patchValue(this.modelData);
		}
	}

	get form() {
		return this.dataForm.controls;
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	closeModal() {
		this.activeModal.close('close with cancel button');
	}

	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	searchPincode() {
		if (this.dataForm.get('pincode').value.toString().length < 6) {
			return;
		}
		this.sharedService.searchPincode(this.dataForm.get('pincode').value).subscribe(
			(result) => {
				if (result.PostOffice) {
					this.dataForm.get('city').setValue(result.PostOffice[0].District);
					this.dataForm.get('state').setValue(result.PostOffice[0].State);
				} else if (result.Status === 'Error') {
					this.toastService.error('Invalid pincode');
				}
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.contactUsService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dismissModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		this.contactUsService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dismissModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
