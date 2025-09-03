import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { defaultStatus, verificationStatus } from '../../helpers';
import { SpinnerService } from '../../core/services/spinner.service';
import { ClientService } from 'src/app/core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-admin-billing',
	templateUrl: './admin-billing.component.html',
	styleUrl: './admin-billing.component.scss',
})
export class AdminBillingComponent implements OnInit {
	filterForm = new FormGroup({
		search: new FormControl(''),
		associateId: new FormControl([]),
	});
	selectedTab: string = 'invoice';
	pageClient: number = 1;
	pageSizeClient: number = 20;
	collectionSizeClient: number = 0;
	organizationList: any = [];
	verificationStatus = verificationStatus;

	constructor(
		private clientService: ClientService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.getClientList();
		this.route.fragment.subscribe((fragment) => {
			if (fragment) {
				this.selectedTab = fragment;
				this.scrollToFragment(fragment);
			}
		});
	}
	scrollToFragment(fragment: string): void {
		const element = document.getElementById(fragment);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	clearFilter() {
		this.filterForm.get('search').setValue(null);
		this.filterForm.get('associateId').setValue([]);
	}

	applyFilters() {}

	getClientList(filter = {}) {
		let params = {
			start: (this.pageClient - 1) * this.pageSizeClient,
			limit: this.pageSizeClient,
			status: defaultStatus.ACTIVE,
			column: 'registeredName',
			direction: 'asc',
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				this.organizationList.map(
					(e) => (e['registeredName'] = e.businessDetails?.registeredName || e?.registeredName)
				);
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
		this.organizationList = [];
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (this.organizationList.length === this.collectionSizeClient) {
			return;
		}
		this.pageClient++;
		this.getClientList();
	}
}
