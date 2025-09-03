import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/core/services/shared.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validateField } from 'src/app/shared/validators/form.validator';
import { uploadFieldForm } from 'src/app/helpers/form-error.helper';
import { UploadService } from 'src/app/core';
import { SERVICES } from 'src/app/helpers';

@Component({
	selector: 'app-sites-upload',
	templateUrl: './sites-upload.component.html',
	styleUrls: ['./sites-upload.component.scss'],
})
export class SitesUploadComponent implements OnInit {
	dataForm = new FormGroup({
		file: new FormControl('', [Validators.required]),
	});
	errorMessages = uploadFieldForm;
	constructor(
		private uploadService: UploadService,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private sitesService: SitesService,
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
		let file: any = fileList[0];
		this.form['file'].setValue(file);
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		let formData = new FormData();
		formData.append('file', this.form['file'].value);
		const url = `/admin/my/sites/bulk-create`;
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
		this.sitesService.downloadTemplate().subscribe({
			next: (result) => {
				this.spinnerService.stop();
				saveAs(result, `Sites template ${moment().format('DD-MM-YYYY hh:mm a')}`);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
