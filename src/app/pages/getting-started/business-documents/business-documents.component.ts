import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import { confirmMessages, OPTIONS, SERVICES, verificationDetailsType } from 'src/app/helpers';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-business-documents',
	templateUrl: './business-documents.component.html',
	styleUrls: ['./business-documents.component.scss'],
})
export class BusinessDocumentsComponent implements OnInit, OnChanges {
	businessDocuments = [
		{
			label: 'Certificate of Incorporation (Optional)',
			mediaType: 'certificate_of_incorporation',
		},
		{
			label: 'GST certificate (Optional)',
			mediaType: 'gst_certificate',
		},
		{
			label: 'Board resolution (Optional)',
			mediaType: 'board_resolution',
		},
		{
			label: 'Business PAN (Optional)',
			mediaType: 'business_pna',
		},
		{
			label: 'Memorandum of Association (MOA) (Optional)',
			mediaType: 'memorandum_of_association',
		},
		{
			label: 'Article of Association (Optional)',
			mediaType: 'article_of_association',
		},
	];
	dataForm = new FormGroup({
		verificationType: new FormControl(verificationDetailsType.BUSINESS_DOCUMENTS),
		verificationMedia: new FormArray([]),
		userId: new FormControl(null),
	});
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;
	errorMessages = businessDocumentsFieldForm;
	@Output() changeAccordion = new EventEmitter<number>();
	@Input() userId: number = null;
	@Input() canEdit: boolean = true;
	@Input() canVerify: boolean = false;
	@Input() showCancel: boolean = true;

	constructor(
		private formBuilder: FormBuilder,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private verificationMediaService: VerificationMediaService,
		private verificationDetailsService: VerificationDetailsService,
		private modalService: NgbModal
	) {
		this.addItems();
	}

	ngOnInit(): void {
		this.getDocuments();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['userId'] && this.userId) {
			this.form['userId'].setValue(this.userId);
		}
	}

	get form() {
		return this.dataForm.controls;
	}

	get isAllVerified() {
		return this.verificationMedia.controls.every((v) => v.value.status === 'active' && v.value.filePath);
	}

	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(item?.id ? item?.id : null),
			label: [item.label],
			fileType: new FormControl(''),
			filePath: new FormControl('', []),
			fileName: [item.fileName ? item.fileName : 'Select file'],
			fileSize: new FormControl(''),
			status: new FormControl('pending'),
			mediaType: new FormControl(item.mediaType, [Validators.required]),
		});
	}

	addItems(): void {
		this.businessDocuments.forEach((element) => {
			this.verificationMedia.push(this.createItem(element));
		});
	}

	setControl(file, isToRemove, index): void {
		if (isToRemove) {
			file.fileType = '';
			file.filePath = '';
			file.fileName = 'Select file';
			file.fileSize = '';
		}
		this.verificationMedia.controls[index].setValue({
			id: this.verificationMedia.controls[index].value.id,
			fileType: file.fileType,
			filePath: file.filePath,
			fileName: file.fileName,
			fileSize: file.fileSize,
			status: file.status ? file.status : 'pending',
			label: this.verificationMedia.controls[index].value.label,
			mediaType: this.verificationMedia.controls[index].value.mediaType,
		});
	}

	uploadFile(event: any, index: number): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkDocumentType(file)) {
			this.toastService.error(OPTIONS.documentFileType);
			return;
		}
		if (this.uploadService.checkFileSize(file)) {
			this.toastService.error(OPTIONS.sizeLimit);
			return;
		}
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.VERIFICATION).subscribe({
			next: (value) => {
				let payload = {
					fileType: file.type,
					filePath: value.cdn,
					fileName: file.name,
					fileSize: file.size,
				};
				this.setControl(payload, false, index);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	getDocuments(): void {
		let params = {
			type: this.form['verificationType'].value,
		};
		if (this.userId) {
			params['userId'] = this.userId;
		}
		this.spinnerService.start();
		this.verificationDetailsService.list(params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) {
					this.businessDocuments.forEach((element, index) => {
						let item = result.data[0].verificationMedia.find(
							(access) => access.mediaType === element.mediaType
						);
						if (item) {
							this.verificationMedia.controls[index].patchValue(item);
						}
					});
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if (this.verificationMedia.controls.every((element) => element.get('filePath').value.length === 0)) {
			this.changeAccordion.emit(2);
			return;
		}
		this.spinnerService.start();
		this.verificationMediaService.createBulk(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.businessDocuments.forEach((element, index) => {
					let item = result.data.verificationMedia.find((access) => access.mediaType === element.mediaType);
					if (item) {
						console.log('item', item);
						this.verificationMedia.controls[index].patchValue(item);
					}
				});
				this.changeAccordion.emit(2);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	openConfirmStatus(item, index) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.requestTitle('Verification')}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription} verify ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.changeStatus(item, index);
			},
			(dismiss) => {}
		);
	}

	changeStatus(item: any, index: number) {
		this.spinnerService.start();
		this.verificationMediaService.patch(item).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationMedia.controls[index].patchValue(result.data);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	downloadDocument(url: string) {
		window.open(url, '_blank');
	}
}
