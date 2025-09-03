import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { JwtService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { referenceCheckFieldsHrForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-third-party-verification-reference-check',
	templateUrl: './third-party-verification-reference-check.component.html',
	styleUrls: ['./third-party-verification-reference-check.component.scss'],
})
export class ThirdPartyVerificationReferenceCheckComponent implements OnInit {
	dataForm = new FormGroup({
		employeeNameCheck: new FormControl('', [Validators.required]),
		organizationCheck: new FormControl('', [Validators.required]),
		locationCheck: new FormControl('', [Validators.required]),
		yearsOfKnown: new FormControl('', [Validators.required]),
		capacityOfWorking: new FormControl('', [Validators.required]),
		rolesAndResponsibility: new FormControl('', [Validators.required]),
		professionalStrengths: new FormControl('', [Validators.required]),
		areasOfImprovement: new FormControl('', [Validators.required]),
		reasonOfLeaving: new FormControl('', [Validators.required]),
		eligibilityForRehire: new FormControl('', [Validators.required]),
		keyAttributes: new FormControl('', [Validators.required]),
		comparisonWithOthers: new FormControl('', [Validators.required]),
		personalQualities: new FormControl('', [Validators.required]),
		motivationOfCandidate: new FormControl('', [Validators.required]),
		verbalAndWriterRating: new FormControl('', [Validators.required]),
		commitmentRating: new FormControl('', [Validators.required]),
		passionRating: new FormControl('', [Validators.required]),
		integrityRating: new FormControl('', [Validators.required]),
	});

	isMobileNumberValid: boolean = false;

	token: string;
	params: any = {};
	referenceCheckData: any = {};
	errorMessages = referenceCheckFieldsHrForm;

	constructor(
		private formBuilder: FormBuilder,
		nodalConfig: NgbModalConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private jwtService: JwtService,
		private thirdPartyService: ThirdPartyService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
	}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			this.token = params['token'];
			this.params = this.activatedRoute.snapshot.queryParams;
			this.jwtService.saveToken(this.token);
			this.getEmploymentData();
		});
	}
	get form() {
		return this.dataForm.controls;
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}

	getEmploymentData() {
		const url = `${environment.USER_API_URL}/verify/${this.token}/reference-check-verification`;
		this.thirdPartyService.get(url, null, null).subscribe({
			next: (result) => {
				this.referenceCheckData = result.data;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		console.log(this.dataForm);
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		const url = `${environment.USER_API_URL}/verify/${this.token}/reference-check-verification`;
		this.thirdPartyService.post(url, this.dataForm.getRawValue(), null).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
