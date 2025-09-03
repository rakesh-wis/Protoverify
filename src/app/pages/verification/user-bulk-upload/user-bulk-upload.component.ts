import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/core';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, SERVICES } from 'src/app/helpers';
import { uploadFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SitesService } from 'src/app/core/services/sites.service';

@Component({
	selector: 'app-user-bulk-upload',
	templateUrl: './user-bulk-upload.component.html',
	styleUrls: ['./user-bulk-upload.component.scss'],
})
export class UserBulkUploadComponent implements OnInit {
	dataForm = new FormGroup({
		file: new FormControl('', [Validators.required]),
		userAssociations: new FormArray([], [Validators.required]),
	});
	userAssociations = this.dataForm.get('userAssociations') as FormArray;

	errorMessages = uploadFieldForm;

	collectionSize: number = 10;
	pageSite: number = 1;
	siteList: any = [];
	regionList: any = [];
	errorMessage = [];
	constructor(
		private uploadService: UploadService,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private sitesService: SitesService,
		private regionService: RegionsService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private subscriptionService: SubscriptionService,
		private formBuilder: FormBuilder
	) {}

	ngOnInit(): void {
		this.addItem();
		this.getRegions();
	}

	clearFile() {
		this.form['file'].setValue(null);
	}

	get form() {
		return this.dataForm.controls;
	}
	createItem(item, isNew) {
		return this.formBuilder.group({
			id: new FormControl(isNew ? null : item?.id),
			sitesId: new FormControl(isNew ? '' : item?.sitesId, [Validators.required]),
			regionId: new FormControl(isNew ? '' : item?.regionId, [Validators.required]),
			sitesName: new FormControl(isNew ? '' : item?.name),
			status: new FormControl(item?.status ? item?.status : 'pending'),
			reportingManagerId: new FormControl(isNew ? null : item?.reportingManagerId),
			onBoardingManagerId: new FormControl(isNew ? null : item?.onBoardingManagerId),
		});
	}
	addItem() {
		this.userAssociations.push(this.createItem(null, true));
	}
	closeModal() {
		this.activeModal.close('close with cancel button');
	}

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
		formData.append('userAssociations', JSON.stringify(this.form['userAssociations'].value));
		const url = `/admin/employee/bulk-import`;
		this.spinnerService.start();
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data && result.data.length > 0) {
					this.toastService.error('Few employee already exists');
					this.errorMessage = result.data.map((e) => `${e.name} `);
				} else {
					this.toastService.success(result.message);
					this.closeModal();
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	downloadTemplate(): void {
		this.spinnerService.start();
		this.subscriptionService.downloadTemplate().subscribe({
			next: (result) => {
				this.spinnerService.stop();
				saveAs(result, `Employee ${moment().format('DD-MM-YYYY hh:mm a')}`);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onRegionChangeHandler($event) {
		this.getSites({
			regionId: $event.target.value,
		});
	}
	getSites(filters = {}): void {
		let params = {
			start: (this.pageSite - 1) * 10,
			limit: 10,
			status: defaultStatus.ACTIVE,
			...filters,
			// ...(this.form['associateId'].value && {
			//   associateId: this.form['associateId'].value,
			// }),
		};
		this.spinnerService.start();
		this.sitesService.list(params).subscribe({
			next: (result) => {
				this.siteList = result.data['rows'];
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	getRegions(params = {}): void {
		this.regionService.sharedList(params).subscribe({
			next: (result) => {
				this.regionList = result.data['rows'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
}
