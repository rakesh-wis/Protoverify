import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-change-mobile',
	templateUrl: './change-mobile.component.html',
	styleUrls: ['./change-mobile.component.scss'],
})
export class ChangeMobileComponent implements OnInit {
	dataForm = new FormGroup({
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', Validators.required),
		tempOtp: new FormControl(''),
	});
	isMobileNumberValid: boolean = false;
	errorMessages = authFieldsErrors;
	isOTPSend: boolean = false;
	constructor(
		public activeModal: NgbActiveModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private userService: UserService
	) {}

	ngOnInit(): void {}

	get form() {
		return this.dataForm.controls;
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
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

	sendOTP(): void {
		this.form['tempOtp'].clearValidators();
		this.form['tempOtp'].updateValueAndValidity();
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		const url = '/admin/user/send-change-mobile-otp';
		this.userService.login(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result['message']);
				this.isOTPSend = true;
				this.form['tempOtp'].setValidators([Validators.required]);
				this.form['tempOtp'].updateValueAndValidity();
				this.form['tempOtp'].setValue(null);
				this.form['mobileNumber'].setValidators([Validators.required]);
				this.form['mobileNumber'].disable();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	verifyOTP(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		const url = '/admin/user/change-mobile';
		this.userService.verification(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.userService.setAuth(result.data);
				this.spinnerService.stop();
				this.toastService.success(result['message']);
				this.dismissModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
