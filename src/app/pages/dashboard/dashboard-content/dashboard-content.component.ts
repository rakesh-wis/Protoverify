import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core';
import { ROLES } from 'src/app/helpers';
import { User } from 'src/app/models';

@Component({
	selector: 'app-dashboard-content',
	templateUrl: './dashboard-content.component.html',
	styleUrls: ['./dashboard-content.component.scss'],
})
export class DashboardContentComponent implements OnInit {
	currentUser: User;
	ROLES = ROLES;
	hasAdminRoleAccess: boolean = false;
	constructor(private userService: UserService) {}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.hasAdminRoleAccess =
			ROLES.getAdminArray().includes(this.currentUser.role) && !sessionStorage.getItem('clientId');
	}
}
