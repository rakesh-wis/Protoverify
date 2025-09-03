import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
	dataForm = new FormGroup({
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
	});
	errorMessages = authFieldsErrors.mobileNumber;
	isMobileNumberValid: boolean = false;

	constructor(
		private router: Router,
		private userService: UserService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.dataForm.reset();
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
		const url = '/admin/user/send-mobile-otp';
		this.userService.login(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				let phone = `${this.form['countryCode'].value}${this.form['mobileNumber'].value}`;
				this.router.navigate([`/${phone}/verify-mobile`], { replaceUrl: true });
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	navigateToSignUp(): void {
		this.router.navigateByUrl('/signup');
	}
}
