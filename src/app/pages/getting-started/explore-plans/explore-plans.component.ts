import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientPlanService } from 'src/app/core/services/client-plan.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, planModulesFeatures, planStatus } from 'src/app/helpers';
import { ClientRequestPlanDetailsComponent } from '../client-request-plan-details/client-request-plan-details.component';
import { ExplorePlansViewComponent } from '../explore-plans-view/explore-plans-view.component';

@Component({
	selector: 'app-explore-plans',
	templateUrl: './explore-plans.component.html',
	styleUrls: ['./explore-plans.component.scss'],
})
export class ExplorePlansComponent implements OnInit {
	recommendedList: any = {
		rows: [],
		count: -1,
	};

	dataList: any = {
		rows: [],
		count: -1,
	};
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	selectedTab: boolean = false;
	defaultStatus = defaultStatus;
	planModulesFeatures = planModulesFeatures;

	constructor(
		private spinnerService: SpinnerService,
		private planService: PlanService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private router: Router,
		private clientPlanService: ClientPlanService
	) {}

	ngOnInit(): void {
		this.loadRecommendedData();
		this.loadData();
	}
	getPlanTitle(item) {
		return this.planModulesFeatures.find((e) => e.value === item.title);
	}
	loadRecommendedData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			status: planStatus.PUBLISHED,
			planType: 'standard',
			...filters,
		};
		this.spinnerService.start();
		this.planService.list(params).subscribe({
			next: (result) => {
				this.recommendedList['rows'] = [...new Set([...this.recommendedList['rows'], ...result.data['rows']])];
				this.collectionSize = result.data['count'];
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
			status: planStatus.PUBLISHED,
			...filters,
		};
		this.spinnerService.start();
		this.planService.getClientPlan(params).subscribe({
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
	requestPlan(): void {
		const modalRef = this.modalService.open(ClientRequestPlanDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.clientPlanService.refreshTable.next(true);
			},
			(dismiss) => {}
		);
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

	selectPlan(item): void {
		this.router.navigate([`/getting-started/${item.id}/buy-plan`]);
	}
	view(item: any): void {
		const modalRef = this.modalService.open(ExplorePlansViewComponent, {
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
}
