import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VendorService } from 'src/app/core/services/vendor.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { VendorDetailsComponent } from '../vendor-details/vendor-details.component';
import { VendorLinkGenerateComponent } from '../vendor-link-generate/vendor-link-generate.component';

@Component({
	selector: 'app-vendor-list',
	templateUrl: './vendor-list.component.html',
	styleUrls: ['./vendor-list.component.scss'],
})
export class VendorListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'Pending', name: defaultStatus.PENDING },
		{ label: 'Approved', name: defaultStatus.APPROVED },
	];
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
			label: 'Number',
			value: 'number',
			sorting: true,
		},
		{
			label: 'Email',
			value: 'email',
			sorting: true,
		},
		{
			label: 'Designation',
			value: 'designation',
			sorting: true,
		},
		{
			label: 'Company Name',
			value: 'companyName',
			sorting: true,
		},
		{
			label: 'Action',
			value: '',
			sorting: true,
		},
	];
	dataList: any = {
		data: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	queryFilterName: string = '';
	defaultStatus = defaultStatus;
	OPTIONS = OPTIONS;
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		private modalService: NgbModal,
		config: NgbDropdownConfig,
		private vendorService: VendorService,
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
		this.vendorService.list(params).subscribe({
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
	changeQueryFilterName() {
		if (this.searchTerm.length > 0) {
			this.loadData({
				search: this.searchTerm,
				status: this.statusFilter,
			});
		}
	}
	applyFilters() {
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
		});
	}

	add() {
		const modalRef = this.modalService.open(VendorDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	edit(item: any) {
		const modalRef = this.modalService.open(VendorDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	generateLink(item: any) {
		const modalRef = this.modalService.open(VendorLinkGenerateComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	openConfirmStatus(item) {
		let status = item.status === defaultStatus.ACTIVE ? defaultStatus.BLOCKED : defaultStatus.ACTIVE;
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
			(dismiss) => {}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.vendorService.patch(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
					queryFilterName: this.queryFilterName,
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
		this.vendorService.delete(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
					queryFilterName: this.queryFilterName,
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

	sendEmail(item: any) {
		this.spinnerService.start();
		this.vendorService.sendEmail(item.id).subscribe({
			next: (result) => {
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
