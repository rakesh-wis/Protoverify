import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS, ROLES } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { ChangeOrganizationComponent } from 'src/app/pages/employees/change-organization/change-organization.component';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';
import { User } from 'src/app/models';
import { UserService } from 'src/app/core';
import { Router } from '@angular/router';
import { EmployeeDocumentTemplateComponent } from '../employee-document-template/employee-document-template.component';
import { EmployeeChangeStatusComponent } from '../employee-change-status/employee-change-status.component';

@Component({
	selector: 'app-employee-list',
	templateUrl: './employee-list.component.html',
	styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'On boarded', name: defaultStatus.ON_BOARDED },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Block', name: defaultStatus.BLOCKED },
	];
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;

	dataList: any = {
		rows: [],
		count: -1,
	};
	roleList = [
		{
			label: 'Admin',
			value: ROLES.CLIENT_ADMIN,
		},
		{
			label: 'User',
			value: ROLES.CLIENT_USER,
		},
		{
			label: 'On boarder',
			value: ROLES.ON_BOARDER,
		},
		{
			label: 'Employee',
			value: ROLES.EMPLOYEE,
		},
	];
	statusFilter: string = 'all';
	searchTerm: string = '';
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	currentUser: User;
	adminRoles = ROLES.getAdminArray();
	isRoleAccess: boolean = false;
	defaultStatus = defaultStatus;
	OPTIONS = OPTIONS;

	constructor(
		private modalService: NgbModal,
		config: NgbDropdownConfig,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private employeeService: EmployeeService,
		private userService: UserService,
		private router: Router
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
		this.currentUser = this.userService.getCurrentUser();
		this.isRoleAccess = this.userService.switchRoleAccess();
	}

	ngOnInit(): void {
		this.loadData();
	}
	customStatus(value): string {
		return value.replaceAll('_', ' ');
	}
	getRole(role): string {
		return this.roleList.find((element) => element.value === role).label;
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.employeeService.list(params).subscribe({
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
		const modalRef = this.modalService.open(EmployeeDetailsComponent, {
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
		const modalRef = this.modalService.open(EmployeeDetailsComponent, {
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

	manage(item: any): void {
		this.router.navigate([`/employee/manage/`], {
			queryParams: { id: item.id },
		});
	}

	changeStatus(item: any) {
		const modalRef = this.modalService.open(EmployeeChangeStatusComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
				});
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
		this.employeeService.delete(item).subscribe({
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

	changeOrganization(item) {
		const modalRef = this.modalService.open(ChangeOrganizationComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.employeeData = item;
		modalRef.result.then(
			(result) => {
				this.searchTerm = '';
				this.statusFilter = '';
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	viewTemplate(item): void {
		this.router.navigate([`/employee/${item.id}/download-letter`]);
	}
}
