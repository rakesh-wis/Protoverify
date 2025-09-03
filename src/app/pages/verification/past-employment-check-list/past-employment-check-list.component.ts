import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClientService } from 'src/app/core/services/client.service';
import { PastEmploymentService } from 'src/app/core/services/past-employment.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { confirmMessages, ROLES, kycStatus, verificationLevel, OPTIONS, SERVICES, planFeatures } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { PastEmploymentCheckDetailsComponent } from '../past-employment-check-details/past-employment-check-details.component';
import { UploadService, UserService } from 'src/app/core';
import { validateField } from 'src/app/shared/validators/form.validator';
import { Location } from '@angular/common';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { pastEmployeeFieldsForm } from 'src/app/helpers/form-error.helper';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';

@Component({
	selector: 'app-past-employment-check-list',
	templateUrl: './past-employment-check-list.component.html',
	styleUrls: ['./past-employment-check-list.component.scss'],
})
export class PastEmploymentCheckListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	userData: any = {};
	statusFilter = '';
	dataForm = new FormGroup({
		status: new FormControl(),
		remark: new FormControl('', [Validators.required]),
	});
	roles = ROLES;
	kycStatus = kycStatus;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Organization',
			value: 'Organization',
			sorting: false,
		},
		{
			label: "HR Manager's Details",
			value: "HR Manager's Details",
			sorting: false,
		},
		{
			label: "Reporting Manager's Details",
			value: "Reporting Manager's Details",
			sorting: false,
		},
		{
			label: 'Documents',
			value: 'Documents',
			sorting: false,
		},
		{
			label: 'Actions',
			value: 'Actions',
			sorting: false,
		},
	];
	mediaDocuments = [
		{
			label: 'Latest Salary Slip',
			mediaType: 'latest_salary_slip',
		},
		{
			label: 'Appointment Letter/Increment Letter',
			mediaType: 'offer_letter',
		},
		{
			label: 'Relieving Letter',
			mediaType: 'other_document',
		},
	];
	dataList: any = [];
	searchTerm: string = '';
	userId: any;
	currentUser: any;
	errorMessages = pastEmployeeFieldsForm;
	verificationLevel = verificationLevel;
	maxUploadNumber: number = 3;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	constructor(
		private spinnerService: SpinnerService,
		private pastEmploymentService: PastEmploymentService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		private userService: UserService,
		private location: Location,
		private router: Router,
		private uploadService: UploadService,
		private verificationDetailsService: VerificationDetailsService
	) {
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}
	get form() {
		return this.dataForm.controls;
	}
	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
		});

		this.loadData();
		this.verificationDetailsService.userVerification.subscribe((verificationList) => {
			if (verificationList && verificationList.length > 0) {
				const check = verificationList.find((e) => e.value === planFeatures.PAST_EMPLOYMENT);
				if (check) {
					this.maxUploadNumber = check.maxUploadNumber;
				}
			}
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
	}
	getDocumentName(item) {
		return this.mediaDocuments.find((e) => e.mediaType === item.mediaType).label;
	}
	isOtherDocumentAdded(pastEmploymentData) {
		const media = pastEmploymentData.media.find((e) => e.mediaType === 'other_document');
		return media?.filePath.length > 0 ? true : false;
	}
	openDocument(pastEmploymentData: any, mediaType: string) {
		const media = pastEmploymentData.media.find((e) => e.mediaType == mediaType);
		media ? this.downloadDocument(media?.filePath) : '';
	}
	downloadDocument(url: string) {
		window.open(url, '_blank');
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...(![ROLES.EMPLOYEE].includes(this.currentUser.role) && {
				userId: this.userId,
			}),
			...filters,
		};
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/employee/past-organization`
			: `/employee/past-organization`;
		this.spinnerService.start();
		this.pastEmploymentService.getList(params, url).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (![ROLES.EMPLOYEE].includes(this.currentUser.role)) {
					this.dataList = result.data.rows;
					this.collectionSize = result.data['count'];
					if (result.data.rows.length > 0) {
						this.form['status'].setValue(result.data.rows[0].status);
						this.form['remark'].setValue(result.data.rows[0].remark);
					} else {
						this.dataForm.reset();
					}
				} else {
					this.dataList = result.data;
					// this.collectionSize = result.data['count'];
					if (result.data.length > 0) {
						this.form['status'].setValue(result.data[0].status);
						this.form['remark'].setValue(result.data[0].remark);
					} else {
						this.dataForm.reset();
					}
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	applyFilters() {
		this.loadData({
			search: this.searchTerm,
		});
	}
	onPageChange($event: number, event: string): void {
		if (this.isPrevious() && event === 'prev') {
			return;
		} else if (event === 'next' && this.isLastPage()) {
			return;
		}
		this.page = $event;
		this.loadData({
			search: this.searchTerm,
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}
	add(): void {
		const modalRef = this.modalService.open(PastEmploymentCheckDetailsComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.componentInstance.userId = this.userId;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				if (dismiss) {
					this.searchTerm = '';
					this.statusFilter = '';
					this.loadData();
					this.verificationDetailsService.showCompleteModal(
						'past-employment',
						'pending',
						this.dataList.length + 1
					);
				}
			}
		);
	}
	update(data: any): void {
		const modalRef = this.modalService.open(PastEmploymentCheckDetailsComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.componentInstance.userId = this.userId;
		modalRef.componentInstance.modelData = data;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				if (dismiss) {
					this.searchTerm = '';
					this.statusFilter = '';
					this.loadData();
				}
			}
		);
	}
	openConfirmStatus(status) {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if ([verificationLevel.CLEAR_REPORT, verificationLevel.MAJOR_DISCREPANCY].includes(status)) {
			const modalRef = this.modalService.open(AlertModalComponent, {
				centered: true,
				size: 'md',
			});
			modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
			modalRef.componentInstance.description = `${
				confirmMessages.hideDescription
			} save status as ${verificationLevel.CLEAR_REPORT.replace(/_/g, ' ')} ? \n`;
			modalRef.componentInstance.okText = 'Yes';
			modalRef.componentInstance.cancelText = 'Cancel';
			modalRef.result.then(
				(result) => {
					let payload = {
						status,
						userId: this.userId,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		} else {
			const modalRef = this.modalService.open(ChangeStatusComponent, {
				centered: true,
				size: 'md',
			});
			modalRef.componentInstance.modelData = this.dataForm.getRawValue();
			modalRef.result.then(
				(result) => {
					let payload = {
						status: result.status,
						userId: this.userId,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		}
	}
	patch(payload) {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.pastEmploymentService.buildStatus(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(payload.status);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('past-employment', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	openConfirmDelete(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.title = `${confirmMessages.requestTitle('delete')}?`;
		modalRef.componentInstance.description = `${confirmMessages.requestDescription(
			'delete this this organization'
		)} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.pastEmploymentService.delete(item.id).subscribe({
					next: (result) => {
						this.loadData();
						this.verificationDetailsService.showCompleteModal(
							'past-employment',
							'pending',
							this.dataList.length - 1
						);
					},
					error: (error) => {
						this.spinnerService.stop();
						this.toastService.error(error);
					},
				});
			},
			(dismiss) => {}
		);
	}
	goBack() {
		this.location.back();
	}
	goNext() {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.verificationDetailsService.navigateToNext(path, 'past-employment', this.userData);
	}
	saveEmailAttachment(event, index, type) {
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
					emailAttachment: {
						fileType: file.type,
						filePath: value.cdn,
						fileName: file.name,
						fileSize: file.size,
					},
					id: this.dataList.rows[index].id,
					type,
				};
				this.pastEmploymentService.updateEmailAttachment(payload).subscribe({
					next: (result) => {
						this.dataList.rows[index][type].emailAttachment = payload.emailAttachment;
						this.spinnerService.stop();
						this.toastService.success(result.message);
					},
					error: (error) => {
						this.spinnerService.stop();
						this.toastService.error(error);
					},
				});
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	clearEmailAttachment(index, type) {
		let payload = {
			emailAttachment: null,
			id: this.dataList.rows[index].id,
			type,
		};
		this.pastEmploymentService.updateEmailAttachment(payload).subscribe({
			next: (result) => {
				this.dataList.rows[index][type].emailAttachment = null;
				this.spinnerService.stop();
				this.toastService.success('File removed');
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	showImage(file) {
		const modalRef = this.modalService.open(FileViewerComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.files = [file];
		modalRef.componentInstance.fileType = 'images';
	}

	uploadFile(event: any, type: string): void {
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
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
			next: (value) => {
				this.form[type].setValue(value.cdn);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	clearFile(controlName: string) {
		this.form[controlName].setValue('');
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.PAST_EMPLOYMENT)
		);
	}
}
