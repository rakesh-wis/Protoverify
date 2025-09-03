import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { ClientService } from 'src/app/core/services/client.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ClientsAddComponent } from '../clients-add/clients-add.component';
import { FormControl, FormGroup } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
	selector: 'app-clients-list',
	templateUrl: './clients-list.component.html',
	styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'On boarded', name: defaultStatus.ON_BOARDED },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Block', name: defaultStatus.BLOCKED },
		{ label: 'Disapproved', name: defaultStatus.DISAPPROVED },
	];
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: '',
			value: '',
			sorting: false,
		},
		{
			label: 'Client Name',
			value: 'name',
			sorting: true,
		},
		{
			label: 'Organization Name',
			value: 'registeredName',
			sorting: true,
		},
		{
			label: 'Payment Type',
			value: 'connectionType',
			sorting: true,
		},
		{
			label: 'Created At',
			value: 'createdAt',
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
	dataList: any = {};
	filterForm = new FormGroup({
		search: new FormControl(),
		status: new FormControl('all'),
		startDate: new FormControl(),
		endDate: new FormControl(),
	});
	OPTIONS = OPTIONS;
	selectedData = [];
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		config: NgbDropdownConfig,
		private clientService: ClientService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private userService: UserService,
		private modalService: NgbModal,
		private router: Router,
		private clipboard: Clipboard
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadData();
	}
	customStatus(value) {
		return value.replace('_', ' ');
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
			...this.filterForm.getRawValue(),
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.selectedData = [];
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

	onPageChange(event): void {
		this.page = event?.page;
		this.loadData();
	}

	clearFilter() {
		this.filterForm.reset();
		this.filterForm.get('status').setValue('all');
		this.loadData();
	}

	applyFilters() {
		this.loadData();
	}
	add(): void {
		const modalRef = this.modalService.open(ClientsAddComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.clearFilter();
			},
			(dismiss) => {}
		);
	}
	edit(item: any) {
		const modalRef = this.modalService.open(ClientsAddComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.clearFilter();
			},
			(dismiss) => {}
		);
	}
	view(item: any): void {
		this.router.navigate(['/clients/view'], { queryParams: { id: item.id } });
	}

	toggleCheck($event, item) {
		if ($event.target.checked) {
			this.openConfirmStatus(item, defaultStatus.ACTIVE, $event);
		} else {
			this.openConfirmStatus(item, defaultStatus.BLOCKED, $event);
		}
	}

	openConfirmStatus(item, status: string, $event) {
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
				this.changeStatus(item.id, status);
			},
			(dismiss) => {
				if ($event) {
					$event.target.checked = !$event.target.checked;
				}
			}
		);
	}

	changeStatus(id, status) {
		const url = `/admin/user/${id}`;
		this.spinnerService.start();
		this.userService.patchStatus({ status }, url).subscribe({
			next: (result) => {
				this.clearFilter();
				this.clientService.refreshTable.next(true);
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
		const url = `/admin/user/${item.id}`;
		this.spinnerService.start();
		this.userService.delete(url).subscribe({
			next: (result) => {
				this.clearFilter();
				this.clientService.refreshTable.next(true);
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	getOrGenerateAPIKey(index: number) {
		this.spinnerService.start();
		this.clientService.getOrGenerateAPIKey(this.dataList['rows'][index].id).subscribe({
			next: (result) => {
				this.dataList['rows'][index].isAPIKeyGenerated = true;
				this.spinnerService.stop();
				this.clipboard.copy(result.data);
				this.toastService.success('Copied API KEY');
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	addAndRemove($event, item) {
		if (!$event.target.checked) {
			this.selectedData.splice(
				this.selectedData.findIndex((e) => e.id === item.id),
				1
			);
		} else {
			this.selectedData.push(item);
		}
	}

	openConfirmBulkDelete() {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription}?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				const url = `/admin/user/bulk-delete`;
				this.spinnerService.start();
				this.userService.patchStatus({ ids: this.selectedData.map((e) => e.id) }, url).subscribe({
					next: (result) => {
						this.selectedData = [];
						this.clearFilter();
						this.clientService.refreshTable.next(true);
						this.spinnerService.stop();
						this.toastService.success(result.message);
					},
					error: (error) => {
						this.spinnerService.stop();
						this.toastService.error(error);
					},
				});
			},
			(dismiss) => {}
		);
	}
}
