import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LeaveManagementService } from 'src/app/core/services/leave-management.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, leaveManagementType } from 'src/app/helpers';
import { leaveManagementFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-client-configuration-leave-management',
	templateUrl: './client-configuration-leave-management.component.html',
	styleUrls: ['./client-configuration-leave-management.component.scss'],
})
export class ClientConfigurationLeaveManagementComponent implements OnInit {
	dataForm = new FormGroup({
		leaves: new FormArray([]),
	});
	leaves = this.dataForm.get('leaves') as FormArray;
	sitesId = null;

	leaveManagementType = leaveManagementType;
	errorMessages = leaveManagementFieldForm;
	constructor(
		private formBuilder: FormBuilder,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private leaveManagementService: LeaveManagementService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.sitesId = params['id'];
			}
		});
		this.addItems();
		this.getData();
	}

	toggleEdit() {
		if (this.dataForm.disabled) {
			this.dataForm.enable();
		} else {
			this.dataForm.disable();
		}
	}

	createItem(item): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(null),
			label: new FormControl(item.label),
			type: new FormControl(item.value),
			showCheckBox: new FormControl(item.showCheckBox),
			monthly: new FormControl('', item.showCheckBox ? [] : [Validators.required]),
			yearly: new FormControl('', item.showCheckBox ? [] : [Validators.required]),
			status: new FormControl(''),
			sitesId: new FormControl(this.sitesId),
		});
	}

	addItems(): void {
		this.leaveManagementType.forEach((element) => {
			this.leaves.push(this.createItem(element));
		});
		this.dataForm.disable();
	}

	updateStatus($event, index) {
		if ($event.target.checked) {
			this.leaves.controls[index].get('status').setValue(defaultStatus.ACTIVE);
		} else {
			this.leaves.controls[index].get('status').setValue(defaultStatus.BLOCKED);
		}
	}

	getData() {
		this.spinnerService.start();
		this.leaveManagementService.list({ sitesId: this.sitesId }).subscribe({
			next: (result) => {
				this.leaveManagementType.forEach((element, index) => {
					let item = result.data.rows.find((access) => access.type === element.value);
					if (item) {
						item['showCheckBox'] = element.showCheckBox;
						this.leaves.controls[index].patchValue(item);
					}
				});
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		for (const control of this.leaves.controls) {
			if (control.value.showCheckBox) {
				control.value.monthly = 0;
				control.value.yearly = 0;
			}
			if (control.value.id != null) {
				this.update(control);
			} else {
				this.create(control);
			}
		}
	}

	update(control: AbstractControl): void {
		this.leaveManagementService.update(control.value).subscribe({
			next: (result) => {
				control.patchValue(result.data);
				this.toastService.success(result.message);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	create(control: AbstractControl): void {
		this.leaveManagementService.create(control.value).subscribe({
			next: (result) => {
				control.patchValue(result.data);
				this.toastService.success(result.message);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
}
