import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/core';
import { HelpCenterService } from 'src/app/core/services/help-center.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { helpCenterFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-help-center-details',
	templateUrl: './help-center-details.component.html',
	styleUrls: ['./help-center-details.component.scss'],
})
export class HelpCenterDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl(''),
		description: new FormControl('', [Validators.required]),
		status: new FormControl(''),
	});
	errorMessages = helpCenterFieldForm;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private helpCenterService: HelpCenterService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService
	) {}

	ngOnInit(): void {
		if (this.modelData) {
			console.log(this.modelData);
			this.dataForm.patchValue(this.modelData);
		}
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

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.helpCenterService.create(this.dataForm.getRawValue()).subscribe({
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
		this.helpCenterService.update(this.dataForm.getRawValue()).subscribe({
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
