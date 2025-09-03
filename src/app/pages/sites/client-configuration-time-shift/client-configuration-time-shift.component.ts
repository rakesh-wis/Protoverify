import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeShiftService } from 'src/app/core/services/time-shift.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { days, timeShift } from 'src/app/helpers';
import { timeShiftFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-client-configuration-time-shift',
	templateUrl: './client-configuration-time-shift.component.html',
	styleUrls: ['./client-configuration-time-shift.component.scss'],
})
export class ClientConfigurationTimeShiftComponent implements OnInit {
	dataForm = new FormGroup({
		shifts: new FormArray([]),
	});
	shifts = this.dataForm.get('shifts') as FormArray;
	sitesId = null;

	timeShift = timeShift;
	errorMessages = timeShiftFieldForm;
	days = days;
	constructor(
		private formBuilder: FormBuilder,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private timeShiftService: TimeShiftService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.sitesId = params['id'];
			}
		});
		this.getData();
		this.dataForm.disable();
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
			id: new FormControl(item ? item.id : null),
			label: new FormControl(item ? item.label : null),
			type: new FormControl(item ? item.type : null, [Validators.required]),
			name: new FormControl(item ? item.name : '', [Validators.required]),
			startTime: new FormControl(item ? item.startTime : '', [Validators.required]),
			endTime: new FormControl(item ? item.endTime : '', [Validators.required]),
			sitesId: new FormControl(this.sitesId),
			days: new FormControl(item ? item.days : [], [Validators.required]),
		});
	}

	addItems(): void {
		this.shifts.push(this.createItem(null));
	}

	removeItem(index: number): void {
		this.shifts.removeAt(index);
	}

	getData() {
		this.spinnerService.start();
		this.timeShiftService.list({ sitesId: this.sitesId }).subscribe({
			next: (result) => {
				result.data.rows.forEach((element) => {
					this.shifts.push(this.createItem(element));
				});
				if (result.data.count === 0) {
					this.addItems();
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	onSubmit(): void {
		if (this.shifts.length === 0) {
			this.toastService.error('Please add time shift');
			return;
		}
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		for (const control of this.shifts.controls) {
			if (control.value.id != null) {
				this.update(control);
			} else {
				this.create(control);
			}
		}
	}

	update(control: AbstractControl): void {
		this.timeShiftService.update(control.value).subscribe({
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
		this.timeShiftService.create(control.value).subscribe({
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
