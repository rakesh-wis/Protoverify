import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { ClientTeamsService } from 'src/app/core/services/client-teams.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeShiftService } from 'src/app/core/services/time-shift.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, kycStatus, OPTIONS, planFeatures, ROLES, timeShift } from 'src/app/helpers';
import { employeeFieldForm, kycFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-employee-details',
	templateUrl: './employee-details.component.html',
	styleUrls: ['./employee-details.component.scss'],
})
export class EmployeeDetailsComponent implements OnInit {
	businessType = [];
	industryType = [];

	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', Validators.required),
		status: new FormControl(''),
		role: new FormControl(ROLES.EMPLOYEE, [Validators.required]),
		onboardingBase: new FormControl('', [Validators.required]),
		designation: new FormControl(''),
		timeShiftId: new FormControl(''),
		teamId: new FormControl(''),
		profileIdentifier: new FormControl(''),
		userAssociations: new FormArray([], [Validators.required]),
	});
	errorMessages = employeeFieldForm;
	userAssociations = this.dataForm.get('userAssociations') as FormArray;
	isMobileNumberValid: boolean = false;
	collectionSize: number = 10;
	pageTeam: number = 1;
	pageSite: number = 1;
	pageManager: number = 1;

	siteList: any = [];
	regionList: any = [];
	managerList: any = [];
	teamList: any = [];
	shiftTimeList: any = [];
	onboardingBaseList = ['self', 'Protoverify', 'vendor'];
	roleList = [
		{
			label: 'Admin',
			value: ROLES.CLIENT_ADMIN,
		},
		{
			label: 'User',
			value: ROLES.CLIENT_USER,
		},
		{
			label: 'On boarder',
			value: ROLES.ON_BOARDER,
		},
		{
			label: 'Employee',
			value: ROLES.EMPLOYEE,
		},
	];

	verificationForm = new FormGroup({
		id: new FormControl(),
		type: new FormControl(planFeatures.AADHAR_CARD),
		cardNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.aadharCardPattern)]),
		additionalDetails: new FormControl(),
		userId: new FormControl(),
		requestId: new FormControl(),
		otp: new FormControl(),
		status: new FormControl('pending'),
	});
	aadharCard: any = {};
	kycStatus = kycStatus;
	otpSend: boolean = false;
	kycFieldForm = kycFieldForm;
	aadharVerified: boolean = false;

	duration: number = 90;
	minutes: any = '00';
	seconds: any = '00';
	canResendAadharOTP: boolean = false;
	setTimeOut: any;
	currentUser: any = {};
	associateId = null;
	constructor(
		private formBuilder: FormBuilder,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private employeeService: EmployeeService,
		private regionService: RegionsService,
		private sitesService: SitesService,
		private clientTeamService: ClientTeamsService,
		private sharedService: SharedService,
		private kycService: KycService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.userService.currentUser.subscribe((user) => {
			this.currentUser = user;
			this.addItem();
			if (this.modelData && this.modelData.hasOwnProperty('id')) {
				this.getData();
				this.getAadhar();
				this.associateId = this.modelData.associateId;
				this.getRegions({
					associateId: this.modelData.associateId,
				});
				this.getManager();
			} else {
				if (this.currentUser.role === ROLES.CLIENT_SUPER_ADMIN) {
					this.associateId = this.currentUser.id;
				} else {
					this.associateId = this.currentUser.associateId;
				}
				this.getRegions();
				this.getManager();
			}
		});
	}

	get form() {
		return this.dataForm.controls;
	}
	toggleResend() {
		this.canResendAadharOTP = !this.canResendAadharOTP;
	}
	startTimer() {
		// this.toggleResend();
		this.setTimeOut = setInterval(() => {
			if (this.duration <= 0) {
				this.stopTimer();
				return;
			}
			this.duration--;
			let min = this.duration / 60;
			let sec = this.duration % 60;
			this.minutes = String('0' + Math.floor(min)).slice(-2);
			this.seconds = String('0' + Math.floor(sec)).slice(-2);
		}, 1000);
	}
	ngOnDestroy() {
		clearInterval(this.setTimeOut);
	}
	stopTimer() {
		clearInterval(this.setTimeOut);
		this.toggleResend();
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

	getData() {
		this.spinnerService.start();
		this.employeeService.getById(this.modelData.id).subscribe({
			next: (result) => {
				this.modelData = result.data;
				this.dataForm.patchValue(this.modelData);
				if (this.modelData.userAssociations[0].regionId) {
					this.getTeams();
					this.getSites({
						regionId: this.modelData.userAssociations[0].regionId,
					});
					this.getTimeShift();
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmitAadhar(): void {
		if (this.verificationForm.invalid) {
			validateField(this.verificationForm);
			return;
		}
		this.spinnerService.start();
		this.requestOtp();
	}

	setDuration() {
		this.duration = 90;
	}
	requestOtp() {
		let params = { cardNumber: this.verificationForm.controls['cardNumber'].value };
		this.kycService.requestOtp(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.otpSend = true;
				this.canResendAadharOTP = false;
				this.setDuration();
				this.startTimer();
				if (result.data.isNumberLinked) {
					this.verificationForm.controls['requestId'].setValue(result.data.requestId);
					// this.toastService.success(result.message);
				} else {
					this.toastService.error(result.message);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	verifyAadhar() {
		this.spinnerService.start();
		let params = {
			otp: this.verificationForm.controls['otp'].value,
			cardNumber: this.verificationForm.controls['cardNumber'].value,
			requestId: this.verificationForm.controls['requestId'].value,
		};
		this.kycService.verifyAadhar(params).subscribe({
			next: (result) => {
				this.aadharVerified = true;
				this.otpSend = false;
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.form['name'].setValue(result.data.fullName);
				this.verificationForm.controls['additionalDetails'].setValue(result.data);
				this.form['profileIdentifier'].setValue(result.data.aadharNumber);
				this.aadharCard = result.data;
				this.aadharCard['additionalDetails'] = {
					address: this.aadharCard.address,
				};
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	getAadhar() {
		const payload = {
			userId: this.modelData.id,
			type: this.verificationForm.controls['type'].value,
		};
		this.kycService.getType(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) {
					this.aadharCard = result.data;
					this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
					this.verificationForm.patchValue(result.data);
					this.aadharVerified = true;
					this.otpSend = false;
					this.verificationForm.disable();
					this.verificationForm.controls['cardNumber'].setValidators([]);
					this.verificationForm.controls['cardNumber'].clearValidators();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	createAadhar(message): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/kyc` : `/kyc`;
		this.kycService.create(this.verificationForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	updateAadhar(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/kyc/${this.form['id'].value}`
			: `/kyc/${this.form['id'].value}`;
		this.kycService.update(this.verificationForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dismissModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		if (!this.aadharVerified) {
			this.toastService.error('Please verify your aadhar card');
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.employeeService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.verificationForm.controls['userId'].setValue(result.data.id);
				setTimeout(() => {
					this.createAadhar(result.message);
				}, 1500);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		this.employeeService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (!this.verificationForm.controls['id'].value) {
					this.verificationForm.controls['userId'].setValue(result.data.id);
					this.createAadhar(result.message);
				} else {
					this.closeModal();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	getTimeShift(): void {
		this.shiftTimeList = [];
		if (this.userAssociations.controls[0].get('sitesId').value) {
			this.sharedService
				.getTimeShift({ sitesId: this.userAssociations.controls[0].get('sitesId').value })
				.subscribe({
					next: (result) => {
						this.shiftTimeList = result.data;
						this.spinnerService.stop();
					},
					error: (error) => {
						this.toastService.error(error);
						this.spinnerService.stop();
					},
				});
		}
	}

	getRegions(params = {}): void {
		this.regionService.sharedList(params).subscribe({
			next: (result) => {
				this.regionList = result.data['rows'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	createItem(item, isNew) {
		return this.formBuilder.group({
			id: new FormControl(isNew ? null : item?.id),
			sitesId: new FormControl(isNew ? null : item?.sitesId, [Validators.required]),
			regionId: new FormControl(isNew ? null : item?.regionId, [Validators.required]),
			sitesName: new FormControl(isNew ? null : item?.name),
			status: new FormControl(item?.status ? item?.status : 'pending'),
			reportingManagerId: new FormControl(isNew ? null : item?.reportingManagerId),
			onBoardingManagerId: new FormControl(isNew ? null : item?.onBoardingManagerId),
		});
	}

	addItem() {
		this.userAssociations.push(this.createItem(null, true));
	}
	removeItem(index: number) {
		if (this.userAssociations.controls[index].get('id').value != null) {
			this.userAssociations.controls[index].get('status').setValue(defaultStatus.DELETED);
		} else {
			this.userAssociations.removeAt(index);
		}
	}
	onRegionChangeHandler($event) {
		this.getSites({
			regionId: $event.target.value,
		});
	}

	getSites(filters = {}): void {
		let params = {
			start: (this.pageSite - 1) * 10,
			limit: 10,
			status: defaultStatus.ACTIVE,
			associateId: this.associateId,
			...filters,
		};
		this.spinnerService.start();
		this.sitesService.list(params).subscribe({
			next: (result) => {
				this.siteList = result.data['rows'];
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	getManager(filter = {}) {
		let params = {
			start: (this.pageTeam - 1) * 20,
			limit: 20,
			status: defaultStatus.ACTIVE,
			associateId: this.associateId,
			...filter,
		};
		this.employeeService.list(params).subscribe({
			next: (result) => {
				this.managerList = result.data;
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	onSearchManager($event) {
		this.getManager({ search: $event.term });
	}

	onScrollToEndManager() {
		if (this.managerList['count'] === this.managerList['data'].length) {
			return;
		}
		this.pageManager += 1;
		this.getSites();
	}

	// get teams
	getTeams(filter = {}) {
		this.teamList = [];
		if (this.userAssociations.controls[0].get('sitesId').value) {
			let params = {
				start: (this.pageTeam - 1) * 20,
				limit: 20,
				sitesId: this.userAssociations.controls[0].get('sitesId').value,
				status: defaultStatus.ACTIVE,
				associateId: this.associateId,
				...filter,
			};
			this.clientTeamService.list(params).subscribe({
				next: (result) => {
					this.teamList = result.data;
				},
				error: (error) => {
					this.toastService.error(error);
				},
			});
		}
	}

	searchTeam($event) {
		this.getTeams({ search: $event.term });
	}
	onScrollTeam() {
		if (this.teamList.rows.length === this.teamList.count) {
			return;
		}
		this.pageTeam++;
		this.getTeams();
	}
}
