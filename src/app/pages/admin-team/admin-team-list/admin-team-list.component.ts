import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbModal, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SystemUserService } from 'src/app/core/services/system-user.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS, ROLES } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { AdminTeamDetailsComponent } from '../admin-team-details/admin-team-details.component';
import { UserService } from 'src/app/core';

@Component({
	selector: 'app-admin-team-list',
	templateUrl: './admin-team-list.component.html',
	styleUrls: ['./admin-team-list.component.scss'],
})
export class AdminTeamListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Block', name: defaultStatus.BLOCKED },
	];
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
			label: 'Role',
			value: 'role',
			sorting: true,
		},
		{
			label: 'Clients Assigned',
			value: 'userClient',
			sorting: true,
		},
		{
			label: 'Status',
			value: 'status',
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
	OPTIONS = OPTIONS;
	statusFilter: string = 'all';
	searchTerm: string = '';
	defaultStatus = defaultStatus;
	rolesList: any = [ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.ON_BOARDER, ROLES.PROTO_LAWYER];
	selectedData = [];

	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		private modalService: NgbModal,
		config: NgbDropdownConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private systemUuser: SystemUserService,
		private userService: UserService
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
	}

	ngOnInit(): void {
		this.loadData();
	}
	customText(value) {
		return value ? value.replace('_', ' ').toLowerCase() : null;
	}

	getClientNames(item) {
		return item?.userClient.map((e) => e?.businessDetails?.registeredName).join(', ') || '-';
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.systemUuser.list(params).subscribe({
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
	onPageChange(event): void {
		this.page = event?.page;
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
		this.statusFilter = '';
		this.searchTerm = '';
		this.loadData();
	}
	applyFilters() {
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
		});
	}

	add() {
		const modalRef = this.modalService.open(AdminTeamDetailsComponent, {
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
		const modalRef = this.modalService.open(AdminTeamDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.memberId = item.id;
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				this.statusFilter = '';
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
		this.systemUuser.patch(item).subscribe({
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
		this.systemUuser.delete(item).subscribe({
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
			},
			(dismiss) => {}
		);
	}
}
