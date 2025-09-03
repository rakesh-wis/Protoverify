import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from 'src/app/core/services/billing.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, connectionType } from 'src/app/helpers';
import { saveAs } from 'file-saver';
import moment from 'moment';

@Component({
	selector: 'app-admin-billing-client-invoice-list',
	templateUrl: './admin-billing-client-invoice-list.component.html',
	styleUrl: './admin-billing-client-invoice-list.component.scss',
})
export class AdminBillingClientInvoiceListComponent implements OnInit, OnChanges {
	@Input() filters: any;

	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string }> = [
		{
			label: 'Client',
			value: 'client',
		},
		{
			label: 'Invoice ID',
			value: null,
		},
		{
			label: 'Billing Date',
			value: '',
		},
		{
			label: 'Amount',
			value: '',
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	OPTIONS = OPTIONS;
	constructor(
		private billingService: BillingService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params['page']) {
				this.page = parseInt(params['page']);
			}
			this.loadData();
		});
	}
	private areFiltersEqual(prevFilters: any, currentFilters: any): boolean {
		return JSON.stringify(prevFilters) === JSON.stringify(currentFilters);
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes['filters'] &&
			!this.areFiltersEqual(changes['filters'].previousValue, changes['filters'].currentValue)
		) {
			this.loadData(this.filters);
		}
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.billingService.clientWiseList(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				if (
					this.dataList.count > 0 &&
					this.dataList.rows[0].walletType === connectionType.POST_PAID &&
					this.page === 1 &&
					!this.headerColumn.find((e) => e.label === 'Action')
				) {
					this.headerColumn.push({ label: 'Action', value: 'icon' });
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	updatePageRoute() {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page },
			queryParamsHandling: 'merge',
		});
	}
	onPageChange(event): void {
		this.page = event?.page;
		this.updatePageRoute();
		this.loadData();
	}

	downLoadInvoice(item): void {
		this.spinnerService.start();
		this.billingService.downloadInvoice(item.id, { userId: item.userId }).subscribe({
			next: (result) => {
				saveAs(result, `Invoice ${moment().format('DD-MM-YYYY hh:mm a')}`);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
