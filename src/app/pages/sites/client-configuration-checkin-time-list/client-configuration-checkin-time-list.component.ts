import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CheckinTimeService } from 'src/app/core/services/checkin-time.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { checkinTimeFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewLogCheckinTimeComponent } from '../view-log-checkin-time/view-log-checkin-time.component';
@Component({
	selector: 'app-client-configuration-checkin-time-list',
	templateUrl: './client-configuration-checkin-time-list.component.html',
	styleUrls: ['./client-configuration-checkin-time-list.component.scss'],
})
export class ClientConfigurationCheckinTimeListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 500;
	pageSelectSite: number = 1;
	siteList: any = [];
	sitesId: null;

	constructor(
		private sitesService: SitesService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private checkInTimeService: CheckinTimeService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal
	) {}

	dataForm = new FormGroup({
		id: new FormControl(null),
		sitesId: new FormControl('', [Validators.required]),
		isAllowedCameraSelfie: new FormControl('', [Validators.required]),
	});
	dataList: any = {
		rows: [],
		count: -1,
	};
	showForm: boolean = false;
	isAdd: boolean = false;
	errorMessages = checkinTimeFieldForm;

	get form() {
		return this.dataForm.controls;
	}

	toggleEdit() {
		if (this.dataForm.disabled) {
			this.dataForm.enable();
		} else {
			this.dataForm.disable();
		}
		this.showForm = !this.showForm;
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.sitesId = params['id'];
			}
		});
		this.dataForm.disable();
		this.getData();
	}

	getData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			sitesId: this.sitesId,
			...filters,
		};
		this.spinnerService.start();
		this.checkInTimeService.list(params).subscribe({
			next: (result) => {
				this.patchForm(result.data[0]);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		if (!this.sitesId) {
			this.toastService.error('Please add site first!');
			return;
		}
		this.dataForm.patchValue({ sitesId: this.sitesId });
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		let payload = this.dataForm.getRawValue();
		if (this.form['id'].value === null) this.create(payload);
		else this.update(payload);
	}

	update(payload): void {
		this.checkInTimeService.update(payload).subscribe({
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
		this.checkInTimeService.create(payload).subscribe({
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

	patchForm(payload) {
		this.dataForm.patchValue(payload);
	}

	onAdd(): void {
		this.isAdd = !this.isAdd;
	}

	onCancel(): void {
		this.toggleEdit();
		this.isAdd = false;
	}

	viewLog() {
		const modalRef = this.modalService.open(ViewLogCheckinTimeComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
}
