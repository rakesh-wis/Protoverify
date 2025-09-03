import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, SERVICES } from 'src/app/helpers';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ChangeMobileComponent } from '../change-mobile/change-mobile.component';
import { ChangeEmailComponent } from '../change-email/change-email.component';

@Component({
	selector: 'app-profile-view',
	templateUrl: './profile-view.component.html',
	styleUrls: ['./profile-view.component.scss'],
})
export class ProfileViewComponent implements OnInit {
	currentUser: any = {};
	dataForm = new FormGroup({
		name: new FormControl('', Validators.required),
		profilePicture: new FormControl(''),
	});

	didImageChange: boolean = false;
	constructor(
		private userService: UserService,
		private modalService: NgbModal,
		private uploadService: UploadService,
		private toastService: ToastService,
		private spinnerService: SpinnerService
	) {
		this.userService.currentUser.subscribe((data) => {
			this.currentUser = data;
			console.log(data);
			this.dataForm.patchValue(this.currentUser);
		});
	}

	ngOnInit(): void {
		this.userService.currentUser.subscribe((data) => {
			this.currentUser = data;
			this.dataForm.patchValue(this.currentUser);
		});
	}

	openChangeMobileNumber(): void {
		const modalRef = this.modalService.open(ChangeMobileComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}

	openChangerEmail(): void {
		const modalRef = this.modalService.open(ChangeEmailComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}

	get form() {
		return this.dataForm.controls;
	}

	get getImage() {
		return this.form['profilePicture'].value.split('uploads/')[1];
	}

	uploadFile(event) {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkImageType(file)) {
			this.toastService.error(OPTIONS.imageType);
			return;
		}
		if (this.uploadService.checkFileSize(file)) {
			this.toastService.error(OPTIONS.sizeLimit);
			return;
		}
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
			next: (value) => {
				this.form['profilePicture'].setValue(value.cdn);
				this.didImageChange = !this.didImageChange;
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	onSubmit() {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.userService.updateProfile(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result['message']);
				this.didImageChange = !this.didImageChange;
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
