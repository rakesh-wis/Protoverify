import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isBuffer } from 'lodash';
import { ClientService } from 'src/app/core/services/client.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
	OPTIONS,
	businessType,
	connectionType,
	industryType,
	maskForInputFields,
	planFeatures,
	planModulesFeatures,
} from 'src/app/helpers';
import { authFieldsErrors, regionFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';

@Component({
	selector: 'app-clients-add',
	templateUrl: './clients-add.component.html',
	styleUrls: ['./clients-add.component.scss'],
})
export class ClientsAddComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		firstName: new FormControl('', [Validators.required, Validators.maxLength(25)]),
		lastName: new FormControl('', [Validators.required, Validators.maxLength(25)]),
		status: new FormControl(''),
		name: new FormControl(''),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		type: new FormControl('', [Validators.required]),
		industry: new FormControl('', [Validators.required]),
		registeredName: new FormControl('', [Validators.required]),
		verificationCheck: new FormControl([]),
		connectionType: new FormControl(connectionType.POST_PAID),
		panNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.panCardPattern)]),
		gstNumber: new FormControl('', [Validators.required]),
		gstDetails: new FormControl(''),
	});
	alphabetsMask = maskForInputFields.alphabetsMask;
	connectionType = connectionType;
	errorMessages = authFieldsErrors;
	isMobileNumberValid: boolean = false;
	industryType = industryType;
	businessType = businessType;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private clientService: ClientService,
		private subscriptionService: SubscriptionService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private verificationDetailsService: VerificationDetailsService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
			let name = this.modelData.name.split(' ');
			this.form['registeredName'].setValue(this.modelData.businessDetails.registeredName);
			this.form['industry'].setValue(this.modelData.businessDetails.industry);
			this.form['type'].setValue(this.modelData.businessDetails.type);
			this.form['panNumber'].setValue(this.modelData.businessDetails.panNumber);
			this.form['gstNumber'].setValue(this.modelData.businessDetails.gstNumber);
			this.form['gstDetails'].setValue(this.modelData.businessDetails.gstDetails);

			if (this.modelData.businessDetails.connectionType) {
				this.form['connectionType'].setValue(this.modelData.businessDetails.connectionType);
				this.form['connectionType'].disable();
			}
			this.form['firstName'].setValue(name[0]);
			if (name.length > 1) {
				this.form['lastName'].setValue(name[1]);
			}
			this.listVerificationCheck();
		} else {
			planModulesFeatures.map((e) => {
				if (e.value === planFeatures.AADHAR_CARD) {
					e.checked = true;
					e['selected'] = true;
				}
				if (e.value === planFeatures.PHYSICAL_ADDRESS) {
					e.price = 0;
				}
			});
			this.form['verificationCheck'].setValue(planModulesFeatures);
		}
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	addRemoveItem($event, item) {
		if ($event.target.checked) {
			item.checked = true;
		} else {
			item.price = 0;
			item.checked = false;
			if (item.id) {
				item['status'] = 'deleted';
			}
		}
	}
	get form() {
		return this.dataForm.controls;
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
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

	onSubmit(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.form['name'].setValue(`${this.form['firstName'].value} ${this.form['lastName'].value}`);
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.clientService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.dataForm.get('id').setValue(result.data.id);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.createOrUpdateVerificationCheck();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	listVerificationCheck(): void {
		this.subscriptionService.listVerificationCheck({ associateId: this.dataForm.get('id').value }).subscribe({
			next: (result) => {
				const checks = [];
				planModulesFeatures.forEach((verification) => {
					const isData = result.data.find((e) => e.title == verification.value);
					if (isData) {
						checks.push({
							title: verification.title,
							value: verification.value,
							checked: true,
							selected: true,
							price: isData.price,
							id: isData.id,
						});
					} else {
						checks.push({
							title: verification.title,
							value: verification.value,
							checked: verification.value === planFeatures.AADHAR_CARD ?? false,
							selected: verification.value === planFeatures.AADHAR_CARD ?? false,
							price: verification.value === planFeatures.PHYSICAL_ADDRESS ? 0 : null,
							id: null,
						});
					}
				});
				this.dataForm.get('verificationCheck').setValue(checks);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	createOrUpdateVerificationCheck(): void {
		const selectedVerification = this.dataForm.get('verificationCheck').value.filter((e) => e.selected);
		const deletedVerification = this.dataForm
			.get('verificationCheck')
			.value.filter((e) => !e.selected && e.status === 'deleted');
		let payload = {
			verificationCheck: [...selectedVerification, ...deletedVerification],
			userId: this.dataForm.get('id').value,
		};
		this.subscriptionService.createOrUpdateVerificationCheck(payload).subscribe({
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
		this.clientService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.createOrUpdateVerificationCheck();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchGST() {
		if (!this.form['gstNumber'].value) {
			return;
		}
		let params = {
			gstNumber: this.form['gstNumber'].value,
		};
		this.spinnerService.start();
		this.verificationDetailsService.searchGST(params).subscribe(
			(result) => {
				this.form['gstDetails'].setValue(result.data);
				this.spinnerService.stop();
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
}
