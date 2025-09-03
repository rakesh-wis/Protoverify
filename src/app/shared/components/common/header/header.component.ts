import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { ClientService } from 'src/app/core/services/client.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { defaultStatus, ROLES } from 'src/app/helpers';
import { User } from 'src/app/models';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
	@Output() collapsedEvent = new EventEmitter();
	@Input() collapsedNav: boolean = false;
	@Input() currentUser: User;

	organizationList: any = [];
	role = ROLES;
	collectionSize: number = 0;
	page: number = 1;
	pageSize: number = 10;
	selectedClient: any = { id: 0, name: 'Protoverify' };
	isRoleAccess: boolean = false;
	organizationName: string;
	user: any;
	constructor(
		private userService: UserService,
		private router: Router,
		private spinnerService: SpinnerService,
		private clientService: ClientService,
		private toastService: ToastService
	) {
		this.clientService.refreshTable.subscribe((result) => {
			if (this.isRoleAccess) {
				this.page = 1;
				this.organizationList = [];
				this.collectionSize = 0;
				this.getClientList();
			}
		});
	}

	ngOnInit(): void {
		this.isRoleAccess = this.userService.switchRoleAccess();
		this.user = this.userService.getCurrentUser();
		if (this.user.role === ROLES.CLIENT_SUPER_ADMIN) {
			this.organizationName = this.user.businessDetails.registeredName;
		} else if (ROLES.getClientArray(false).includes(this.user.role)) {
			this.organizationName = this.user?.associated?.businessDetails?.registeredName;
		}
		if (this.isRoleAccess) {
			this.getClientList();
		}
	}

	toggleSideBar(): void {
		this.collapsedEvent.emit(!this.collapsedNav);
	}

	logout(): void {
		this.userService.purgeAuth();
		window.sessionStorage.removeItem('clientId');
		let path = '/login';
		if (this.currentUser?.role === ROLES.PROTO_SUPER_ADMIN) path = '/admin-login';
		this.router.navigate([path]);
	}

	getClientList(filter = {}) {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			status: defaultStatus.ACTIVE,
			column: 'registeredName',
			direction: 'asc',
			...(window.sessionStorage.getItem('clientId') && { id: window.sessionStorage.getItem('clientId') }),
			...filter,
		};
		this.spinnerService.start();
		this.clientService.list(params).subscribe({
			next: (result) => {
				this.organizationList = [...this.organizationList, ...result.data['rows']];
				this.organizationList.map(
					(e) => (e['registeredName'] = e.businessDetails?.registeredName || e?.registeredName)
				);
				this.collectionSize = result.data['count'];
				if (this.page === 1) {
					this.organizationList.unshift({ id: null, name: 'Protoverify', registeredName: 'Protoverify' });
					let client = null;
					if (window.sessionStorage.getItem('clientId')) {
						client = result.data?.rows.find(
							(element) =>
								element.id && element.id.toString() === window.sessionStorage.getItem('clientId')
						);
					}
					this.selectedClient = client
						? client
						: { id: null, name: 'Protoverify', registeredName: 'Protoverify' };
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	onSearch($event) {
		this.page = 1;
		this.organizationList = [];
		this.collectionSize = 0;
		this.getClientList({ search: $event.term });
	}
	onScrollClient() {
		if (
			this.organizationList.length - (window.sessionStorage.getItem('clientId') ? 2 : 1) ===
			this.collectionSize
		) {
			return;
		}
		this.page++;
		this.getClientList();
	}

	changeClient($event): void {
		if ($event.id) {
			window.sessionStorage['clientId'] = $event.id;
		} else {
			window.sessionStorage.removeItem('clientId');
		}
		this.router.navigate(['/dashboard'], { replaceUrl: true }).then(() => {
			window.location.reload();
			this.toastService.success(`Switch to ${$event.registeredName} successfully`);
		});
	}
}
