import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbInputDatepickerConfig, NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { ClientService } from 'src/app/core/services/client.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, ROLES, SERVICES } from 'src/app/helpers';
import { verificationFieldForm } from 'src/app/helpers/form-error.helper';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-court-details',
	templateUrl: './court-details.component.html',
	styleUrls: ['./court-details.component.scss'],
})
export class CourtDetailsComponent implements OnInit, OnDestroy {
	@Input() modelData: any;
	@Input() canEdit: boolean = true;
	errorMessages = verificationFieldForm;
	currentUser: any;
	roles = ROLES;

	dataForm = new FormGroup({
		noOfCases: new FormControl('', [Validators.required]),
	});
	media: any = [];

	constructor(
		modalConfig: NgbModalConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private activeModalService: NgbActiveModal,
		private uploadService: UploadService,
		private userService: UserService
	) {
		modalConfig.backdrop = 'static';
		modalConfig.keyboard = false;
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.form['noOfCases'].setValue(this.modelData.noOfCases);
		this.media = this.modelData.verificationMedia;
		if (!this.canEdit) {
			this.dataForm.disable();
		}
	}
	ngOnDestroy() {
		this.media = [];
	}
	get form() {
		return this.dataForm.controls;
	}
	removeMediaItem(index): void {
		if (this.media[index].id) {
			this.media[index].status = 'deleted';
		} else {
			this.media.splice(index, 1);
		}
	}
	downloadDocument(url: string) {
		if (url) {
			window.open(url, '_blank');
		}
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	uploadFile(event: any): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkDocumentType(file) && this.uploadService.checkImageType(file)) {
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
				this.media.push(payload);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.activeModalService.close({ noOfCases: this.form['noOfCases'].value, media: this.media });
	}
	dismissModal() {
		this.activeModalService.dismiss();
	}
	showImage(file) {
		const modalRef = this.modalService.open(FileViewerComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.files = [file];
		modalRef.componentInstance.fileType = 'images';
	}
}
