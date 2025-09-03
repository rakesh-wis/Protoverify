import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientPlanService } from 'src/app/core/services/client-plan.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { OPTIONS, confirmMessages, defaultStatus } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ManagePlanRequestDetailsComponent } from '../manage-plan-request-details/manage-plan-request-details.component';
import { ManagePlansDetailsComponent } from '../manage-plans-details/manage-plans-details.component';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
	selector: 'app-manage-plan-request-list',
	templateUrl: './manage-plan-request-list.component.html',
	styleUrls: ['./manage-plan-request-list.component.scss'],
})
export class ManagePlanRequestListComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;

	dataList: any = {
		rows: [],
		count: 3,
	};
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Company Name',
			value: 'companyName',
			sorting: false,
		},
		{
			label: 'Title',
			value: 'title',
			sorting: false,
		},
		{
			label: 'Plan Created on',
			value: 'createdAt',
			sorting: false,
		},
		{
			label: 'Number of Cases',
			value: 'validTill',
			sorting: false,
		},
		{
			label: '',
			value: '',
			sorting: false,
		},
	];
	defaultStatus = defaultStatus;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	filterForm = new FormGroup({
		search: new FormControl(''),
		selectedOrganization: new FormControl(''),
	});
	OPTIONS = OPTIONS;
	constructor(
		config: NgbDropdownConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientPlanService: ClientPlanService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

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
		this.clientPlanService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				console.log(this.dataList);
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
	onPageChange(event): void {
		this.page = event?.page;
		this.loadData();
	}
	view(item, canEdit) {
		const modalRef = this.modalService.open(ManagePlanRequestDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.componentInstance.canEdit = canEdit;
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	openConfirmReject(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription} reject?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.changeStatus({ id: item.id, status: defaultStatus.REJECTED });
			},
			(dismiss) => {}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.clientPlanService.reject(item).subscribe({
			next: (result) => {
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
