import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { defaultStatus, confirmMessages, verificationLevelList } from 'src/app/helpers';
import { changeStatusFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-change-status',
	templateUrl: './change-status.component.html',
	styleUrls: ['./change-status.component.scss'],
})
export class ChangeStatusComponent implements OnInit {
	@Input() modelData: any = {};
	dataForm = new FormGroup({
		status: new FormControl('', [Validators.required]),
	});
	statusList: any = verificationLevelList;
	errorMessages = changeStatusFieldForm;
	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

	ngOnInit(): void {
		if (this.modelData.status && this.modelData.status !== 'pending') {
			this.form['status'].setValue(this.modelData.status);
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	closeModal(data) {
		this.activeModal.close(data);
	}

	dismissModal() {
		this.activeModal.dismiss('dismiss modal');
	}

	openConfirmStatus() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
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
				this.closeModal(this.dataForm.getRawValue());
			},
			(dismiss) => {}
		);
	}
	get getLevelColor(): string {
		let level = verificationLevelList.find((e) => e.name === this.form['status'].value);
		return level ? level.color : '';
	}
}
