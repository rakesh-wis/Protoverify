import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAccordionConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManagePlansDetailsComponent } from './manage-plans-details/manage-plans-details.component';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientService } from 'src/app/core/services/client.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus } from 'src/app/helpers';
import { ManagePlansListComponent } from './manage-plans-list/manage-plans-list.component';
import { ManagePlanRequestListComponent } from './manage-plan-request-list/manage-plan-request-list.component';

@Component({
	selector: 'app-manage-plans',
	templateUrl: './manage-plans.component.html',
	styleUrls: ['./manage-plans.component.scss'],
})
export class ManagePlansComponent implements OnInit {
	filterForm = new FormGroup({
		search: new FormControl(''),
		selectedOrganization: new FormControl(''),
	});
	pageClient: number = 1;
	pageSizeClient: number = 20;
	collectionSizeClient: number = 0;
	organizationList: any = [];
	@ViewChild('requestPlanListComponent', { static: false }) requestPlanListComponent: ManagePlanRequestListComponent;
	@ViewChild('planListComponent', { static: false }) planListComponent: ManagePlansListComponent;
	constructor(
		config: NgbAccordionConfig,
		private modalService: NgbModal,
		private router: Router,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientService: ClientService
	) {
		config.closeOthers = true;
	}
	selectedTab: string = 'requested-plan';

	ngOnInit(): void {
		this.getClientList();
	}

	getClientList(filter = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSizeClient,
			limit: this.pageSizeClient,
			status: defaultStatus.ACTIVE,
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = result.data;
				this.collectionSizeClient = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchClient($event) {
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (this.organizationList.rows.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClientList();
	}
	add(): void {
		const modalRef = this.modalService.open(ManagePlansDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
	clearFormField() {
		this.filterForm.reset();
	}
	clearFilter() {
		this.clearFormField();
		if (this.selectedTab === 'requested-plan') {
			this.requestPlanListComponent.clearFilter();
		} else {
			this.planListComponent.clearFilter();
		}
	}
	applyFilters() {
		if (this.selectedTab === 'requested-plan') {
			this.requestPlanListComponent.applyFilters(this.filterForm.getRawValue());
		} else {
			this.planListComponent.applyFilters(this.filterForm.getRawValue());
		}
	}
	navigateToRequestPlans() {
		this.router.navigateByUrl('manage-plans/request-list');
	}
}
