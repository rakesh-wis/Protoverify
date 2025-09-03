import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/core';
import { GroupService } from 'src/app/core/services/group.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SERVICES } from 'src/app/helpers';
import { groupFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-groups-details',
	templateUrl: './groups-details.component.html',
	styleUrls: ['./groups-details.component.scss'],
})
export class GroupsDetailsComponent implements OnInit {
	@Input() modelData: any;
	dataForm = new FormGroup({
		id: new FormControl(null),
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		profileLink: new FormControl(''),
		status: new FormControl(''),
	});
	errorMessages = groupFieldForm;
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private groupService: GroupService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService
	) {}

	ngOnInit(): void {
		if (this.modelData.hasOwnProperty('id')) {
			this.dataForm.patchValue(this.modelData);
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	get profileImageName() {
		return this.form['profileLink'].value.length > 0
			? this.form['profileLink'].value.split('uploads/')[1]
			: null;
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
		this.groupService.create(this.dataForm.getRawValue()).subscribe({
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
		this.groupService.update(this.dataForm.getRawValue()).subscribe({
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

	uploadFile(event: any): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.SOCIAL).subscribe({
			next: (value) => {
				this.form['profileLink'].setValue(value.cdn);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	removeFile() {
		this.form['profileLink'].setValue('');
	}
}
