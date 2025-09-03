import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavouritePlanService } from 'src/app/core/services/favourite-plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { planModules, connectionType, planModulesFeatures, planFeatures } from 'src/app/helpers';
import { clientRequestPlanForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { SubscriptionService } from 'src/app/core/services/subscription.service';

@Component({
	selector: 'app-favourite-plan-details',
	templateUrl: './favourite-plan-details.component.html',
	styleUrls: ['./favourite-plan-details.component.scss'],
})
export class FavouritePlanDetailsComponent implements OnInit {
	@Input() modelData: any = null;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		favouritePlanFeatures: new FormControl([], [Validators.required]),
		amountPerVerification: new FormControl(0),
	});
	errorMessages = clientRequestPlanForm;
	planFeatures = planFeatures;

	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private favouritePlanService: FavouritePlanService,
		private subscriptionService: SubscriptionService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
		}
		this.listVerificationCheck();
	}
	getListRange(value): number[] {
		switch (value) {
			case planFeatures.EDUCATIONAL:
				return Array.from({ length: 3 }, (_, i) => i + 1);
			case planFeatures.PAST_EMPLOYMENT:
				return Array.from({ length: 5 }, (_, i) => i + 1);
			case planFeatures.REFERENCE_CHECK:
				return Array.from({ length: 3 }, (_, i) => i + 1);
			default:
				return Array.from({ length: 3 }, (_, i) => i + 1);
		}
	}
	addRemoveItem($event, item) {
		if ($event.target.checked) {
			item.checked = true;
			delete item['status'];
			this.dataForm
				.get('amountPerVerification')
				.setValue(this.dataForm.get('amountPerVerification').value + item?.price * item?.maxUploadNumber);
		} else {
			item.checked = false;
			item['status'] = 'deleted';
			this.dataForm
				.get('amountPerVerification')
				.setValue(this.dataForm.get('amountPerVerification').value - item?.price * item?.maxUploadNumber);
		}
	}
	onDropdownChange(item) {
		let totalPrice = 0;
		if (item.checked) {
			const selectedVerifications = this.form['favouritePlanFeatures'].value.filter((e) => e.checked);
			selectedVerifications.forEach((item) => {
				const price = parseFloat(item.price); // Convert price to number
				const maxUploadNumber = parseFloat(item.maxUploadNumber); // Convert maxUploadNumber to number
				if (!isNaN(price) && !isNaN(maxUploadNumber)) {
					// Check if price and maxUploadNumber are valid numbers
					totalPrice += price * maxUploadNumber; // Calculate subtotal for each item
				}
			});
			this.dataForm.get('amountPerVerification').setValue(totalPrice);
		}
	}

	listVerificationCheck(): void {
		this.subscriptionService.listVerificationCheck({ associateId: this.modelData?.userId }).subscribe({
			next: (result) => {
				const checks = [];
				planModulesFeatures.forEach((verification) => {
					const isData = result.data.find((e) => e.title == verification.value);
					const favouritePlanFeatures = this.modelData
						? this.modelData.favouritePlanFeatures.find((e) => e.title == verification.value)
						: null;
					if (isData && favouritePlanFeatures) {
						checks.push({
							id: favouritePlanFeatures.id,
							title: verification.title,
							value: verification.value,
							checked: true,
							selected: true,
							price: isData.price,
							maxUploadNumber: favouritePlanFeatures.maxUploadNumber,
						});
					} else if (isData) {
						checks.push({
							title: verification.title,
							value: verification.value,
							checked: verification.value === planFeatures.AADHAR_CARD ?? false,
							selected: verification.value === planFeatures.AADHAR_CARD ?? false,
							price: isData.price,
							maxUploadNumber: 1,
						});
						if (verification.value === planFeatures.AADHAR_CARD) {
							this.dataForm
								.get('amountPerVerification')
								.setValue(this.dataForm.get('amountPerVerification').value + isData?.price);
						}
					}
				});
				this.dataForm.get('favouritePlanFeatures').setValue(checks);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
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

	closeModal() {
		this.activeModal.close('close with cancel button');
	}

	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();

		if (this.form['id'].value === null) {
			this.form['favouritePlanFeatures'].setValue(
				this.form['favouritePlanFeatures'].value.filter((e) => e.checked)
			);
			this.create();
		} else {
			this.form['favouritePlanFeatures'].setValue([
				...this.form['favouritePlanFeatures'].value.filter((e) => e.checked),
				...this.form['favouritePlanFeatures'].value.filter((e) => !e.checked && e.status === 'deleted'),
			]);
			this.update();
		}
	}

	create(): void {
		let payload = this.dataForm.getRawValue();
		this.favouritePlanService.create(payload).subscribe({
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
		this.favouritePlanService.update(payload).subscribe({
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
}
