import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { take, tap } from 'rxjs/operators';
import { ROLES } from 'src/app/helpers';
import { PermissionManagerService } from './permission-manager.service';
import { VerificationDetailsService } from './verification-details.service';

@Injectable()
export class AuthGuard {
	currentUser: any = {};
	constructor(
		private router: Router,
		private userService: UserService,
		private permissionManagerService: PermissionManagerService,
		private verificationDetailsService: VerificationDetailsService
	) {}
	// canLoad() {
	//   return true;
	// }
	canLoad(route: Route, segemets: UrlSegment[]): Observable<boolean> {
		return this.userService.isAuthenticated.pipe(
			take(1),
			tap((allowed) => {
				if (!allowed) {
					let returnUrl = segemets[0].path;
					this.clearTokens();
					this.router.navigate(['/login'], { queryParams: { returnUrl } });
					return false;
				} else {
					this.currentUser = this.userService.getCurrentUser();
					if (this.currentUser) {
						if (route.data && route?.data['role'] && route.data['role'].length) {
							if (
								this.currentUser.role === ROLES.PROTO_LAWYER &&
								['dashboard', 'manage-plans', 'clients', 'employee', 'groups', 'admins'].includes(
									route.path
								)
							) {
								this.clearTokens();
								this.router.navigate(['/login']);
								return false;
							} else if (
								this.currentUser.role === ROLES.EMPLOYEE &&
								[
									'dashboard',
									'manage-plans',
									'clients',
									'employee',
									'groups',
									'admins',
									'direct-verification',
									'billing',
									'wallet',
									'getting-started',
									'locations',
									'client-teams',
								].includes(route.path)
							) {
								this.router.navigate([`/start-verification/${this.currentUser['id']}/aadhar-card`], {
									queryParams: { id: this.currentUser['id'], name: this.currentUser['name'] },
								});
								return false;
							} else if (
								[
									'manage-plans',
									'clients',
									'employee',
									'groups',
									'admins',
									'direct-verification',
								].includes(route.path) &&
								ROLES.getAdminArray().includes(this.currentUser.role) &&
								!sessionStorage.getItem('clientId')
							) {
								const index = this.permissionManagerService.getActivePagePermissionIndex(route.path);
								if (index > -1 && this.currentUser.accessManagement[index]['view']) {
									return true;
								}
								this.clearTokens();
								this.router.navigate(['/login']);
								return false;
							}
							return true;
						}
						this.clearTokens();
						this.router.navigate(['/login']);
						return false;
					} else {
						this.clearTokens();
						this.router.navigate(['/login']);
						return false;
					}
				}
			})
		);
	}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
		return this.userService.isAuthenticated.pipe(
			tap(),
			tap((allowed) => {
				if (!allowed) {
					let returnUrl = state.url;
					this.router.navigate(['login'], { queryParams: { returnUrl } });
				} else {
					if (route.data['role'] && route.data['role'].length) {
						if (this.currentUser.role === ROLES.PROTO_SUPER_ADMIN) return true;
						let roles = route.data['role'];
						let isGranted = roles.includes(this.currentUser.role);
						if (isGranted) {
							return true;
						}
						if (this.currentUser.role === ROLES.EMPLOYEE && ['dashboard'].includes(this.router.url)) {
							this.verificationDetailsService.navigateToNext('start', '', this.currentUser);
							return false;
						}
						this.clearTokens();
						this.router.navigate(['/login']);
						return false;
					}
				}
				return true;
			})
		);
	}

	clearTokens() {
		this.userService.purgeAuth();
		window.sessionStorage.removeItem('clientId');
	}
}
