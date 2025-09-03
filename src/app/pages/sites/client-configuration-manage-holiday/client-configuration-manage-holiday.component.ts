import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HolidayService } from 'src/app/core/services/holiday.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { yearsList } from 'src/app/helpers';
import { holidayFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-client-configuration-manage-holiday',
	templateUrl: './client-configuration-manage-holiday.component.html',
	styleUrls: ['./client-configuration-manage-holiday.component.scss'],
})
export class ClientConfigurationManageHolidayComponent implements OnInit {
	dataForm = new FormGroup({
		id: new FormControl(null),
		holidayName: new FormControl('', [Validators.required]),
		holidayDate: new FormControl(null, [Validators.required]),
		sitesId: new FormControl(),
	});
	dataList: any = {
		rows: [],
		count: -1,
	};
	errorMessages = holidayFieldForm;
	showForm: boolean = false;
	selectedYear = new Date().getFullYear();
	yearsList = yearsList(23);
	sitesId = null;
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private holidayService: HolidayService,
		private sharedService: SharedService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.sitesId = params['id'];
				this.form['sitesId'].setValue(this.sitesId);
			}
		});
		this.getData();
	}

	get form() {
		return this.dataForm.controls;
	}
	toggleEdit() {
		this.showForm = !this.showForm;
		this.dataForm.reset();
		this.form['sitesId'].setValue(this.sitesId);
	}

	patchForm(payload) {
		this.showForm = true;
		this.dataForm.patchValue(payload);
		this.form['holidayDate'].setValue(this.sharedService.setDisplayDate(payload.holidayDate));
	}

	getData() {
		let params = {
			year: this.selectedYear,
			sitesId: this.sitesId,
		};
		this.spinnerService.start();
		this.holidayService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
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
		let payload = this.dataForm.getRawValue();
		payload.holidayDate = this.sharedService.momentDateTime(payload.holidayDate);
		if (this.form['id'].value === null) this.create(payload);
		else this.update(payload);
	}

	update(payload): void {
		this.holidayService.update(payload).subscribe({
			next: (result) => {
				this.toastService.success(result.message);
				this.spinnerService.stop();
				this.dataForm.reset();
				this.getData();
				this.toggleEdit();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	create(payload): void {
		this.holidayService.create(payload).subscribe({
			next: (result) => {
				this.toastService.success(result.message);
				this.spinnerService.stop();
				this.dataForm.reset();
				this.getData();
				this.toggleEdit();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
}
