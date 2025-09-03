import { Component, OnInit } from '@angular/core';
import { BillingService } from '../../../core/services/billing.service';
import { SpinnerService } from '../../../core/services/spinner.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OPTIONS, connectionType } from '../../../helpers';
import { saveAs } from 'file-saver';
import moment from 'moment';

@Component({
	selector: 'app-billing-list',
	templateUrl: './billing-list.component.html',
	styleUrls: ['./billing-list.component.scss'],
})
export class BillingListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string }> = [
		{
			label: 'Billing ID',
			value: 'name',
		},
		{
			label: 'Billing Date',
			value: '',
		},
		{
			label: 'Amount',
			value: '',
		},
		{
			label: 'Mode of Payment',
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
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.billingService.list(params).subscribe({
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

	downLoadInvoice(id): void {
		this.spinnerService.start();
		this.billingService.downloadInvoice(id, null).subscribe({
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
