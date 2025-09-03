import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { EducaationDetailsService } from 'src/app/core/services/educaation-details.service';
import {
	kycStatus,
	confirmMessages,
	educationalDocuments,
	ROLES,
	verificationLevel,
	OPTIONS,
	planFeatures,
} from 'src/app/helpers';
import { businessDocumentsFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { EducationalDetailsComponent } from '../educational-details/educational-details.component';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { VendorService } from 'src/app/core/services/vendor.service';

@Component({
	selector: 'app-education-list',
	templateUrl: './education-list.component.html',
	styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	userData: any = {};
	statusFilter = '';
	businessDocuments = educationalDocuments;
	kycStatus = kycStatus;
	roles = ROLES;
	currentUser: any;
	dataList: any = {};
	searchTerm: string;
	dataForm = new FormGroup({
		status: new FormControl(),
		remark: new FormControl(''),
		vendorId: new FormControl('', [Validators.required]),
	});

	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Board/University',
			value: 'Board',
			sorting: false,
		},
		{
			label: 'School/College',
			value: 'School/College',
			sorting: false,
		},
		{
			label: 'Year of passing',
			value: 'Year of passing',
			sorting: false,
		},
		{
			label: 'Certificates',
			value: 'Certificates',
			sorting: false,
		},
		// {
		// 	label: 'Actions',
		// 	value: 'Actions',
		// 	sorting: false,
		// },
	];
	verificationMedia = this.dataForm.get('verificationMedia');
	errorMessages = businessDocumentsFieldForm;
	@Output() changeAccordion = new EventEmitter<number>();
	@Input() userId: number = null;
	@Input() canEdit: boolean = true;
	@Input() canVerify: boolean = false;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	verificationLevel = verificationLevel;
	OPTIONS = OPTIONS;
	maxUploadNumber: number = 3;
	vendorList = [];
	pageVendor: number = 1;
	pageSizeVendor: number = 20;
	collectionSizeVendor: number;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private uploadService: UploadService,
		private vendorService: VendorService,
		private verificationDetailsService: VerificationDetailsService,
		private educationDetailsService: EducaationDetailsService,
		private modalService: NgbModal,
		private router: Router,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private userService: UserService
	) {
		// this.addItems();
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}
	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
		});

		this.loadData();
		this.loadVendorData();
		this.verificationDetailsService.userVerification.subscribe((verificationList) => {
			if (verificationList && verificationList.length > 0) {
				const educationalCheck = verificationList.find((e) => e.value === planFeatures.EDUCATIONAL);
				if (educationalCheck) {
					this.maxUploadNumber = educationalCheck.maxUploadNumber;
				}
			}
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
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
	get form() {
		return this.dataForm.controls;
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			userId: this.userId,
			...filters,
		};
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/educational-details`
			: `/educational-details`;
		this.spinnerService.start();
		this.educationDetailsService.getList(url, params).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				if (result.data.rows.length > 0) {
					this.form['status'].setValue(result.data.rows[0]?.status);
					this.form['remark'].setValue(result.data.rows[0]?.remark);
					this.form['vendorId'].setValue(result.data.rows[0]?.vendorId);
				} else {
					this.dataForm.reset();
				}
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
	add(): void {
		const modalRef = this.modalService.open(EducationalDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.userId = this.userId;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				console.log('dismiss', dismiss);
				if (dismiss) {
					this.statusFilter = '';
					this.loadData();
					this.verificationDetailsService.showCompleteModal(
						'educational-details',
						'pending',
						this.dataList['count'] + 1
					);
				}
			}
		);
	}
	update(data: any): void {
		const modalRef = this.modalService.open(EducationalDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.userId = this.userId;
		modalRef.componentInstance.modelData = data;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				if (dismiss) {
					this.loadData();
				}
			}
		);
	}
	openConfirmDelete(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.requestTitle('delete')}?`;
		modalRef.componentInstance.description = `${confirmMessages.requestDescription(
			'delete this this organization'
		)} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.educationDetailsService.delete(item.id).subscribe({
					next: (result) => {
						this.loadData();
						this.verificationDetailsService.showCompleteModal(
							'educational-details',
							'pending',
							this.dataList['count'] - 1
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
		this.verificationDetailsService.navigateToNext(path, 'educational-details', this.userData);
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
				backdrop: 'static',
			});
			modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
			modalRef.componentInstance.description = `${confirmMessages.hideDescription}${
				status === verificationLevel.CLEAR_REPORT ? 'approve' : 'reject'
			} ? \n`;
			modalRef.componentInstance.okText = 'Yes';
			modalRef.componentInstance.cancelText = 'Cancel';
			modalRef.result.then(
				(result) => {
					let payload = {
						status,
						userId: this.userId,
						remark: this.form['remark'].value,
						vendorId: this.form['vendorId'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		} else {
			const modalRef = this.modalService.open(ChangeStatusComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.modelData = this.dataForm.getRawValue();
			modalRef.result.then(
				(result) => {
					let payload = {
						status: result.status,
						userId: this.userId,
						remark: this.form['remark'].value,
						vendorId: this.form['vendorId'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		}
	}
	getFileType(url: string) {
		let urlParse = url.split('.');
		return urlParse[urlParse.length - 1];
	}

	onVendorSelect() {
		let payload = {
			status: this.form['status'].value,
			userId: this.userId,
			vendorId: this.form['vendorId'].value,
		};
		this.patch(payload);
	}
	patch(payload) {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.educationDetailsService.updateStatus(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(payload.status);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('educational-details', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	triggerEvent($event, item) {
		if ($event?.type === 'delete') {
			this.openConfirmDelete(item);
		}
	}

	showImage(file) {
		const modalRef = this.modalService.open(FileViewerComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.files = [file];
		modalRef.componentInstance.fileType = 'images';
	}
	loadVendorData(filters = {}): void {
		let params = {
			start: (this.pageVendor - 1) * this.pageSizeVendor,
			limit: this.pageSizeVendor,
			...filters,
			designation: 'vendor',
		};
		this.spinnerService.start();
		this.vendorService.list(params).subscribe({
			next: (result) => {
				this.vendorList = [...this.vendorList, ...result.data['rows']];
				this.collectionSizeVendor = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchVendor($event) {
		this.loadVendorData({ search: $event.term });
	}
	onChangeVerificationType() {
		this.vendorList = [];
		this.collectionSizeVendor = 0;
		this.loadVendorData();
	}
	onScrollVendor() {
		if (this.vendorList.length === this.collectionSizeVendor) {
			return;
		}
		this.pageVendor++;
		this.loadVendorData();
	}
	sendEmailToVendor() {
		this.spinnerService.stop();
		this.verificationDetailsService
			.sendReportToVendor({ id: this.userId, type: planFeatures.EDUCATIONAL })
			.subscribe({
				next: (result) => {
					this.spinnerService.stop();
					this.toastService.success(result.message);
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.EDUCATIONAL)
		);
	}
}
