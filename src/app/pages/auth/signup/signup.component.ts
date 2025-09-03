import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { businessType, industryType, maskForInputFields } from 'src/app/helpers';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
	dataForm = new FormGroup({
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		firstName: new FormControl('', [Validators.required, Validators.maxLength(25)]),
		lastName: new FormControl('', [Validators.required, Validators.maxLength(25)]),
		type: new FormControl('', [Validators.required]),
		industry: new FormControl('', [Validators.required]),
		registeredName: new FormControl('', [Validators.required]),
	});
	alphabetsMask = maskForInputFields.alphabetsMask;
	errorMessages = authFieldsErrors;
	isMobileNumberValid: boolean = false;
	industryType = industryType;
	businessType = businessType;
	constructor(
		private router: Router,
		private userService: UserService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

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
		const url = '/admin/user/sign-up';
		const payload = {
			...this.dataForm.getRawValue(),
			name: `${this.form['firstName'].value} ${this.form['lastName'].value}`,
		};
		this.userService.signup(payload, url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				let phone = `${this.form['countryCode'].value}${this.form['mobileNumber'].value}`;
				this.router.navigate([`/${phone}/verify-mobile`], { queryParams: { isNew: true } });
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
