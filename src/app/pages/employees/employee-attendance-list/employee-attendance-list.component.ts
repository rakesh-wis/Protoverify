import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/core/services/attendance.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { saveAs } from 'file-saver';
import moment from 'moment';

@Component({
	selector: 'app-employee-attendance-list',
	templateUrl: './employee-attendance-list.component.html',
	styleUrls: ['./employee-attendance-list.component.scss'],
})
export class EmployeeAttendanceListComponent implements OnInit {
	@Input() employeeId: number;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	dataList: any = {
		rows: [],
		count: -1,
	};
	OPTIONS = OPTIONS;
	selectedDate = null;
	summaryData: any = {};
	defaultStatus = defaultStatus;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	constructor(
		private modalService: NgbModal,
		private attendanceService: AttendanceService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

	selectMonthYear($event) {
		this.selectedDate = $event.value;
		this.loadData({ month: this.selectedDate.month() + 1, year: this.selectedDate.year() });
		this.loadSummary({ month: this.selectedDate.month() + 1, year: this.selectedDate.year() });
	}
	get selectedMonthYear() {
		return `${this.selectedDate.format('MMM YYYY')}`;
	}
	getDuration(minutes) {
		const hours = Math.floor(minutes / 60);
		minutes = minutes % 60;
		return `${hours}:${minutes}`;
	}
	loadSummary(filters = {}): void {
		let params = {
			employeeId: this.employeeId,
			...filters,
		};
		this.spinnerService.start();
		this.attendanceService.summary(params).subscribe({
			next: (result) => {
				this.summaryData = result.data;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			employeeId: this.employeeId,
			...filters,
		};
		this.spinnerService.start();
		this.attendanceService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
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

	onPageChange($event: number, event: string): void {
		if (this.isPrevious() && event === 'prev') {
			return;
		} else if (event === 'next' && this.isLastPage()) {
			return;
		}
		this.page = $event;
		this.loadData();
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	openConfirmStatus(item, status) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription}${
			status === defaultStatus.APPROVED ? 'approve' : 'reject'
		} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				item.status = status === defaultStatus.APPROVED ? defaultStatus.APPROVED : defaultStatus.REJECTED;
				this.changeStatus(item);
			},
			(dismiss) => {}
		);
	}

	changeStatus(item) {
		this.spinnerService.start();
		this.attendanceService.patch(item).subscribe({
			next: (result) => {
				this.loadData({ month: this.selectedDate.month() + 1, year: this.selectedDate.year() });
				this.loadSummary({ month: this.selectedDate.month() + 1, year: this.selectedDate.year() });
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	downloadAttendance(): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			month: this.selectedDate.month() + 1,
			year: this.selectedDate.year(),
			employeeId: this.employeeId,
		};
		this.spinnerService.start();
		this.attendanceService.downloadAttendance(params).subscribe({
			next: (result) => {
				saveAs(result, `Attendance ${moment().format('DD-MM-YYYY hh:mm a')}`);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
