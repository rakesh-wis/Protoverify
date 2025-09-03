import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/core/services/client.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';

import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import {
	confirmMessages,
	defaultStatus,
	OPTIONS,
	planFeatures,
	ROLES,
	verificationList,
	verificationStatus,
} from 'src/app/helpers';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';
import { saveAs } from 'file-saver';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { UserService } from 'src/app/core';
import { User } from 'src/app/models';
import { FormGroup, FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { UserDetailsComponent } from '../../verification/user-details/user-details.component';

@Component({
	selector: 'app-direct-verification-list',
	templateUrl: './direct-verification-list.component.html',
	styleUrls: ['./direct-verification-list.component.scss'],
})
export class DirectVerificationListComponent implements OnInit {
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;
	collectionSizeClient: number = 0;
	pageClient: number = 1;
	pageSizeClient: number = 20;
	pages: number[] = [10, 20, 30, 40, 50];
	VERIFICATION_BASE_URL = VERIFICATION_BASE_URL;

	dataList: any = {
		data: [],
		count: -1,
	};
	filterForm = new FormGroup({
		verificationStatus: new FormControl(''),
		search: new FormControl(''),
		startDate: new FormControl(''),
		endDate: new FormControl(''),
		associateId: new FormControl(''),
	});

	onBoarderList: any = [];
	unVerifiedStatus = [defaultStatus.ON_BOARDED, defaultStatus.PENDING];
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	organizationList: any = [];
	OPTIONS = OPTIONS;
	verificationStatus = verificationStatus;
	intervals: any = [];
	currentUser: User;
	ROLES = ROLES;
	maxDate;
	minDate = { year: 1950, month: 1, day: 1 };
	selectedData = [];
	bulkList = {
		SEND_ONBOARDING_MESSAGE: 'SEND_ONBOARDING_MESSAGE',
		GENERATE_REPORT: 'GENERATE_REPORT',
		SEND_REPORT: 'SEND_REPORT',
		DOWNLOAD_REPORT: 'DOWNLOAD_REPORT',
	};
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	constructor(
		private verificationDetailsService: VerificationDetailsService,
		config: NgbDropdownConfig,
		private router: Router,
		private employeeService: EmployeeService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientService: ClientService,
		private userService: UserService,
		private modalService: NgbModal,
		configDate: NgbInputDatepickerConfig,
		private activatedRoute: ActivatedRoute
	) {
		this.maxDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
		configDate.maxDate = this.maxDate;
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
		this.currentUser = this.userService.getCurrentUser();
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params['page']) {
				this.page = parseInt(params['page']);
			}
			this.filterForm.patchValue(params);
			if (params['associateId']) {
				this.filterForm
					.get('associateId')
					.setValue(
						typeof params['associateId'] === 'string'
							? [parseInt(params['associateId'])]
							: params['associateId'].map((e) => parseInt(e))
					);
			}
		});
		this.getClientList();
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
			...this.filterForm.getRawValue(),
		};
		this.spinnerService.start();
		this.employeeService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.dataList['rows'].forEach((element) => {
					this.verificationDetailsService.verificationCount({ userId: element.id }).subscribe({
						next: (verificationResult) => {
							element['verificationCount'] = verificationResult.data;
						},
					});
				});
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSort({ column, direction }: SortEvent) {
		this.headers.forEach((header) => {
			if (header.sortable !== column) {
				header.direction = '';
			}
		});

		if (direction === '' || column === '') {
			this.loadData();
		} else {
			this.loadData({
				column,
				direction,
			});
		}
	}
	getDaysDiff(date: any): number {
		const currentDate = new Date();
		const createdAt = new Date(date);
		const timeDifference = currentDate.getTime() - createdAt.getTime();
		return Math.floor(timeDifference / (1000 * 3600 * 24));
	}
	getDateRange(days: number): string {
		if (Math.round(days / 5) * 5 == Math.ceil(days / 5) * 5) {
			return Math.ceil(days / 5) * 5 - 5 + '-' + Math.ceil(days / 5) * 5 + ' days';
		}
		return Math.round(days / 5) * 5 + '-' + Math.ceil(days / 5) * 5 + ' days';
	}

	checkAllDocumentAreSubmitted(item): boolean {
		return item?.every((element) => element.checked);
	}
	getPendingCount(item): Number {
		return item?.reduce((acc, curr) => (!curr.checked ? (acc += 1) : (acc += 0)), 0);
	}

	onPageChange(event): void {
		this.page = event?.page;
		this.updatePageRoute();
		this.loadData();
	}

	updatePageRoute() {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page, ...this.filterForm.getRawValue() },
			queryParamsHandling: 'merge',
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	clearFilter() {
		this.filterForm.reset();
		this.filterForm.get('search').setValue('');
		this.filterForm.get('startDate').setValue('');
		this.filterForm.get('endDate').setValue('');
		this.filterForm.get('associateId').setValue('');
		this.filterForm.get('verificationStatus').setValue('');
		this.loadData();
	}
	applyFilters() {
		this.updatePageRoute();
		this.loadData();
	}
	view(item: any): void {
		this.router.navigate([`/direct-verification/${item.id}/organization-details`], {
			queryParams: { id: item.id, name: item.name },
		});
	}
	getClass(item): string {
		const percentage = parseInt(item?.verificationCount?.percentage);
		if (percentage >= 80) {
			return 'progress-bar-100';
		} else if (percentage < 80 && percentage >= 50) {
			return 'progress-bar-50';
		} else {
			return 'progress-bar-20';
		}
	}
	add(): void {
		const modalRef = this.modalService.open(UserDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	getClientList(filter = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSizeClient,
			limit: this.pageSizeClient,
			status: defaultStatus.ACTIVE,
			column: 'registeredName',
			direction: 'asc',
			...filter,
		};
		console.log(params);
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				this.organizationList.map(
					(e) => (e['registeredName'] = e.businessDetails?.registeredName || e?.registeredName)
				);
				this.collectionSizeClient = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchClient($event) {
		this.organizationList = [];
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (this.organizationList.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClientList();
	}
	getCheckReportGeneration(id: number): boolean {
		const interval = this.intervals.find((e) => e.id == id);
		return interval ? true : false;
	}
	callEmployeeIdWithSetInterval(id): void {
		this.intervals.push({
			id,
			interval: setInterval(() => {
				this.employeeService.getById(id).subscribe({
					next: (result) => {
						let index = this.dataList.rows.findIndex((key) => key.id == id);
						this.dataList.rows[index].reportLink = result.data.reportLink;
						const intervalIndex = this.intervals.findIndex((key) => key.id === id);
						if (intervalIndex > -1) {
							clearInterval(this.intervals[intervalIndex].interval);
							this.intervals.splice(intervalIndex, 1);
						}
					},
				});
			}, 30000),
		});
	}
	ngOnDestroy() {
		if (this.intervals && this.intervals.length > 0) {
			this.intervals.map((e) => clearInterval(e));
		}
	}
	sendReport(item): void {
		this.spinnerService.start();
		this.verificationDetailsService.sendReport({ userId: item.id }).subscribe({
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
	sendWhatsAppOnBoarding(item): void {
		this.spinnerService.start();
		this.employeeService.sendWhatsAppOnBoarding(item.id).subscribe({
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
	reGenerateReport(item): void {
		this.spinnerService.start();
		this.verificationDetailsService.regenerateReport({ userId: item.id }).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.callEmployeeIdWithSetInterval(item.id);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	downloadReport(employee): void {
		saveAs(employee.reportLink, `${employee.name}_report.pdf`);
	}
	exportBulk(): void {
		const wb = XLSX.utils.book_new();
		const wsName = 'Verification Data';
		const wsData = [['SNo', 'Name', 'Mobile Number', 'Company', 'Date', 'Status', 'Verification', '', '', '']];
		const subColumnHeaders = ['', '', '', '', '', '', 'Pending', 'Submitted', 'Verified'];
		wsData.push(subColumnHeaders);
		this.selectedData.forEach((data, index) => {
			const verificationList = data.verificationCount.verificationList;
			const pendingCount = verificationList.filter((item) => item.status === 'pending');
			const submittedCount = verificationList.filter((item) => item.status === 'clear_report');
			const verifiedCount = verificationList.filter((item) => item.status === 'major_discrepancy');
			const row = [
				index + 1,
				data.name,
				`${data.countryCode}-${data.mobileNumber}`,
				data.associated?.businessDetails?.registeredName,
				moment(data.createdAt).format('DD-MM-yyyy'), // Date
				`${data.verificationCount?.percentage} % completed`,
				pendingCount.map((e) => e.title).join(',\n'),
				submittedCount.map((e) => e.title).join(',\n'),
				verifiedCount.map((e) => e.title).join(',\n'),
			];
			wsData.push(row);
		});
		const ws = XLSX.utils.aoa_to_sheet(wsData);
		ws['!merges'] = [{ s: { r: 0, c: 6 }, e: { r: 0, c: 8 } }];
		ws['!cols'] = [
			{ width: 5 }, // SNo
			{ width: 20 }, // Name
			{ width: 15 }, // Mobile Number
			{ width: 15 }, // Date
			{ width: 15 }, // Status
			{ width: 20 }, // Verification
			{ width: 30 }, // Pending
			{ width: 30 }, // Submitted
			{ width: 30 }, // Verified
		];
		XLSX.utils.book_append_sheet(wb, ws, wsName);
		XLSX.writeFile(wb, `Candidate Export List ${moment().format('DD-MM-YYYY hh:mm a')}.xlsx`);
	}

	openConfirmDelete(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.delete(item);
			},
			(dismiss) => {}
		);
	}

	delete(item: any) {
		const url = `/admin/user/${item.id}`;
		this.spinnerService.start();
		this.userService.delete(url).subscribe({
			next: (result) => {
				this.loadData();
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	navigateToVerificationPage(employee, verification): void {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.router.navigate([`/${path}-verification/${employee['id']}/${verification.path}`], {
			queryParams: { id: employee['id'], name: employee['name'] },
		});
	}
	addAndRemoveAll($event) {
		if (!$event.target.checked) {
			this.dataList?.rows.forEach((e) => Object.assign(e, { selected: false }));
			this.selectedData = [];
		} else {
			this.selectedData = this.dataList?.rows.map((e) => Object.assign(e, { selected: true }));
		}
	}

	addAndRemove($event, item) {
		if (!$event.target.checked) {
			this.selectedData.splice(
				this.selectedData.findIndex((e) => e.id === item.id),
				1
			);
		} else {
			item.selected = true;
			this.selectedData.push(item);
		}
	}

	openConfirmBulkDelete() {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription}?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				const url = `/admin/user/bulk-delete`;
				this.spinnerService.start();
				this.userService.patchStatus({ ids: this.selectedData.map((e) => e.id) }, url).subscribe({
					next: (result) => {
						this.selectedData = [];
						this.loadData();
						this.spinnerService.stop();
						this.toastService.success(result.message);
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

	performBulkAction(action: string) {
		switch (action) {
			case this.bulkList.SEND_ONBOARDING_MESSAGE:
				this.selectedData.map((employee) => {
					this.sendWhatsAppOnBoarding(employee);
				});
				break;
			case this.bulkList.GENERATE_REPORT:
				this.selectedData.map((employee) => {
					this.reGenerateReport(employee);
				});
				break;
			case this.bulkList.SEND_REPORT:
				this.selectedData.map((employee) => {
					if (employee.reportLink) this.sendReport(employee);
				});
				break;
			case this.bulkList.DOWNLOAD_REPORT:
				this.selectedData.map((employee) => {
					if (employee.reportLink) this.downloadReport(employee);
				});
				break;
			default:
				break;
		}
	}
}
