import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, OPTIONS, ROLES } from 'src/app/helpers';
import { authFieldsErrors } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeTermsAndConditionsComponent } from '../../employee-terms-and-conditions/employee-terms-and-conditions.component';
import { EmployeeService } from 'src/app/core/services/employee.service';

@Component({
	selector: 'app-verify-email',
	templateUrl: './verify-email.component.html',
	styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
	dataForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		tempOtp: new FormControl(''),
		mobileNumber: new FormControl(''),
	});
	isOTPSend: boolean = false;
	errorMessages = authFieldsErrors;

	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private employeeService: EmployeeService
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params: Params) => {
			if (params['isOTPSend']) {
				this.isOTPSend = params['isOTPSend'] === 'true';
				this.form['email'].setValue(window.sessionStorage.getItem('email'));
			} else {
				this.form['mobileNumber'].setValue(window.sessionStorage.getItem('mobileNumber'));
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
	onSubmit(type: string): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (type === 'send') {
			const url = '/admin/user/send-email-otp';
			this.userService.sendOtp(this.dataForm.getRawValue(), url).subscribe({
				next: (result) => {
					this.spinnerService.stop();
					this.isOTPSend = true;
					this.form['tempOtp'].setValidators([Validators.required]);
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		} else {
			const url = '/admin/user/verify-email-otp';
			this.userService.verification(this.dataForm.getRawValue(), url).subscribe({
				next: (result) => {
					
					window.sessionStorage.removeItem('email');
					window.sessionStorage.removeItem('mobileNumber');
					this.spinnerService.stop();
					if (result.data.role === ROLES.PROTO_LAWYER) {
						this.router.navigate(['/direct-verification'], { replaceUrl: true });
						this.toastService.success('Logged in successfully');
					} else if (result.data.role === ROLES.EMPLOYEE) {
						this.openModal(result.data);
					} else {
						this.toastService.success('Logged in successfully');
						if (result.data.status === defaultStatus.ON_BOARDED) {
							this.router.navigate(['/getting-started'], { replaceUrl: true });
						} else {
							this.userService.setVerificationChecks(result.data.verificationChecks);
							this.router.navigate(['/dashboard'], { replaceUrl: true });
						}
					}
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		}
	}

	resend() {
		const url = '/admin/user/resend-email-otp';
		this.userService.sendOtp(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.isOTPSend = true;
				this.form['tempOtp'].setValidators([Validators.required]);
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

	navigateEmployee(data) {
		this.router.navigate([`/start-verification/${data.id}/aadhar-card`], {
			queryParams: { id: data.id, name: data.name },
		});
	}
	openModal(data): void {
		const modalRef = this.modalService.open(EmployeeTermsAndConditionsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modalData = data;
		modalRef.result.then(
			(result) => {
				if (!data.consent) {
					this.postConsentSignature(data, result);
				} else {
					this.navigateEmployee(data);
				}
			},
			(dismiss) => {
				this.userService.purgeAuth();
				let path = '/login';
				this.router.navigate([path]);
			}
		);
	}

	postConsentSignature(data, result) {
		const url = `/employee/consent-signature`;
		this.employeeService.postConsentSignature(result, url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success('Logged in successfully');
				this.navigateEmployee(data);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
