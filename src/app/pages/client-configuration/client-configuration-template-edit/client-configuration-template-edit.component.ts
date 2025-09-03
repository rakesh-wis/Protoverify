import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DocumentTemplateService } from 'src/app/core/services/document-template.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-client-configuration-template-edit',
	templateUrl: './client-configuration-template-edit.component.html',
	styleUrls: ['./client-configuration-template-edit.component.scss'],
})
export class ClientConfigurationTemplateEditComponent implements OnInit {
	params: any = {};
	dataForm = new FormGroup({
		id: new FormControl(null),
		type: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		status: new FormControl(''),
	});

	constructor(
		private templateService: DocumentTemplateService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			this.params = params;
			this.form['type'].setValue(this.params.type);
			this.getData();
		});
	}
	get form() {
		return this.dataForm.controls;
	}
	getData(): void {
		this.spinnerService.start();
		this.templateService.getDataByType(this.params.type).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) this.dataForm.patchValue(result.data);
			},
			error: (error) => {
				this.spinnerService.stop();
				// this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		console.log(this.dataForm);
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}
	create(): void {
		this.templateService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.goBack();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		this.templateService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.goBack();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	goBack(): void {
		this.location.back();
	}
}
