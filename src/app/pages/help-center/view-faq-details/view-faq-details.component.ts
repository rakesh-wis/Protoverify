import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/core';
import { FaqService } from 'src/app/core/services/faq.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { viewfaqFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-view-faq-details',
	templateUrl: './view-faq-details.component.html',
	styleUrls: ['./view-faq-details.component.scss'],
})
export class ViewFaqDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		question: new FormControl('', [Validators.required]),
		answer: new FormControl('', [Validators.required]),
		status: new FormControl(''),
	});
	errorMessages = viewfaqFieldForm;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private faqService: FaqService,
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
		this.faqService.create(this.dataForm.getRawValue()).subscribe({
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

	update(): void {
		this.faqService.update(this.dataForm.getRawValue()).subscribe({
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
}
