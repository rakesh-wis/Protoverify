import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { PermissionType, ROLES } from 'src/app/helpers';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class PermissionManagerService {
	constructor(private userService: UserService, private router: Router, private activatedRoute: ActivatedRoute) {}

	isGranted(permission: PermissionType) {
		let activePage = '';
		activePage = this.router.url.split('/')[1];
		const index = this.getActivePagePermissionIndex(activePage);
		const currentUser = this.userService.getCurrentUser();
		if (
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_OPERATION].includes(
				currentUser.role
			) &&
			!sessionStorage.getItem('clientId')
		) {
			if (index > -1) {
				return currentUser.accessManagement[index][permission.toLowerCase()];
			}
			return false;
		}
		if (
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_OPERATION].includes(
				currentUser.role
			) &&
			sessionStorage.getItem('clientId')
		) {
			if (index > -1) {
				return currentUser.accessManagement[index][permission.toLowerCase()];
			}
			return false;
		} else if ([ROLES.CLIENT_SUPER_ADMIN].includes(currentUser.role)) {
			return true;
		} else if ([ROLES.PROTO_LAWYER].includes(currentUser.role)) {
			if (index > -1) {
				return currentUser.accessManagement[index][permission.toLowerCase()];
			}
			return false;
		} else if (ROLES.getClientArray(false).includes(currentUser.role)) {
			if (index > -1) {
				return currentUser.accessManagement[index][permission.toLowerCase()];
			}
		} else {
			return false;
		}
	}

	getActivePagePermissionIndex(activeRoute) {
		const currentUser = this.userService.getCurrentUser();
		let index = -1;
		if (activeRoute === 'manage-plans') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'plan_management');
		} else if (activeRoute === 'clients') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'client_management');
		} else if (activeRoute === 'employee') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'employee_management');
		} else if (activeRoute === 'groups') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'groups_management');
		} else if (activeRoute === 'admins') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'admin_management');
		} else if (activeRoute === 'direct-verification') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'verification_management');
		} else if (activeRoute === 'start-verification') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'verification_management');
		} else if (activeRoute === 'vendors') {
			index = currentUser.accessManagement.findIndex((o) => o.type === 'vendor_management');
		}
		return index;
	}
}
