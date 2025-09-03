import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientTeamsService } from 'src/app/core/services/client-teams.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ClientTeamDetailsComponent } from '../client-team-details/client-team-details.component';

@Component({
	selector: 'app-client-team-list',
	templateUrl: './client-team-list.component.html',
	styleUrls: ['./client-team-list.component.scss'],
})
export class ClientTeamListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Blocked', name: defaultStatus.BLOCKED },
	];
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Name',
			value: 'name',
			sorting: false,
		},
		{
			label: 'Number',
			value: 'number',
			sorting: false,
		},
		{
			label: 'Email',
			value: 'email',
			sorting: false,
		},
		{
			label: 'Designation',
			value: 'designation',
			sorting: false,
		},
		{
			label: 'Region',
			value: 'region',
			sorting: false,
		},
		{
			label: 'Site',
			value: 'sites',
			sorting: false,
		},
		{
			label: 'Access',
			value: 'access',
			sorting: false,
		},
		{
			label: 'Action',
			value: '',
			sorting: false,
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	siteList: any = [];
	statusFilter: string = 'all';
	searchTerm: string = '';
	defaultStatus = defaultStatus;
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		private modalService: NgbModal,
		config: NgbDropdownConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private clientTeamsService: ClientTeamsService,
		private sitesService: SitesService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadData();
	}
	customText(value) {
		return value ? value.replaceAll('_', ' ').toLowerCase() : null;
	}

	getSites(sites) {
		return sites.map((element) => `${element?.name}`);
	}
	getRegion(sites) {
		return [...new Set(sites.map((element) => element?.region.title))][0];
	}

	checkAccessManagement(item, access) {
		return !item.accessManagement.find((item) => item[access]);
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.clientTeamsService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
				let siteIds = this.dataList.rows
					.filter((e) => e.userAssociations.length > 0)
					.map((x) => x.userAssociations[0].sitesId);
				if (siteIds && siteIds.length > 0) {
					this.sitesService.selectedList({ id: siteIds }).subscribe({
						next: ({ data: siteList }) => {
							this.dataList.rows.forEach((element) => {
								element.sites = [];
								element.region = [];
								element.userAssociations.forEach((x) => {
									let site = siteList.find((s) => s.id === x.sitesId);
									element.sites.push(site.name);
									element.region.push(site.region.title);
								});
							});
						},
						error: (error) => {
							this.spinnerService.stop();
							this.toastService.error(error);
						},
					});
				}
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
	onPageChange($event: number, event: string): void {
		if (this.isPrevious() && event === 'prev') {
			return;
		} else if (event === 'next' && this.isLastPage()) {
			return;
		}
		this.page = $event;
		this.loadData({
			search: this.searchTerm,
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	clearFilter() {
		this.statusFilter = 'all';
		this.searchTerm = null;
		this.loadData();
	}
	applyFilters() {
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
		});
	}

	add() {
		const modalRef = this.modalService.open(ClientTeamDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				// this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	edit(item: any) {
		const modalRef = this.modalService.open(ClientTeamDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				// this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	toggleCheck($event, item) {
		this.openConfirmStatus(item, $event);
	}

	openConfirmStatus(item, $event) {
		let status = item.status === defaultStatus.ACTIVE ? 'block' : defaultStatus.ACTIVE;
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription}${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				item.status = item.status === defaultStatus.ACTIVE ? defaultStatus.BLOCKED : defaultStatus.ACTIVE;
				this.changeStatus(item);
			},
			(dismiss) => {
				if ($event) {
					$event.target.checked = !$event.target.checked;
				}
			}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.clientTeamsService.patch(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					// status: this.statusFilter,
				});
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
		this.clientTeamsService.delete(item).subscribe({
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
