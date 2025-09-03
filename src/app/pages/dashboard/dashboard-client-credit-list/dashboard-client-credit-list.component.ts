import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, OPTIONS } from 'src/app/helpers';

@Component({
	selector: 'app-dashboard-client-credit-list',
	templateUrl: './dashboard-client-credit-list.component.html',
	styleUrls: ['./dashboard-client-credit-list.component.scss'],
})
export class DashboardClientCreditListComponent implements OnInit {
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Organization',
			value: 'registeredName',
			sorting: true,
		},
		{
			label: 'Onboarding Date',
			value: 'onboardingDate',
			sorting: false,
		},
		{
			label: 'Total Credit',
			value: 'totalAmount',
			sorting: false,
		},
		{
			label: 'Credit Used',
			value: '',
			sorting: false,
		},
	];
	dataList: any = {};
	statusFilter: string = 'all';
	searchTerm: string = '';
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		config: NgbDropdownConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private subscriptionService: SubscriptionService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadData();
	}
	customStatus(value) {
		return value.replace('_', ' ');
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.subscriptionService.getClientCredits(params).subscribe({
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
			console.log(column, direction);
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
		});
	}
}
