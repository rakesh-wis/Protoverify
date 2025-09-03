import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, OPTIONS, verificationStatus } from 'src/app/helpers';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';
import { UserDetailsComponent } from '../../verification/user-details/user-details.component';
import { SitesService } from 'src/app/core/services/sites.service';
import { saveAs } from 'file-saver';
import { FormGroup, FormControl } from '@angular/forms';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { UserBulkUploadComponent } from '../../verification/user-bulk-upload/user-bulk-upload.component';

@Component({
	selector: 'app-start-verification-list',
	templateUrl: './start-verification-list.component.html',
	styleUrls: ['./start-verification-list.component.scss'],
})
export class StartVerificationListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	pages: number[] = [10, 20, 30, 40, 50];
	dataList: any = {
		data: [],
		count: -1,
	};
	statsCards = [
		{
			icon: './assets/icons/dashboard/pending-verification.svg',
			// lineIcon: './assets/icons/dashboard/purple-line.svg',
			label: 'Pending Verifications',
			category: 'pending',
			path: null,
			value: 0,
		},
		{
			icon: './assets/icons/dashboard/completed-verification.svg',
			// lineIcon: './assets/icons/dashboard/blue-line.svg',
			label: 'Completed Verifications',
			category: 'completed',
			path: null,
			value: 0,
		},
		{
			icon: './assets/icons/dashboard/total-verification.svg',
			// lineIcon: './assets/icons/dashboard/light-green-line.svg',
			label: 'Total Candidates',
			category: 'total',
			path: null,
			value: 0,
		},
	];
	siteListCount: number = 0;
	searchTerm: string = '';
	defaultStatus = defaultStatus;
	VERIFICATION_BASE_URL = VERIFICATION_BASE_URL;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	OPTIONS = OPTIONS;
	verificationStatus = verificationStatus;
	intervals: any = [];
	filters: any = {};
	filterForm = new FormGroup({
		verificationStatus: new FormControl(''),
		search: new FormControl(''),
		startDate: new FormControl(''),
		endDate: new FormControl(''),
	});
	maxDate;
	minDate = { year: 1950, month: 1, day: 1 };
	selectedData = [];
	constructor(
		config: NgbDropdownConfig,
		private router: Router,
		private employeeService: EmployeeService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private sitesService: SitesService,
		private verificationDetailsService: VerificationDetailsService,
		private activatedRoute: ActivatedRoute,
		private dashboardService: DashboardService,
		configDate: NgbInputDatepickerConfig
	) {
		this.maxDate = { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() };
		configDate.maxDate = this.maxDate;
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params['page']) {
				this.page = parseInt(params['page']);
			}
			this.filterForm.patchValue(params);
		});
		this.getVerificationStats();
		this.loadData();
		this.getSites();
	}
	customStatus(value): string {
		return value.replaceAll('_', ' ');
	}
	getVerificationStats(): void {
		this.dashboardService.getVerificationStats({}).subscribe({
			next: ({ data }) => {
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'completed')].value = data.reduce(
					(accumulator, currentValue) =>
						accumulator +
						(currentValue.verificationStatus === verificationStatus.PROTO_VERIFIED
							? currentValue.count
							: 0),
					0
				);
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'pending')].value = data.reduce(
					(accumulator, currentValue) =>
						accumulator +
						([verificationStatus.DID_NOT_VERIFY, verificationStatus.PARTIALLY_VERIFIED].includes(
							currentValue.verificationStatus
						)
							? currentValue.count
							: 0),
					0
				);
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'total')].value = data.reduce(
					(accumulator, currentValue) => accumulator + currentValue.count,
					0
				);
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
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

	onPageChange(event): void {
		this.page = event?.page;
		this.updatePageRoute();
		this.loadData({
			search: this.searchTerm,
		});
	}
	updatePageRoute() {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page, ...this.filterForm.getRawValue() },
			queryParamsHandling: 'merge',
		});
	}
	addAndRemoveAll($event) {
		if (!$event.target.checked) {
			this.selectedData = this.dataList?.rows.map((e) => Object.assign(e, { selected: false }));
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
			this.selectedData.push(item);
		}
	}

	getCheckReportGeneration(id: number): boolean {
		const interval = this.intervals.find((e) => e.id == id);
		return interval ? true : false;
	}
	ngOnDestroy() {
		if (this.intervals && this.intervals.length > 0) {
			this.intervals.map((e) => clearInterval(e));
		}
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
			}, 20000),
		});
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
	checkAllDocumentAreSubmitted(item): boolean {
		return item ? item.every((element) => element.checked) : [];
	}
	getPendingCount(item): Number {
		return item.reduce((acc, curr) => (!curr.checked ? (acc += 1) : (acc += 0)), 0);
	}
	clearFilter() {
		this.filterForm.reset();
		this.filterForm.get('search').setValue('');
		this.filterForm.get('startDate').setValue('');
		this.filterForm.get('endDate').setValue('');
		this.filterForm.get('verificationStatus').setValue('');
		this.loadData();
	}
	applyFilters() {
		this.loadData();
	}
	view(item: any): void {
		this.router.navigate([`/start-verification/${item.id}/organization-details`], {
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
		if (this.siteListCount < 1) {
			this.toastService.error('Region & site details are required to start verification');
			return;
		}
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
	edit(item): void {
		const modalRef = this.modalService.open(UserDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	bulkUpload(): void {
		const modalRef = this.modalService.open(UserBulkUploadComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
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
	getSites(filters = {}): void {
		let params = {
			start: 0,
			limit: 10,
			status: defaultStatus.ACTIVE,
			...filters,
		};
		this.spinnerService.start();
		this.sitesService.list(params).subscribe({
			next: (result) => {
				this.siteListCount = result.data['count'];
				this.spinnerService.stop();
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
	navigateToVerificationPage(employee, verification): void {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.router.navigate([`/${path}-verification/${employee['id']}/${verification.path}`], {
			queryParams: { id: employee['id'], name: employee['name'] },
		});
	}
}
