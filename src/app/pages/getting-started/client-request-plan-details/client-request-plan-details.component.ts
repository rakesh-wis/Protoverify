import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientPlanService } from 'src/app/core/services/client-plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { planTitles, planModules, planModulesFeatures, connectionType } from 'src/app/helpers';
import { clientRequestPlanForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-client-request-plan-details',
	templateUrl: './client-request-plan-details.component.html',
	styleUrls: ['./client-request-plan-details.component.scss'],
})
export class ClientRequestPlanDetailsComponent implements OnInit {
	@Input() modelData: any = null;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		module: new FormControl([planModules[0].value], [Validators.required]),
		userPlanRequestFeature: new FormControl([], [Validators.required]),
		selectedPlanFeature: new FormControl([]),
		connectionType: new FormControl(connectionType.POST_PAID),
		noOfVerification: new FormControl(null),
	});
	planItemsList = planModulesFeatures;
	planTitleList = planTitles;
	modulesList: any = planModules;
	connectionType = connectionType;

	selectPlanFeature = [];
	removedPlanFeature = [];
	copyPlanFeature = [];

	errorMessages = clientRequestPlanForm;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientPlanService: ClientPlanService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.getPlan();
		} else {
			this.addModules(this.modulesList[0]);
		}
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
	patchForm() {
		console.log(this.modelData.userPlanRequestFeature);
		this.dataForm.patchValue(this.modelData);
		this.form['module'].value.map((item) => {
			const module = this.modulesList.find((m) => m.value === item);
			this.addModules(module);
		});
		console.log(this.dataForm.value);

		const featureArray = [];
		this.modelData.userPlanRequestFeature.map((item) => {
			const index = this.form['selectedPlanFeature'].value.findIndex(
				(sp) => sp.value === item.title && sp.module === item.module
			);
			if (index > -1) {
				this.form['selectedPlanFeature'].value[index].checked = true;
				this.form['selectedPlanFeature'].value[index].id = item.id;
				featureArray.push(this.form['selectedPlanFeature'].value[index]);
			}
		});
		this.form['userPlanRequestFeature'].setValue(featureArray);
		this.spinnerService.stop();
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
	clearAll() {
		this.form['selectedPlanFeature'].setValue([]);
		this.form['userPlanRequestFeature'].setValue([]);
	}
	removeModules($event) {
		let oldValues = this.form['selectedPlanFeature'].value;
		this.form['selectedPlanFeature'].setValue([...oldValues.filter((ele) => ele.module != $event.value.value)]);
	}
	removeItem($event, item) {
		if ($event.target.checked) {
			item.value.checked = true;

			const index = this.removedPlanFeature.findIndex((element) => element.label === item.label);
			if (index > -1) this.removedPlanFeature.splice(index, 1);
		} else {
			const found = this.copyPlanFeature.find((feature) => feature === item.value);
			if (found) {
				item.value.checked = false;
				item.value['status'] = 'deleted';
				this.removedPlanFeature.push(item.value);
			}
		}
	}
	getPlan() {
		this.spinnerService.start();
		this.clientPlanService.getById(this.modelData.id).subscribe({
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

	onSubmit(): void {
		if (this.dataForm.get('connectionType').value === connectionType.PRE_PAID) {
			this.dataForm.get('noOfVerification').setValidators([Validators.required]);
		} else {
			this.dataForm.get('noOfVerification').setValue(0);
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
		this.clientPlanService.create(payload).subscribe({
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
		let payload = this.dataForm.getRawValue();
		delete payload.selectedPlanFeature;
		payload.userPlanRequestFeature = [...payload.userPlanRequestFeature, ...this.removedPlanFeature];
		this.clientPlanService.update(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dismissModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
