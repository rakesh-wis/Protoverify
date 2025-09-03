import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/core/services/client.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeShiftService } from 'src/app/core/services/time-shift.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus } from 'src/app/helpers';
import { changeOrganizationFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-change-organization',
	templateUrl: './change-organization.component.html',
	styleUrls: ['./change-organization.component.scss'],
})
export class ChangeOrganizationComponent implements OnInit {
	@Input() employeeData: any = {};
	dataForm = new FormGroup({
		id: new FormControl('', [Validators.required]),
		associateId: new FormControl('', [Validators.required]),
		fromDate: new FormControl('', [Validators.required]),
		toDate: new FormControl('', [Validators.required]),
		location: new FormControl('', [Validators.required]),
		name: new FormControl(''),
		currentOrganization: new FormControl(''),
	});
	errorMessages = changeOrganizationFieldForm;
	clientList: any = {
		data: [],
		count: -1,
	};
	pageClient: number = 1;
	pageSizeClient: number = 20;
	collectionSizeClient: number = 0;
	timeShiftData: any = {};
	todaysDate: NgbDateStruct;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private sharedService: SharedService,
		private employeeService: EmployeeService,
		private clientService: ClientService,
		private timeShiftService: TimeShiftService
	) {}

	ngOnInit(): void {
		this.getClients();
		this.form['id'].setValue(this.employeeData.id);
		this.form['name'].setValue(this.employeeData.name);
		this.form['currentOrganization'].setValue(
			this.employeeData.associated?.businessDetails?.registeredName || this.employeeData.associated?.name
		);
		if (this.employeeData.timeShiftId) {
			this.getTimeShift();
		} else {
			this.form['location'].setValue('Pune');
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
	getTimeShift() {
		this.spinnerService.start();
		this.timeShiftService.getById(this.employeeData.timeShiftId).subscribe({
			next: (result) => {
				this.timeShiftData = result.data;
				this.form['location'].setValue(this.timeShiftData.sites.name);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
			},
		});
	}
	onSubmit() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		let payload = this.dataForm.getRawValue();
		payload.fromDate = this.sharedService.momentDateTime(payload.fromDate);
		payload.toDate = this.sharedService.momentDateTime(payload.toDate);
		this.spinnerService.start();
		this.employeeService.changeOrganization(payload).subscribe({
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
	getClients(filters = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSizeClient,
			limit: this.pageSizeClient,
			status: defaultStatus.ACTIVE,
			...filters,
		};
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.clientList = result.data;
				this.collectionSizeClient = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onSearch($event) {
		this.getClients({ search: $event.term });
	}
	onScrollClient() {
		if (this.clientList.rows.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClients();
	}
}
