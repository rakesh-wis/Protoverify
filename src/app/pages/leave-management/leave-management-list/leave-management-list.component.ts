import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { LeaveRequestService } from 'src/app/core/services/leave-request.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, confirmMessages, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';

@Component({
	selector: 'app-leave-management-list',
	templateUrl: './leave-management-list.component.html',
	styleUrls: ['./leave-management-list.component.scss'],
})
export class LeaveManagementListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'Pending', name: defaultStatus.PENDING },
		{ label: 'Approved', name: defaultStatus.APPROVED },
		{ label: 'Rejected', name: defaultStatus.REJECTED },
	];
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Name',
			value: 'name',
			sorting: false,
		},
		{
			label: 'No of days',
			value: 'sites',
			sorting: false,
		},
		{
			label: 'From',
			value: 'fromDate',
			sorting: false,
		},
		{
			label: 'To',
			value: 'toDate',
			sorting: false,
		},
		{
			label: 'Status',
			value: '',
			sorting: false,
		},
		{
			label: 'Action',
			value: '',
			sorting: false,
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		config: NgbDropdownConfig,
		private modalService: NgbModal,
		private router: Router,
		private leaveRequestService: LeaveRequestService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadData();
	}

	calculateDateDifference(item) {
		return item.dayType === 'full_day'
			? moment.duration(moment(item.toDate).diff(moment(item.fromDate))).asDays() + 1
			: 0;
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.leaveRequestService.list(params).subscribe({
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
		});
	}

	view(item: any): void {
		this.router.navigateByUrl(`/leave-management/${item.id}/details`);
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
				item.status = status;
				this.changeStatus(item);
			},
			(dismiss) => {}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.leaveRequestService.patch(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
				});
				this.spinnerService.stop();
				this.toastService.success(result.message);
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
		this.spinnerService.start();
		this.leaveRequestService.delete(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
				});
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
