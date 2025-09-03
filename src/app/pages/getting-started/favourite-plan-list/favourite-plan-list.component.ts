import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavouritePlanService } from 'src/app/core/services/favourite-plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { confirmMessages, defaultStatus, planModulesFeatures } from 'src/app/helpers';
import { FavouritePlanDetailsComponent } from '../favourite-plan-details/favourite-plan-details.component';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { FavouritePlanViewComponent } from '../favourite-plan-view/favourite-plan-view.component';

@Component({
	selector: 'app-favourite-plan-list',
	templateUrl: './favourite-plan-list.component.html',
	styleUrls: ['./favourite-plan-list.component.scss'],
})
export class FavouritePlanListComponent implements OnInit {
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
	pageSize: number = 6;
	selectedTab: boolean = false;
	defaultStatus = defaultStatus;
	planModulesFeatures = planModulesFeatures;

	// planItemsList = planItems;
	@Output() planInfo = new EventEmitter<any>();
	constructor(
		private spinnerService: SpinnerService,
		private favouritePlanService: FavouritePlanService,
		private toastService: ToastService,
		private modalService: NgbModal
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	getPlanTitle(item) {
		return this.planModulesFeatures.find((e) => e.value === item.title);
	}

	getAmountPerVerification(item) {
		return item.favouritePlanFeatures.reduce((acc, curr) => acc + curr.price * curr.maxUploadNumber, 0);
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.favouritePlanService.list(params).subscribe({
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
		if (item?.favouritePlanFeatures.length >= 13) {
			return 'green';
		} else if (item.favouritePlanFeatures.length >= 6 && item.favouritePlanFeatures.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}

	requestPlan(): void {
		const modalRef = this.modalService.open(FavouritePlanDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
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
	edit(item: any) {
		const modalRef = this.modalService.open(FavouritePlanDetailsComponent, {
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
		this.favouritePlanService.delete(item).subscribe({
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
	view(item: any): void {
		const modalRef = this.modalService.open(FavouritePlanViewComponent, {
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
