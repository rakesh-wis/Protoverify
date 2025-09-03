import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientTeamsService } from 'src/app/core/services/client-teams.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { RegionsService } from 'src/app/core/services/regions.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { accessManagementTypes, defaultStatus, Designation, OPTIONS, ROLES } from 'src/app/helpers';
import { clientTeamFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { SitesService } from 'src/app/core/services/sites.service';

@Component({
	selector: 'app-client-team-details',
	templateUrl: './client-team-details.component.html',
	styleUrls: ['./client-team-details.component.scss'],
})
export class ClientTeamDetailsComponent implements OnInit {
	@Input() modelData: any = null;
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		designation: new FormControl('', [Validators.required]),
		userAssociations: new FormArray([], [Validators.required]),
		accessManagement: new FormArray([]),
		role: new FormControl(ROLES.CLIENT_ADMIN),
	});
	accessManagementList: any = [
		{
			label: 'Candidate Management',
			type: accessManagementTypes.VERIFICATION_MANAGEMENT,
			view: true,
			add: false,
			edit: false,
			delete: false,
		},
	];
	accessManagement = this.dataForm.get('accessManagement') as FormArray;
	userAssociations = this.dataForm.get('userAssociations') as FormArray;
	errorMessages = clientTeamFieldForm;
	siteList: any = [];
	regionList: any = [];
	role = ROLES;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 500;
	pageSelectSite: number = 1;
	selectedSite: any = [];
	isMobileNumberValid: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientTeamsService: ClientTeamsService,
		private regionService: RegionsService,
		private sitesService: SitesService
	) {}

	ngOnInit(): void {
		this.addItemUserAssociation();
		if (!this.modelData) {
			this.addItems();
		}
		this.getRegions();
	}
	createItemUserAssociation(item, isNew) {
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

	addItemUserAssociation() {
		this.userAssociations.push(this.createItemUserAssociation(null, true));
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
			if ($event.target.checked)
				this.accessManagement.controls[index].get('view').setValue($event.target.checked);
			this.accessManagement.controls[index].get('add').setValue($event.target.checked);
		} else {
			if ($event.target.checked)
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
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.clientTeamsService.create(this.dataForm.getRawValue()).subscribe({
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
		this.clientTeamsService.update(this.dataForm.getRawValue()).subscribe({
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

	patchForm() {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
			this.accessManagementList.forEach((element) => {
				let item = this.modelData.accessManagement.find((access) => access.type === element.type);
				if (item && item.id) {
					item['label'] = element.label;
					this.accessManagement.push(this.createItem(item));
				} else {
					this.accessManagement.push(this.createItem(element));
				}
			});
			if (this.modelData.userAssociations && this.modelData.userAssociations.length > 0) {
				this.getSites({
					regionId: this.modelData.userAssociations[0].regionId,
				});
			}
		}
	}

	getRegions(): void {
		this.regionService.sharedList({}).subscribe({
			next: (result) => {
				this.regionList = result.data['rows'];
				this.patchForm();
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	getSites(filters = {}): void {
		let params = {
			start: (this.pageSelectSite - 1) * this.pageSize,
			limit: this.pageSize,
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

	onScrollToEnd() {
		if (this.siteList['count'] === this.siteList['data'].length) {
			return;
		}
		this.pageSelectSite += 1;
		this.getSites();
	}

	onSearch($event) {
		this.getSites({ search: $event.term });
	}

	onRegionChangeHandler($event) {
		this.getSites({
			regionId: $event.id,
		});
	}

	onChangeIsGlobalHandler() {
		if (!this.form['isGlobal'].value) {
			this.dataForm.get('regionId').addValidators(Validators.required);
			this.dataForm.get('clientTeam').addValidators(Validators.required);
		} else {
			this.dataForm.get('regionId').clearValidators();
			this.dataForm.get('clientTeam').clearValidators();
		}
		this.dataForm.get('regionId').updateValueAndValidity();
		this.dataForm.get('clientTeam').updateValueAndValidity();
	}
}
