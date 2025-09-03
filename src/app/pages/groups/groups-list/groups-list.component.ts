import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from 'src/app/core/services/group.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { GroupsDetailsComponent } from '../groups-details/groups-details.component';

@Component({
	selector: 'app-groups-list',
	templateUrl: './groups-list.component.html',
	styleUrls: ['./groups-list.component.scss'],
})
export class GroupsListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Blocked', name: defaultStatus.BLOCKED },
	];
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Name',
			value: 'name',
			sorting: true,
		},
		{
			label: 'Status',
			value: '',
			sorting: true,
		},
		{
			label: 'Action',
			value: '',
			sorting: true,
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	OPTIONS = OPTIONS;

	constructor(
		config: NgbDropdownConfig,
		private modalService: NgbModal,
		private router: Router,
		private domSanitizer: DomSanitizer,
		private groupService: GroupService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
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
		this.groupService.list(params).subscribe({
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
			status: this.statusFilter,
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}
	clearFilter() {
		this.statusFilter = null;
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
		const modalRef = this.modalService.open(GroupsDetailsComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			}
		);
	}

	edit(item: any) {
		const modalRef = this.modalService.open(GroupsDetailsComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			}
		);
	}
	openConfirmStatus(item) {
		let status = item.status === defaultStatus.ACTIVE ? defaultStatus.BLOCKED : defaultStatus.ACTIVE;
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription}${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				this.changeStatus(item);
			}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.groupService.patch(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
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
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {},
			(dismiss) => {
				this.delete(item);
			}
		);
	}

	delete(item: any) {
		this.spinnerService.start();
		this.groupService.delete(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
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
}
