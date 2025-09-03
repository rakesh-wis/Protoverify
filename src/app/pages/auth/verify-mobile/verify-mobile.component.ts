import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, ROLES } from 'src/app/helpers';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-verify-mobile',
	templateUrl: './verify-mobile.component.html',
	styleUrls: ['./verify-mobile.component.scss'],
})
export class VerifyMobileComponent implements OnInit {
	dataForm = new FormGroup({
		countryCode: new FormControl('', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		tempOtp: new FormControl('', [Validators.required]),
	});
	errorMessages = authFieldsErrors;
	isNewUser: boolean = false;
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
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params['isNew']) {
				this.isNewUser = params['isNew'] === 'true' ? true : false;
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
				this.spinnerService.stop();
				if (result.data.email) {
					window.sessionStorage.setItem('email', result.data.email);
					this.router.navigate(['/verify-email'], { queryParams: { isOTPSend: true } });
				} else {
					window.sessionStorage.setItem('mobileNumber', result.data.mobileNumber);
					this.router.navigate(['/verify-email']);
				}
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
