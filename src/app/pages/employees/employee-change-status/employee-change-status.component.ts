import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { confirmMessages, defaultStatus } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';

@Component({
	selector: 'app-employee-change-status',
	templateUrl: './employee-change-status.component.html',
	styleUrls: ['./employee-change-status.component.scss'],
})
export class EmployeeChangeStatusComponent implements OnInit {
	@Input() modelData: any = {};
	dataForm = new FormGroup({
		id: new FormControl('', [Validators.required]),
		name: new FormControl('', [Validators.required]),
		status: new FormControl('', [Validators.required]),
	});
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Block', name: defaultStatus.BLOCKED },
		{ label: 'Suspended', name: defaultStatus.SUSPENDED },
		{ label: 'Absconded', name: defaultStatus.ABSCONDED },
		{ label: 'Terminated', name: defaultStatus.TERMINATED },
	];
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private employeeService: EmployeeService
	) {}

	ngOnInit(): void {
		this.dataForm.patchValue(this.modelData);
	}

	get form() {
		return this.dataForm.controls;
	}

	closeModal() {
		this.activeModal.close('close with cancel button');
	}

	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}

	openConfirmStatus() {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		let status = this.statusList.find((e) => e.name === this.form['status'].value).label;
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription} ${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.onSubmit();
			},
			(dismiss) => {}
		);
	}

	onSubmit() {
		this.spinnerService.start();
		this.employeeService.patch(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.closeModal();
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
