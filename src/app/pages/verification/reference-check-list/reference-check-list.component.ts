import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService, UploadService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ReferenceCheckService } from 'src/app/core/services/reference-check.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { ROLES, kycStatus, verificationLevel, confirmMessages, planFeatures } from 'src/app/helpers';
import { pastEmployeeFieldsForm } from 'src/app/helpers/form-error.helper';
import { FileViewerComponent } from 'src/app/shared/components/common/file-viewer/file-viewer.component';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ChangeStatusComponent } from '../change-status/change-status.component';
import { ReferenceCheckDetailsComponent } from '../reference-check-details/reference-check-details.component';
import { Location } from '@angular/common';

@Component({
	selector: 'app-reference-check-list',
	templateUrl: './reference-check-list.component.html',
	styleUrls: ['./reference-check-list.component.scss'],
})
export class ReferenceCheckListComponent implements OnInit {
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
	dataList: any = {};
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
		private referenceCheckService: ReferenceCheckService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		private userService: UserService,
		private location: Location,
		private router: Router,
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
			if (verificationList) {
				const check = verificationList.find((e) => e.value === planFeatures.REFERENCE_CHECK);
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
			? `/admin/employee/reference-check`
			: `/employee/reference-check`;
		this.spinnerService.start();
		this.referenceCheckService.getList(params, url).subscribe({
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
		const modalRef = this.modalService.open(ReferenceCheckDetailsComponent, {
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
						'reference-check',
						'pending',
						this.dataList.length + 1
					);
				}
			}
		);
	}
	update(data: any): void {
		const modalRef = this.modalService.open(ReferenceCheckDetailsComponent, {
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
		this.referenceCheckService.buildStatus(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(payload.status);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('reference-check', this.form['status'].value);
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
				this.referenceCheckService.delete(item.id).subscribe({
					next: (result) => {
						this.loadData();
						this.verificationDetailsService.showCompleteModal(
							'reference-check',
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
		this.verificationDetailsService.navigateToNext(path, 'reference-check', this.userData);
	}
	showImage(file) {
		const modalRef = this.modalService.open(FileViewerComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.files = [file];
		modalRef.componentInstance.fileType = 'images';
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.REFERENCE_CHECK)
		);
	}
}
