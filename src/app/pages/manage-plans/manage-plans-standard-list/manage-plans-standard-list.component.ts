import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
	confirmMessages,
	defaultStatus,
	planFeatures,
	planModules,
	planModulesFeatures,
	planStatus,
} from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ManagePlansDetailsComponent } from '../manage-plans-details/manage-plans-details.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ManagePlansViewComponent } from '../manage-plans-view/manage-plans-view.component';

@Component({
	selector: 'app-manage-plans-standard-list',
	templateUrl: './manage-plans-standard-list.component.html',
	styleUrls: ['./manage-plans-standard-list.component.scss'],
})
export class ManagePlansStandardListComponent implements OnInit {
	dataList: any = {
		rows: [],
		count: -1,
	};
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Plan Title',
			value: 'title',
			sorting: false,
		},
		{
			label: 'Plan Created on',
			value: 'createdAt',
			sorting: false,
		},
		{
			label: 'Cost per Verification',
			value: 'status',
			sorting: false,
		},
		{
			label: 'Action',
			value: '',
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
	constructor(
		private modalService: NgbModal,
		private planService: PlanService,
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
			planType: 'standard',
			...filters,
		};
		this.spinnerService.start();
		this.planService.list(params).subscribe({
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
