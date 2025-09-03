import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, OPTIONS, planFeatures, planModulesFeatures, ROLES, verificationStatus } from 'src/app/helpers';
import { employeeFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { FavouritePlanService } from '../../../core/services/favourite-plan.service';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';
import { UserService } from 'src/app/core';
import { ClientService } from 'src/app/core/services/client.service';

@Component({
	selector: 'app-user-details',
	templateUrl: './user-details.component.html',
	styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', Validators.required),
		status: new FormControl(''),
		planType: new FormControl('favourite'),
		role: new FormControl(ROLES.EMPLOYEE),
		onboardingBase: new FormControl('self'),
		designation: new FormControl('', [Validators.required]),
		verificationChecks: new FormControl([], [Validators.required]),
		userAssociations: new FormArray([], [Validators.required]),
		customEmployeeId: new FormControl(''),
		associateId: new FormControl(''),
	});
	errorMessages = employeeFieldForm;
	isMobileNumberValid: boolean = false;
	userAssociations = this.dataForm.get('userAssociations') as FormArray;

	selectedPlan: any = {};
	verificationList = [];
	favouritePlanList = [];
	collectionSize: number = 10;
	pageSite: number = 1;
	siteList: any = [];
	regionList: any = [];
	VERIFICATION_BASE_URL = `${VERIFICATION_BASE_URL}/assets/verification/active/`;
	planFeatures = planFeatures;

	user: any;
	pageClient: number = 1;
	pageSize: number = 10;
	collectionSizeClient: number = 0;
	organizationList: any = [];
	role = ROLES;
	canVIewCLientSelection: boolean = false;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private employeeService: EmployeeService,
		private subscriptionService: SubscriptionService,
		private sitesService: SitesService,
		private regionService: RegionsService,
		private formBuilder: FormBuilder,
		private favouritePlanService: FavouritePlanService,
		private userService: UserService,
		private clientService: ClientService
	) {}

	ngOnInit(): void {
		this.user = this.userService.getCurrentUser();
		this.canVIewCLientSelection =
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_OPERATION].includes(
				this.user.role
			) && !sessionStorage.getItem('clientId');
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			if (this.modelData?.userAssociations[0]?.regionId) {
				this.getSites({
					regionId: this.modelData.userAssociations[0].regionId,
				});
			}
			this.dataForm.patchValue(this.modelData);
			this.userAssociations.push(this.createItem(this.modelData?.userAssociations[0], false));
			this.form['planType'].setValue('customized');
		} else {
			this.addItem();
		}
		if (ROLES.getAdminArray().includes(this.user.role) && !sessionStorage.getItem('clientId')) {
			this.getClientList();
		} else {
			this.getRegions();
			this.loadPlans();
			this.loadFavouritePlan();
		}
	}
	getClientList(filter = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSize,
			limit: this.pageSize,
			status: defaultStatus.ACTIVE,
			column: 'registeredName',
			direction: 'asc',
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				this.organizationList.map(
					(e) => (e['registeredName'] = e.businessDetails?.registeredName || e?.registeredName)
				);
				this.collectionSizeClient = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchClient($event) {
		this.pageClient = 1;
		this.organizationList = [];
		this.collectionSize = 0;
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (this.organizationList.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClientList();
	}
	changeClient($event): void {
		this.siteList = this.verificationList = this.favouritePlanList = [];
		this.userAssociations.controls[0].get('regionId').setValue('');
		this.userAssociations.controls[0].get('sitesId').setValue('');
		this.userAssociations.controls[0].get('sitesName').setValue('');
		this.getRegions({ associateId: $event.id });
		this.loadPlans({ associateId: $event.id });
		this.loadFavouritePlan({ associateId: $event.id });
	}
	getListRange(value): number[] {
		switch (value) {
			case planFeatures.EDUCATIONAL:
				return Array.from({ length: 3 }, (_, i) => i + 1);
			case planFeatures.PAST_EMPLOYMENT:
				return Array.from({ length: 10 }, (_, i) => i + 1);
			case planFeatures.REFERENCE_CHECK:
				return Array.from({ length: 3 }, (_, i) => i + 1);
			default:
				return Array.from({ length: 3 }, (_, i) => i + 1);
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	createItem(item, isNew) {
		return this.formBuilder.group({
			id: new FormControl(isNew ? null : item?.id),
			sitesId: new FormControl(isNew ? '' : item?.sitesId, [Validators.required]),
			regionId: new FormControl(isNew ? '' : item?.regionId, [Validators.required]),
			sitesName: new FormControl(isNew ? '' : item?.name),
			status: new FormControl(item?.status ? item?.status : 'pending'),
			reportingManagerId: new FormControl(isNew ? null : item?.reportingManagerId),
			onBoardingManagerId: new FormControl(isNew ? null : item?.onBoardingManagerId),
		});
	}

	addItem() {
		this.userAssociations.push(this.createItem(null, true));
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
	loadFavouritePlan(filter = {}): void {
		let params = {
			start: 0,
			limit: 20,
			...filter,
		};
		this.spinnerService.start();
		this.favouritePlanService.list(params).subscribe({
			next: (result) => {
				const favouritePlanList = [];
				result.data['rows'].forEach((plan) => {
					plan.favouritePlanFeatures = plan.favouritePlanFeatures.map((item) => {
						let feature = planModulesFeatures.find((e) => e.value === item.title);
						return Object.assign({
							...item,
							title: feature.title,
							value: feature.value,
							label: feature.label,
							maxUploadNumber: item.maxUploadNumber || 1,
						});
					});
					favouritePlanList.push(plan);
				});
				this.favouritePlanList = favouritePlanList;
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onCheckFavouritePlan(item) {
		this.selectedPlan = item;
		this.dataForm.get('verificationChecks').setValue(this.selectedPlan.favouritePlanFeatures);
	}

	onChangePlanType() {
		if (this.form['planType'].value === 'favourite') {
			this.dataForm.get('verificationChecks').setValue([]);
		} else {
			this.selectedPlan = null;
		}
	}

	onSubmit(): void {
		if (this.dataForm.get('planType').value !== 'favourite') {
			const selectedVerification = this.verificationList.filter((e) => e.checked);
			this.dataForm.get('verificationChecks').setValue(selectedVerification);
		}
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.employeeService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
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
				this.toastService.success(result.message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	loadPlans(params = {}) {
		this.spinnerService.start();
		this.subscriptionService.listVerificationCheck(params).subscribe({
			next: (result) => {
				const checks = [];
				planModulesFeatures.forEach((verification) => {
					const isData = result.data.find((e) => e.title == verification.value);
					const verificationCheck = this.modelData
						? this.modelData.verificationCount.verificationList.find((e) => e.value == verification.value)
						: null;
					if (isData && verificationCheck) {
						checks.push({
							title: verification.title,
							value: verification.value,
							checked: true,
							selected: true,
							disabled: this.modelData.verificationStatus === verificationStatus.PROTO_VERIFIED,
							price: isData.price,
							maxUploadNumber: verificationCheck.maxUploadNumber,
						});
					} else if (isData) {
						if (isData) {
							checks.push({
								title: verification.title,
								value: verification.value,
								checked: verification.value === planFeatures.AADHAR_CARD ?? false,
								selected: verification.value === planFeatures.AADHAR_CARD ?? false,
								price: isData.price,
								maxUploadNumber: 1,
								disabled:
									this.modelData &&
									this.modelData.verificationStatus === verificationStatus.PROTO_VERIFIED,
							});
						}
					}
				});
				this.verificationList = checks;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
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
			...filters,
			...(this.form['associateId'].value && {
				associateId: this.form['associateId'].value,
			}),
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
}
