import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { JwtService } from 'src/app/core';
import { PastEmploymentService } from 'src/app/core/services/past-employment.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { pastEmployeeFieldsHrForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-third-party-past-employment-verification',
	templateUrl: './third-party-past-employment-verification.component.html',
	styleUrls: ['./third-party-past-employment-verification.component.scss'],
})
export class ThirdPartyPastEmploymentVerificationComponent implements OnInit {
	dataForm = new FormGroup({
		employeeNameCheck: new FormControl('', [Validators.required]),
		organizationCheck: new FormControl('', [Validators.required]),
		locationCheck: new FormControl('', [Validators.required]),
		employeeIdCheck: new FormControl('', [Validators.required]),
		employeeDateCheck: new FormControl('', [Validators.required]),
		designationCheck: new FormControl('', [Validators.required]),
		salaryCheck: new FormControl('', [Validators.required]),
		reasonOfDiscontinuance: new FormControl('', [Validators.required]),
		anyExitFormalitiesPending: new FormControl('', [Validators.required]),
		formalitiesFromWhom: new FormControl('', [Validators.required]),
		performanceAtWork: new FormControl('', [Validators.required]),
		disciplinaryIssue: new FormControl('', [Validators.required]),
		eligibilityForRehire: new FormControl('', [Validators.required]),
		isOtherDocumentCorrect: new FormControl(''),
		isSalarySlipCorrect: new FormControl('', [Validators.required]),
		isOfferLetterCorrect: new FormControl('', [Validators.required]),
		hrsName: new FormControl('', [Validators.required]),
		hrsDesignation: new FormControl('', [Validators.required]),
		hrsMobileNumber: new FormControl('', [Validators.required]),
		hrsCountryCode: new FormControl('91', [Validators.required]),
	});

	isMobileNumberValid: boolean = false;

	token: string;
	params: any = {};
	pastEmploymentData: any = {};
	errorMessages = pastEmployeeFieldsHrForm;

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
		const url = `${environment.USER_API_URL}/verify/${this.token}/past-organization-verification`;
		this.thirdPartyService.get(url, null, null).subscribe({
			next: (result) => {
				this.pastEmploymentData = result.data;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	get isOtherDocumentAdded() {
		const media = this.pastEmploymentData.media.find((e) => e.mediaType === 'other_document');
		return media?.filePath.length > 0 ? true : false;
	}
	openDocument(mediaType: string) {
		const media = this.pastEmploymentData.media.find((e) => e.mediaType == mediaType);
		media ? this.downloadDocument(media?.filePath) : '';
	}

	downloadDocument(url: string) {
		if (url) {
			window.open(url, '_blank');
		}
	}

	onSubmit(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		const url = `${environment.USER_API_URL}/verify/${this.token}/past-organization-verification`;
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
