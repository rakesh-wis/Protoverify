import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { regionFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-regions-details',
	templateUrl: './regions-details.component.html',
	styleUrls: ['./regions-details.component.scss'],
})
export class RegionsDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		status: new FormControl(''),
	});
	errorMessages = regionFieldForm;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private regionService: RegionsService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
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
		this.regionService.create(this.dataForm.getRawValue()).subscribe({
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
		this.regionService.update(this.dataForm.getRawValue()).subscribe({
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
