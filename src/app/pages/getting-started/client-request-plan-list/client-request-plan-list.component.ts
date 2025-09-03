import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientPlanService } from 'src/app/core/services/client-plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { confirmMessages, defaultStatus, planModulesFeatures, planStatus } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ClientRequestPlanDetailsComponent } from '../client-request-plan-details/client-request-plan-details.component';

@Component({
	selector: 'app-client-request-plan-list',
	templateUrl: './client-request-plan-list.component.html',
	styleUrls: ['./client-request-plan-list.component.scss'],
})
export class ClientRequestPlanListComponent implements OnInit {
	dataList: any = {
		rows: [],
		count: -1,
	};
	dataListStandardPlan: any = {
		rows: [],
		count: -1,
	};
	// defaultStatus = planStatus;
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;
	selectedTab: boolean = false;
	defaultStatus = defaultStatus;
	planModulesFeatures = planModulesFeatures;

	// planItemsList = planItems;
	@Output() planInfo = new EventEmitter<any>();
	constructor(
		private spinnerService: SpinnerService,
		private clientPlanService: ClientPlanService,
		private toastService: ToastService,
		private modalService: NgbModal
	) {
		this.clientPlanService.refreshTable.subscribe(() => {
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
	getPlanTitle(item) {
		return this.planModulesFeatures.find((e) => e.value === item.title);
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			status: [defaultStatus.PENDING, defaultStatus.REJECTED],
			...filters,
		};
		this.spinnerService.start();
		this.clientPlanService.list(params).subscribe({
			next: (result) => {
				this.dataList['rows'] = [...new Set([...this.dataList['rows'], ...result.data['rows']])];
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onPageChange(): void {
		this.page++;
		this.loadData();
	}

	getColor(item) {
		if (item?.userPlanRequestFeature.length >= 13) {
			return 'green';
		} else if (item.userPlanRequestFeature.length >= 6 && item.userPlanRequestFeature.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}

	requestPlan(): void {
		const modalRef = this.modalService.open(ClientRequestPlanDetailsComponent, {
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

	edit(item: any) {
		const modalRef = this.modalService.open(ClientRequestPlanDetailsComponent, {
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
		this.clientPlanService.delete(item).subscribe({
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
