import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-verify-admin-mobile',
	templateUrl: './verify-admin-mobile.component.html',
	styleUrls: ['./verify-admin-mobile.component.scss'],
})
export class VerifyAdminMobileComponent implements OnInit {
	dataForm = new FormGroup({
		countryCode: new FormControl('', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		tempOtp: new FormControl('', [Validators.required]),
	});
	errorMessages = authFieldsErrors;

	constructor(
		private router: Router,
		private userService: UserService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			if (params.hasOwnProperty('phone')) {
				let phone = params['phone'];
				this.form['countryCode'].setValue(phone.slice(0, 2));
				this.form['mobileNumber'].setValue(phone.slice(2, phone.length));
			}
		});
	}

	ngOnDestroy(): void {
		this.dataForm.reset();
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

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		const url = '/admin/user/verify-mobile-otp';
		this.userService.verification(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				window.sessionStorage.setItem('email', result.data.email);
				this.spinnerService.stop();
				this.router.navigate(['/verify-email'], { queryParams: { isOTPSend: true } });
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	resend() {
		const url = '/admin/user/send-mobile-otp';
		this.userService.login(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result['message']);
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
}
