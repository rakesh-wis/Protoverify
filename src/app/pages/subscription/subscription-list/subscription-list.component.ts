import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, OPTIONS, planStatus } from 'src/app/helpers';

@Component({
	selector: 'app-subscription-list',
	templateUrl: './subscription-list.component.html',
	styleUrls: ['./subscription-list.component.scss'],
})
export class SubscriptionListComponent implements OnInit {
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;

	dataList: any = {
		rows: [],
		count: -1,
	};
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Title',
			value: 'title',
			sorting: false,
		},
		{
			label: 'Plan Created on',
			value: 'validFrom',
			sorting: false,
		},
		{
			label: 'No of Cases',
			value: 'noOfVerification',
			sorting: false,
		},
		{
			label: 'Cost per Verification',
			value: 'status',
			sorting: false,
		},
		{
			label: 'Amount',
			value: 'totalAmount',
			sorting: false,
		},
		{
			label: 'Due Date',
			value: 'validTill',
			sorting: false,
		},
		{
			label: 'Payment Status',
			value: 'isPaid',
			sorting: false,
		},
		{
			label: '',
			value: '',
			sorting: false,
		},
	];
	statusFilter = [planStatus.EXPIRED];
	planStatus = planStatus;
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	constructor(
		private subscriptionService: SubscriptionService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			status: this.statusFilter,
			...filters,
		};
		this.spinnerService.start();
		this.subscriptionService.list(params).subscribe({
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

	onPageChange(event): void {
		this.page = event?.page;
		this.loadData();
	}

	selectPlan(item): void {
		this.router.navigate([`/getting-started/${item.planId}/buy-plan`]);
	}
}
