import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { saveAs } from 'file-saver';
import moment from 'moment';

import { UploadService } from 'src/app/core';
import { RegularizationService } from 'src/app/core/services/regularization.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SERVICES } from 'src/app/helpers';
import { uploadFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
@Component({
	selector: 'app-regularization-upload',
	templateUrl: './regularization-upload.component.html',
	styleUrls: ['./regularization-upload.component.scss'],
})
export class RegularizationUploadComponent implements OnInit {
	dataForm = new FormGroup({
		file: new FormControl('', [Validators.required]),
	});
	@Input() selectedDate;
	errorMessages = uploadFieldForm;
	constructor(
		private uploadService: UploadService,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private regularizationService: RegularizationService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

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

	selectFile(event: any): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		this.form['file'].setValue(file);
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		let formData = new FormData();
		formData.append('file', this.form['file'].value);
		const url = `/admin/regularization/bulk-create`;
		this.spinnerService.start();
		this.uploadService.uploadFile(url, formData, SERVICES.CMS).subscribe({
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

	downloadTemplate(): void {
		this.spinnerService.start();
		this.regularizationService.downloadTemplate({ selectedDate: this.selectedDate }).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				saveAs(result, `Regularization template ${moment().format('DD-MM-YYYY hh:mm a')}`);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
