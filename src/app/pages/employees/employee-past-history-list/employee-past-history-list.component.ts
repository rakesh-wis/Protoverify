import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { OPTIONS } from 'src/app/helpers';
import { getDurationInMonth } from 'src/app/helpers/utils.helper';

@Component({
	selector: 'app-employee-past-history-list',
	templateUrl: './employee-past-history-list.component.html',
	styleUrls: ['./employee-past-history-list.component.scss'],
})
export class EmployeePastHistoryListComponent implements OnInit {
	@Input() employeeId: number;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	dataList: any = {
		rows: [],
		count: -1,
	};
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	constructor(
		private employeeService: EmployeeService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			employeeId: this.employeeId,
			...filters,
		};
		this.spinnerService.start();
		this.employeeService.pastOrganizationList(params).subscribe({
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
	getDurationInMonth(item): number {
		return getDurationInMonth(item.fromDate, item.toDate);
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
}
