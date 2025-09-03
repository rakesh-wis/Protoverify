import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckinTimeService } from 'src/app/core/services/checkin-time.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, monthNames, OPTIONS } from 'src/app/helpers';

@Component({
	selector: 'app-log-list',
	templateUrl: './log-list.component.html',
	styleUrls: ['./log-list.component.scss'],
})
export class LogListComponent implements OnInit {
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;

	collectionSizeEmployee: number = 10;
	pageEmployee: number = 1;
	pageSizeEmployee: number = 20;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Check in date',
			value: 'title',
			sorting: true,
		},
		{
			label: 'Name',
			value: 'name',
			sorting: true,
		},
		{
			label: 'Location',
			value: 'location',
			sorting: true,
		},
		{
			label: 'Check in time',
			value: '',
			sorting: true,
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	employeeDataList: any = {
		rows: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	OPTIONS = OPTIONS;
	selectedEmployee: any;
	selectedMonth: any = [];
	monthNameList = monthNames;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		config: NgbDropdownConfig,
		private modalService: NgbModal,
		private checkInService: CheckinTimeService,
		private employeeService: EmployeeService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadEmployee();
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.checkInService.logList(params).subscribe({
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

	loadEmployee(filters = {}): void {
		let params = {
			start: (this.pageEmployee - 1) * this.pageSizeEmployee,
			limit: this.pageSizeEmployee,
			...filters,
		};
		this.spinnerService.start();
		this.employeeService.list(params).subscribe({
			next: (result) => {
				this.employeeDataList = result.data;
				this.collectionSizeEmployee = result.data['count'];
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
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}

	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	clearFilter() {
		this.statusFilter = null;
		this.searchTerm = null;
		this.loadData();
	}

	applyFilters() {
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
			...(this.selectedEmployee && { employeeId: this.selectedEmployee }),
			...(this.selectedMonth && { month: this.selectedMonth }),
		});
	}

	onScrollEmployee() {
		if (this.employeeDataList.length === this.collectionSizeEmployee) {
			return;
		}
		this.page++;
		this.loadEmployee();
	}
	searchClient($event) {
		this.loadEmployee({ search: $event.term });
	}
}
