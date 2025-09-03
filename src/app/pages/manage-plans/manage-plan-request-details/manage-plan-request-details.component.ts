import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BusinessDetailsService } from 'src/app/core/services/business-details.service';
import { ClientPlanService } from 'src/app/core/services/client-plan.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, planModules, planModulesFeatures } from 'src/app/helpers';
import { clientRequestPlanForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { connectionType } from '../../../helpers/constants.helper';

@Component({
	selector: 'app-manage-plan-request-details',
	templateUrl: './manage-plan-request-details.component.html',
	styleUrls: ['./manage-plan-request-details.component.scss'],
})
export class ManagePlanRequestDetailsComponent implements OnInit {
	@Input() modelData;
	@Input() canEdit: boolean = false;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		createdAt: new FormControl(),
		status: new FormControl(''),
		planType: new FormControl('customize'),
		module: new FormControl('', [Validators.required]),
		noOfVerification: new FormControl(''),
		amountPerVerification: new FormControl('', [Validators.required]),
		totalAmount: new FormControl(0),
		userPlanRequestFeature: new FormControl([], [Validators.required]),
		userPlan: new FormControl([]),
		selectedPlanFeature: new FormControl([]),
		connectionType: new FormControl(connectionType.POST_PAID),
	});
	selectPlanFeature = [];
	removedPlanFeature = [];
	copyPlanFeature = [];

	errorMessages = clientRequestPlanForm;
	modulesList: any = planModules;
	planType = ['standard', 'customize'];
	planItemsList = planModulesFeatures;
	selectedItem: string;

	organizationList: any = [];
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;
	defaultStatus = defaultStatus;
	connectionType = connectionType;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientPlanService: ClientPlanService,
		private businessDetailsService: BusinessDetailsService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.getPlan();
			// this.getClientDetails();
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	fetchFeatureList(module: string) {
		return this.modelData.userPlanRequestFeature.filter((element) => element.module === module);
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	patchForm() {
		this.dataForm.patchValue(this.modelData);
		this.dataForm.get('createdAt').setValue(this.modelData.createdAt.split('T')[0]);
		this.form['module'].value.map((item) => {
			const module = this.modulesList.filter((m) => m.value === item);
			this.addModules(module[0]);
		});
		this.form['userPlan'].setValue(this.modelData.userPlan.map((element) => element.id));
		const featureArray = [];
		this.modelData.userPlanRequestFeature.map((item) => {
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
		this.form['userPlanRequestFeature'].setValue(featureArray);
		this.copyPlanFeature = featureArray;
		if (this.modelData.status != defaultStatus.PENDING) {
			this.dataForm.disable();
		}
		if (!this.canEdit) {
			this.dataForm.disable();
		}
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
	getPlanTitle(item) {
		return planModulesFeatures.find((e) => e.value === item.title);
	}
	getClientDetails(): void {
		let params = { userId: this.modelData.userId };
		this.businessDetailsService.getData(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['organizationName'].setValue(result.data.registeredName);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	getPlan() {
		this.spinnerService.start();
		this.clientPlanService.getById(this.modelData.id).subscribe({
			next: (result) => {
				this.modelData = result.data;
				this.modelData.userPlan = [{ id: result.data.user.id }];
				this.patchForm();
				this.form['planType'].setValue(this.planType[1]);
				this.form['planType'].disable();
				this.form['userPlan'].disable();
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
		this.create();
	}

	create(): void {
		this.form['userPlanRequestFeature'].setValue(this.form['selectedPlanFeature'].value.filter((e) => e.checked));
		let payload = this.dataForm.getRawValue();
		delete payload.selectedPlanFeature;
		this.clientPlanService.approve(payload).subscribe({
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

			const index = this.removedPlanFeature.findIndex((element) => element?.label === item.label);
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
