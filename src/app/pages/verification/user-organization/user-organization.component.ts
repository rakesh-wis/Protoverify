import { Location } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { ClientService } from 'src/app/core/services/client.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { defaultStatus, OPTIONS, ROLES } from 'src/app/helpers';
import { employeeFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-user-organization',
	templateUrl: './user-organization.component.html',
	styleUrls: ['./user-organization.component.scss'],
})
export class UserOrganizationComponent implements OnInit {
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', Validators.required),
		status: new FormControl(''),
		role: new FormControl(''),
		onboardingBase: new FormControl(''),
		designation: new FormControl(''),
		timeShiftId: new FormControl(''),
		teamId: new FormControl(''),
		profileIdentifier: new FormControl(''),
		associateId: new FormControl('', [Validators.required]),
		userAssociations: new FormArray([], [Validators.required]),
	});
	collectionSizeClient: number = 0;
	pageClient: number = 1;
	pageSizeClient: number = 20;
	organizationList: any = [];
	roles = ROLES;

	errorMessages = employeeFieldForm;
	userAssociations = this.dataForm.get('userAssociations') as FormArray;
	siteList: any = [];
	regionList: any = [];
	shiftTimeList: any = [];
	userId = null;
	userData: any = null;
	collectionSize: number = 10;
	pageSite: number = 1;

	currentUser: any;
	isAdminAccess: boolean = false;
	organizationName: string;
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private employeeService: EmployeeService,
		private formBuilder: FormBuilder,
		private sharedService: SharedService,
		private regionService: RegionsService,
		private sitesService: SitesService,
		private clientService: ClientService,
		private userService: UserService,
		private verificationDetailsService: VerificationDetailsService
	) {}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.addItem();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['id'].setValue(this.userId);
			this.getData();
		});
	}

	private setOrganizationName(): void {
		if (this.currentUser.role === ROLES.CLIENT_SUPER_ADMIN) {
			this.organizationName = this.currentUser.businessDetails.registeredName;
		} else if (ROLES.getClientArray(false).includes(this.currentUser.role)) {
			this.organizationName = this.userData.associated.businessDetails.registeredName;
		} else {
			this.organizationName = this.userData['associated']['businessDetails'].registeredName;
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	getClientList(filter = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSizeClient,
			limit: this.pageSizeClient,
			status: defaultStatus.ACTIVE,
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = result.data;
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
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (this.organizationList.rows.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClientList();
	}

	getData() {
		this.spinnerService.start();
		this.employeeService.getById(this.userId).subscribe({
			next: (result) => {
				this.userData = result.data;
				this.setOrganizationName();
				this.dataForm.patchValue(this.userData);
				if (
					ROLES.getAdminArray().includes(this.currentUser.role) &&
					ROLES.getAdminArray().includes(this.userData.associated.role)
				) {
					this.getClientList();
					this.isAdminAccess = true;
				} else {
					this.getRegions({ associateId: this.userData.associateId });
				}
				if (this.userData.userAssociations && this.userData.userAssociations.length > 0) {
					this.getSites({
						regionId: this.userData.userAssociations[0].regionId,
					});
					// this.getTimeShift();
					// this.dataForm.disable();
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.employeeService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
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
			associateId: this.userData.associateId,
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
	goBack() {
		this.location.back();
	}
	goNext() {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.verificationDetailsService.navigateToNext(path, 'organization-details', this.userData);
	}
}
