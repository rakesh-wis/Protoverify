import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/core/services/client.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SystemUserService } from 'src/app/core/services/system-user.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
	accessManagementTypes,
	defaultStatus,
	Designation,
	OPTIONS,
	planModulesFeatures,
	ROLES,
} from 'src/app/helpers';
import { teamFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-admin-team-details',
	templateUrl: './admin-team-details.component.html',
	styleUrls: ['./admin-team-details.component.scss'],
})
export class AdminTeamDetailsComponent implements OnInit {
	@Input() memberId: number = null;
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', Validators.required),
		role: new FormControl('', [Validators.required]),
		designation: new FormControl(''),
		accessManagement: new FormArray([]),
		userClient: new FormControl([]),
		verificationChecks: new FormControl([]),
	});
	accessManagement!: FormArray;
	userClient!: FormArray;

	errorMessages = teamFieldForm;
	organizationList: any = [];
	role = ROLES;
	rolesList: any = ROLES.getAdminList().filter((e) => e.value != ROLES.PROTO_SUPER_ADMIN);
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 20;
	accessManagementList: any = [
		{
			label: 'Client Management',
			type: accessManagementTypes.CLIENT_MANAGEMENT,
			view: false,
			add: false,
			edit: false,
			delete: false,
			forRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			label: 'Plan Management',
			type: accessManagementTypes.PLAN_MANAGEMENT,
			view: false,
			add: false,
			edit: false,
			delete: false,
			forRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			label: 'Admin Management',
			type: accessManagementTypes.ADMIN_MANAGEMENT,
			view: false,
			add: false,
			edit: false,
			delete: false,
			forRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		// {
		// 	label: 'Groups Management',
		// 	type: accessManagementTypes.GROUP_MANAGEMENT,
		// 	view: false,
		// 	add: false,
		// 	edit: false,
		// 	delete: false,
		// 	forRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		// },
		// {
		// 	label: 'Employee Management',
		// 	type: accessManagementTypes.EMPLOYEE_MANAGEMENT,
		// 	view: false,
		// 	add: false,
		// 	edit: false,
		// 	delete: false,
		// 	forRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		// },
		{
			label: 'Candidate Management',
			type: accessManagementTypes.VERIFICATION_MANAGEMENT,
			view: false,
			add: false,
			edit: false,
			delete: false,
			forRole: [
				ROLES.PROTO_SUPER_ADMIN,
				ROLES.PROTO_ADMIN,
				ROLES.PROTO_USER,
				ROLES.PROTO_LAWYER,
				ROLES.PROTO_OPERATION,
			],
		},
		{
			label: 'Vendor Management',
			type: accessManagementTypes.VENDOR_MANAGEMENT,
			view: false,
			add: false,
			edit: false,
			delete: false,
			forRole: [
				ROLES.PROTO_SUPER_ADMIN,
				ROLES.PROTO_ADMIN,
				ROLES.PROTO_USER,
				ROLES.PROTO_LAWYER,
				ROLES.PROTO_OPERATION,
			],
		},
	];
	isMobileNumberValid: boolean = false;
	planModulesFeatures = planModulesFeatures;
	constructor(
		public activeModal: NgbActiveModal,
		private formBuilder: FormBuilder,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private clientService: ClientService,
		private toastService: ToastService,
		private systemUuser: SystemUserService
	) {}

	ngOnInit(): void {
		this.getClientList();
		if (this.memberId) {
			this.getDataById();
		} else {
			this.addItems();
		}
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: new FormControl(item.label),
			type: new FormControl(item.type),
			view: new FormControl(item.view),
			add: new FormControl(item.add),
			edit: new FormControl(item.edit),
			delete: new FormControl(item.delete),
			forRole: new FormControl(item.forRole),
		});
	}

	addItems(): void {
		this.accessManagement = this.dataForm.get('accessManagement') as FormArray;
		this.accessManagementList.forEach((element) => {
			this.accessManagement.push(this.createItem(element));
		});
	}

	checkView($event, index: number, type: string): void {
		if (type === 'add') {
			this.accessManagement.controls[index].get('view').setValue($event.target.checked);
			this.accessManagement.controls[index].get('add').setValue($event.target.checked);
		} else {
			this.accessManagement.controls[index].get('view').setValue($event.target.checked);
			this.accessManagement.controls[index].get('edit').setValue($event.target.checked);
		}
	}

	get form() {
		return this.dataForm.controls;
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
	getDataById(): void {
		this.systemUuser.getById(this.memberId).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.accessManagement = this.dataForm.get('accessManagement') as FormArray;
				this.dataForm.patchValue(result.data);
				this.form['userClient'].setValue(result.data.userClient.map((element) => element.id));
				this.accessManagementList.forEach((element) => {
					let item = result.data.accessManagement.find((access) => access.type === element.type);
					if (item && item.id) {
						item['label'] = element.label;
						item['forRole'] = element.forRole;
						this.accessManagement.push(this.createItem(item));
					} else {
						this.accessManagement.push(this.createItem(element));
					}
				});
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
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
		if (this.form['designation'].value === ROLES.ON_BOARDER) {
			this.form['role'].setValue(ROLES.ON_BOARDER);
		}

		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.systemUuser.create(this.dataForm.getRawValue()).subscribe({
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
		this.systemUuser.update(this.dataForm.getRawValue()).subscribe({
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

	getClientList(filter = {}) {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			column: 'registeredName',
			direction: 'asc',
			status: defaultStatus.ACTIVE,
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				console.log(this.organizationList);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onSearch($event) {
		this.getClientList({ search: $event.term });
	}

	onScrollClient() {
		if (
			this.organizationList.length - (window.sessionStorage.getItem('clientId') ? 2 : 1) ===
			this.collectionSize
		) {
			return;
		}
		this.page++;
		this.getClientList();
	}
}
