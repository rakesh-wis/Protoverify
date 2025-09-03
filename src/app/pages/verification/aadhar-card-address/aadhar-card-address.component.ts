import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { kycFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-aadhar-card-address',
	templateUrl: './aadhar-card-address.component.html',
	styleUrls: ['./aadhar-card-address.component.scss'],
})
export class AadharCardAddressComponent implements OnInit {
	@Input() modelData = {};
	dataForm = new FormGroup({
		inputAddress: new FormControl('', [Validators.required]),
		city: new FormControl('', [Validators.required]),
		state: new FormControl('', [Validators.required]),
		pincode: new FormControl('', [Validators.required]),
		selectedDate: new FormControl(''),
		dob: new FormControl('', [Validators.required]),
		parentName: new FormControl('', [Validators.required]),
		gender: new FormControl('', [Validators.required]),
	});
	errorMessages = kycFieldForm;

	constructor(
		private activeModalService: NgbActiveModal,
		private toastService: ToastService,
		private sharedService: SharedService
	) {}

	ngOnInit(): void {
		this.dataForm.patchValue(this.modelData);
	}
	get form() {
		return this.dataForm.controls;
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	searchPincode() {
		if (this.form['pincode'].value.toString().length < 6) {
			return;
		}
		this.sharedService.searchPincode(this.form['pincode'].value).subscribe(
			(result) => {
				if (result.PostOffice) {
					this.form['city'].setValue(result.PostOffice[0].District);
					this.form['state'].setValue(result.PostOffice[0].State);
				} else if (result.Status === 'Error') {
					this.toastService.error('Invalid pincode');
				}
			},
			(error) => {
				this.toastService.error(error);
			}
		);
	}
	changeDate() {
		this.form['dob'].setValue(this.form['selectedDate'].value);
	}

	dismissModal() {
		this.activeModalService.dismiss();
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.activeModalService.close(this.dataForm.getRawValue());
	}
}
