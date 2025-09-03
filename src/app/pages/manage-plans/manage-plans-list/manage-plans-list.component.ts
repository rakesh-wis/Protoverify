import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
	OPTIONS,
	confirmMessages,
	defaultStatus,
	planFeatures,
	planModules,
	planModulesFeatures,
	planStatus,
} from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ManagePlansDetailsComponent } from '../manage-plans-details/manage-plans-details.component';
import { ClientService } from 'src/app/core/services/client.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ManagePlansViewComponent } from '../manage-plans-view/manage-plans-view.component';
import { SubscriptionService } from 'src/app/core/services/subscription.service';

@Component({
	selector: 'app-manage-plans-list',
	templateUrl: './manage-plans-list.component.html',
	styleUrls: ['./manage-plans-list.component.scss'],
})
export class ManagePlansListComponent implements OnInit {
	dataList: any = {
		rows: [],
		count: -1,
	};
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Company Name',
			value: 'companyName',
			sorting: false,
		},
		{
			label: 'Plan Created on',
			value: 'createdAt',
			sorting: false,
		},
		{
			label: 'Number of Cases',
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
		// {
		// 	label: 'Due Date',
		// 	value: 'expiryDate',
		// 	sorting: false,
		// },
		{
			label: 'Payment Status',
			value: 'paymentStatus',
			sorting: false,
		},
	];
	defaultStatus = planStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	planModulesFeatures = [
		...planModulesFeatures,
		...[
			{
				checked: false,
				label: 'Aadhaar Card',
				title: 'Aadhaar Card',
				value: planFeatures.AADHAR_CARD,
				module: planModules[0].value,
			},
		],
	];
	filterForm = new FormGroup({
		search: new FormControl(''),
		selectedOrganization: new FormControl(''),
	});
	OPTIONS = OPTIONS;
	constructor(
		private modalService: NgbModal,
		private planService: PlanService,
		private subscriptionService: SubscriptionService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {
		this.planService.refreshTable.subscribe(() => {
			this.dataList = {
				rows: [],
				count: -1,
			};
			this.loadData();
		});
	}

	ngOnInit(): void {
		this.loadData();
	}

	clearFilter() {
		this.filterForm.reset();
		this.filterForm.get('search').setValue('');
		this.filterForm.get('selectedOrganization').setValue('');
		this.loadData();
	}
	applyFilters(filters) {
		this.dataList['rows'] = [];
		this.collectionSize = 0;
		this.loadData(filters);
	}
	getPlanTitle(item) {
		return this.planModulesFeatures.find((e) => e.value === item.title);
	}

	getColor(item) {
		if (item?.planFeature.length >= 13) {
			return 'green';
		} else if (item.planFeature.length >= 6 && item.planFeature.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
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
	onPageChange(event): void {
		this.page = event?.page;
		this.loadData();
	}
	edit(item: any): void {
		const modalRef = this.modalService.open(ManagePlansDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.dataList = {
					rows: [],
					count: -1,
				};
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	view(item: any): void {
		const modalRef = this.modalService.open(ManagePlansViewComponent, {
			centered: true,
			size: 'sm',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
	openConfirmStatus(item) {
		let status = item.isPaid ? 'pending' : 'paid';
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.updateTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription} change payment status to ${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.changeStatus({
					id: item.id,
					userId: item.userId,
					isPaid: !item.isPaid,
				});
			},
			(dismiss) => {}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.subscriptionService.patch(item).subscribe({
			next: (result) => {
				this.dataList = {
					rows: [],
					count: -1,
				};
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
		this.planService.delete(item).subscribe({
			next: (result) => {
				this.dataList = {
					rows: [],
					count: -1,
				};
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
}
