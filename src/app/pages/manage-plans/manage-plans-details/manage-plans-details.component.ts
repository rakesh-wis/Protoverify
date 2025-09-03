import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/core/services/client.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, maskForInputFields, planFeatures, planModules, planModulesFeatures } from 'src/app/helpers';
import { managePlanFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { connectionType } from '../../../helpers/constants.helper';

@Component({
	selector: 'app-manage-plans-details',
	templateUrl: './manage-plans-details.component.html',
	styleUrls: ['./manage-plans-details.component.scss'],
})
export class ManagePlansDetailsComponent implements OnInit, OnDestroy {
	@Input() modelData;
	@Input() isNewRequestedPlan?: boolean = false;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		status: new FormControl(''),
		planType: new FormControl('customize', [Validators.required]),
		module: new FormControl('', [Validators.required]),
		noOfVerification: new FormControl(''),
		amountPerVerification: new FormControl('', [Validators.required]),
		totalAmount: new FormControl(''),
		connectionType: new FormControl(connectionType.POST_PAID),
		planFeature: new FormControl([], [Validators.required]),
		userPlan: new FormControl([], [Validators.required]),
		selectedPlanFeature: new FormControl([]),
	});
	selectPlanFeature = [];
	removedPlanFeature = [];
	copyPlanFeature = [];
	connectionType = connectionType;
	errorMessages = managePlanFieldForm;

	modulesList: any = [planModules[0]];
	planType = ['standard', 'customize'];
	planItemsList = planModulesFeatures;
	selectedItem: string;

	organizationList: any = [];
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;
	constructor(
		private formBuilder: FormBuilder,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private planService: PlanService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientService: ClientService
	) {}

	ngOnInit(): void {
		this.getClientList();
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.getPlan();
		}
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
	patchForm() {
		console.log(this.modelData);
		this.dataForm.patchValue(this.modelData);
		this.form['module'].value.map((item) => {
			const module = this.modulesList.filter((m) => m.value === item);
			this.addModules(module[0]);
		});
		if (this.form['planType'].value !== 'standard') {
			this.form['userPlan'].setValue(this.modelData.userPlan[0].id);
		}
		// console.log(this.dataForm.value);
		this.checkPlanType();
		const featureArray = [];
		this.modelData.planFeature.map((item) => {
			const index = this.form['selectedPlanFeature'].value.findIndex(
				(sp) => sp.value === item.title && sp.module === item.module
			);
			if (index > -1) {
				this.form['selectedPlanFeature'].value[index].checked = true;
				this.form['selectedPlanFeature'].value[index].selected = true;
				this.form['selectedPlanFeature'].value[index].id = item.id;
				this.form['selectedPlanFeature'].value[index].price = item.price;
				featureArray.push(this.form['selectedPlanFeature'].value[index]);
			}
		});
		// console.log('featureArray', featureArray)
		this.form['planFeature'].setValue(featureArray);
		this.copyPlanFeature = featureArray;
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

	addModules($event) {
		let oldValues = this.form['selectedPlanFeature'].value;
		if (oldValues.length < 1) {
			this.form['selectedPlanFeature'].setValue([...this.planItemsList.filter((e) => e.module === $event.value)]);
		} else {
			this.form['selectedPlanFeature'].setValue([
				...oldValues,
				...this.planItemsList.filter((e) => e.module === $event.value),
			]);
		}
	}
	removeModules($event) {
		let oldValues = this.form['selectedPlanFeature'].value;
		this.form['selectedPlanFeature'].setValue([...oldValues.filter((ele) => ele.module != $event.value.value)]);
	}
	clearAll() {
		this.form['selectedPlanFeature'].setValue([]);
		this.form['planFeature'].setValue([]);
	}

	checkPlanType() {
		if (this.dataForm.get('planType').value !== 'standard') {
			this.dataForm.get('userPlan').setValidators([Validators.required]);
		} else {
			this.dataForm.get('userPlan').clearValidators();
		}
		this.dataForm.get('userPlan').updateValueAndValidity();
	}

	getPlan() {
		this.spinnerService.start();
		if (this.isNewRequestedPlan) {
			// this.planService.getUserRequestedPlanById(this.modelData.id).subscribe({
			// 	next: (result) => {
			// 		this.modelData = result.data;
			// 		this.patchForm();
			// 	},
			// 	error: (error) => {
			// 		this.spinnerService.stop();
			// 		this.toastService.error(error);
			// 	},
			// });
		} else {
			this.planService.getById(this.modelData.id).subscribe({
				next: (result) => {
					this.modelData = result.data;
					this.patchForm();
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		}
	}

	onSubmit(): void {
		this.form['planFeature'].setValue(this.form['selectedPlanFeature'].value.filter((e) => e.checked));
		if (this.dataForm.get('connectionType').value === connectionType.PRE_PAID) {
			this.dataForm.get('noOfVerification').setValidators([Validators.required]);
		} else {
			this.dataForm.get('noOfVerification').clearValidators();
		}
		this.dataForm.get('noOfVerification').updateValueAndValidity();
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		let payload = this.dataForm.getRawValue();
		delete payload.selectedPlanFeature;
		this.planService.create(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
				this.planService.refreshTable.next(true);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		let payload = this.dataForm.getRawValue();
		delete payload.selectedPlanFeature;
		payload.planFeature = [...payload.planFeature, ...this.removedPlanFeature];
		this.planService.update(payload).subscribe({
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
			...filter,
			status: defaultStatus.ACTIVE,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				this.organizationList.map((e) => (e['registeredName'] = e.businessDetails?.registeredName));
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchClient($event) {
		this.organizationList = [];
		this.collectionSize = 0;
		this.getClientList({ search: $event.term });
	}
	applyFilters() {
		this.getClientList();
	}
	onScrollClient() {
		if (this.organizationList.length === this.collectionSize) {
			return;
		}
		this.page++;
		this.getClientList();
	}
	onPriceChange() {
		this.dataForm
			.get('amountPerVerification')
			.setValue(
				this.form['selectedPlanFeature'].value
					.filter((e) => e.checked)
					.reduce((accumulator, currentValue) => accumulator + (currentValue.price ?? 0), 0)
			);
		const total = this.dataForm.get('noOfVerification').value * this.dataForm.get('amountPerVerification').value;
		this.form['totalAmount'].setValue(total);
	}

	removeItem($event, item) {
		if ($event.target.checked) {
			item.checked = true;

			const index = this.removedPlanFeature.findIndex((element) => element.label === item.label);
			if (index > -1) this.removedPlanFeature.splice(index, 1);
		} else {
			const found = this.copyPlanFeature.find((feature) => feature === item.value);
			if (found) {
				item.checked = false;
				item['status'] = 'deleted';
				this.removedPlanFeature.push(item.value);
			}
		}
	}
}
