import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { consentSignatureFieldsErrors } from 'src/app/helpers/form-error.helper';
import { SignaturePadComponent } from 'src/app/shared/components/common/signature-pad/signature-pad.component';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-employee-terms-and-conditions',
	templateUrl: './employee-terms-and-conditions.component.html',
	styleUrls: ['./employee-terms-and-conditions.component.scss'],
})
export class EmployeeTermsAndConditionsComponent implements OnInit {
	@Input() modalData;
	dataForm = new FormGroup({
		acceptTerms: new FormControl('', [Validators.required]),
		acceptPrivacyPolicy: new FormControl('', [Validators.required]),
		signature: new FormControl('', [Validators.required]),
	});
	errorMessages = consentSignatureFieldsErrors;
	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

	ngOnInit(): void {}
	get form() {
		return this.dataForm.controls;
	}
	closeModal() {
		if (this.modalData.consent) {
			this.dataForm.get('signature').clearValidators();
		} else {
			this.dataForm.get('signature').setValidators([Validators.required]);
		}
		this.dataForm.get('signature').updateValueAndValidity();

		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.activeModal.close({ data: this.dataForm.getRawValue() });
	}

	dismissModal() {
		this.modalService.dismissAll({ data: null });
	}

	addSignature(): void {
		const modalRef = this.modalService.open(SignaturePadComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			({ data }) => {
				const signature: string = data;
				this.dataForm.get('signature').setValue(signature);
			},
			(dismiss) => {}
		);
	}
}
