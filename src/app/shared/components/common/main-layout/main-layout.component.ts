import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { result, tap } from 'lodash';
import { filter, distinctUntilChanged } from 'rxjs';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { UserService } from 'src/app/core/services/user.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import {
	gettingStarted,
	verificationList,
	ROLES,
	clientSideBarItems,
	adminSideBarItems,
	planFeatures,
	defaultStatus,
} from 'src/app/helpers';
import { SideBar } from 'src/app/models/shared.mode';
import { User } from 'src/app/models/user.model';

@Component({
	selector: 'app-main-layout',
	templateUrl: './main-layout.component.html',
	styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
	collapsedNav: boolean = true;
	mobileQuery: MediaQueryList;
	sideBarList: Array<SideBar> = [];
	public user: User;
	private _mobileQueryListener: () => void;
	private iconsList: string[] = [
		'getting-started',
		'dashboard',
		'employees',
		'sites',
		'vendors',
		'regularization',
		'teams',
		'configuration',
		'subscriptions',
		'help-center',
		'start-verification',
		'leave-management',
		'clients',
		'plans',
		'groups',
		'direct-verification',
	];
	currentUser: User;
	checkList = [];
	public userPlanItems = [];
	verificationList = verificationList;
	showGettingSubItem: boolean = false;
	currentPlan: any = [];
	ROLES = ROLES;
	constructor(
		changeDetectorRef: ChangeDetectorRef,
		media: MediaMatcher,
		private userService: UserService,
		public router: Router,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private activatedRoute: ActivatedRoute,
		private verificationDetailsService: VerificationDetailsService,
		private subscriptionService: SubscriptionService
	) {
		this.mobileQuery = media.matchMedia('(max-width: 600px)');
		this.collapsedNav = this.mobileQuery.matches;
		this._mobileQueryListener = () => changeDetectorRef.detectChanges();
		this.registerIcons();
		this.setSubMenuItem();
		this.subscriptionService.refreshSidebar.subscribe((data) => {
			if (data) {
				this.getCurrentSubscription();
			}
		});
	}

	setSubMenuItem() {
		this.router.events
			.pipe(
				filter((event: any) => event instanceof NavigationEnd),
				distinctUntilChanged()
			)
			.subscribe((data) => {
				let regexDirect = /^\/direct-verification\/\d*\/[a-z]+[-][a-z]+/;
				let regexStart = /^\/start-verification\/\d*\/[a-z]+[-][a-z]+/;
				// if (
				// 	[
				// 		'/getting-started',
				// 		'/getting-started/on-board',
				// 		'/getting-started/account-setup',
				// 		'/getting-started/explore-plans',
				// 	].includes(data.url)
				// ) {
				// 	this.showGettingSubItem = true;
				// 	this.checkList = gettingStarted;
				// 	let checkItem = this.checkList.find((e) => `/${e.path}` === data.url);
				// 	if (checkItem) {
				// 		this.checkList.forEach((element, index) =>
				// 			index < checkItem.score ? (element.checked = true) : (element.checked = false)
				// 		);
				// 	}
				// } else
				if (data.url.match(new RegExp(regexDirect)) || data.url.match(new RegExp(regexStart))) {
					this.getVerifiedList();
					this.showGettingSubItem = true;
				} else {
					this.checkList = [];
					this.showGettingSubItem = false;
				}
			});
	}

	ngOnInit(): void {
		this.userService.currentUser.subscribe((data) => {
			this.currentUser = data;
			this.setSideBar();
			// if (
			// 	![ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_LAWYER].includes(
			// 		this.currentUser.role
			// 	) ||
			// 	window.sessionStorage.getItem('clientId')
			// ) {
			// 	this.getCurrentSubscription();
			// } else {
			this.getVerifiedList();
			// }
		});
	}

	setSideBar() {
		if (
			window.sessionStorage.getItem('clientId') &&
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_LAWYER].includes(
				this.currentUser.role
			)
		) {
			this.sideBarList = clientSideBarItems;
		} else if (
			[
				ROLES.PROTO_SUPER_ADMIN,
				ROLES.PROTO_ADMIN,
				ROLES.PROTO_USER,
				ROLES.PROTO_LAWYER,
				ROLES.PROTO_OPERATION,
			].includes(this.currentUser.role)
		) {
			this.sideBarList = adminSideBarItems;
		} else {
			this.sideBarList = clientSideBarItems;
		}
	}

	getCurrentSubscription(): void {
		this.subscriptionService.getCurrentPlan().subscribe({
			next: (result) => {
				this.currentPlan = result.data;
				if (this.currentPlan) {
					this.currentPlan.map((e) => this.userPlanItems.push(e.features));
					this.subscriptionService.setPlan(this.currentPlan);
					this.getVerifiedList();
				}
			},
		});
	}

	viewSideBarItem(item): boolean {
		if (
			![
				ROLES.PROTO_SUPER_ADMIN,
				ROLES.PROTO_ADMIN,
				ROLES.PROTO_USER,
				ROLES.PROTO_LAWYER,
				ROLES.PROTO_OPERATION,
			].includes(this.currentUser.role) ||
			window.sessionStorage.getItem('clientId')
		) {
			// if (this.currentPlan && this.currentPlan.length > 0 && item.value) {
			if (this.currentUser.role === ROLES.EMPLOYEE) {
				if (item.path === 'start-verification') {
					return true;
				}
				return false;
			} else if (['sites', 'verification', 'billing', 'client_teams', 'vendors'].includes(item.value)) {
				return true;
			} else if (item.value && !['vendors', 'employee', 'configuration'].includes(item.value)) {
				return this.userPlanItems.includes(item.value);
			}
			// }
			if (item.path === 'getting-started') {
				if (
					[ROLES.CLIENT_SUPER_ADMIN].includes(this.currentUser.role) ||
					window.sessionStorage.getItem('clientId')
				) {
					if (item.path === 'getting-started') {
						return true;
					}
				} else {
					return false;
				}
			}

			return item.value ? false : true;
		} else {
			if (this.currentUser.role === ROLES.PROTO_LAWYER) {
				if (item.path != 'direct-verification') {
					return false;
				}
				return true;
			} else if (!['dashboard', 'help-center'].includes(item.path)) {
				let index = this.checkAccess(item.path);
				if (index > -1) {
					return this.currentUser.accessManagement[index]['view'];
				}
				return false;
			}
			return true;
		}
	}

	disableItems(item): boolean {
		if (
			![
				ROLES.PROTO_SUPER_ADMIN,
				ROLES.PROTO_ADMIN,
				ROLES.PROTO_USER,
				ROLES.PROTO_LAWYER,
				ROLES.PROTO_OPERATION,
			].includes(this.currentUser.role)
		) {
			if (this.currentUser.status != defaultStatus.ON_BOARDED) {
				return false;
			}
			return true;
		}
		return false;
	}

	checkAccess(path: string): number {
		switch (path) {
			case 'manage-plans':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'plan_management');
			case 'clients':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'client_management');
			case 'employee':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'employee_management');
			case 'groups':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'groups_management');
			case 'admins':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'admin_management');
			case 'direct-verification':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'verification_management');
			case 'vendors':
				return this.currentUser.accessManagement.findIndex((e) => e.type === 'vendor_management');
			default:
				return 0;
		}
	}

	getRoleAccess(nav) {
		if (
			window.sessionStorage.getItem('clientId') &&
			nav.role.every((element) => ROLES.getClientArray(true).includes(element)) &&
			[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER, ROLES.PROTO_LAWYER].includes(
				this.currentUser.role
			)
		) {
			return true;
		} else if (nav.role.includes(this.currentUser?.role)) {
			return true;
		}
		return false;
	}

	getVerifiedList(): void {
		let params = {
			userId: this.activatedRoute.snapshot.queryParams['id'],
		};
		if (params.userId) {
			this.verificationDetailsService.verificationList(params).subscribe({
				next: (result) => {
					let verifiedList = result.data;
					if (this.currentUser.role === ROLES.EMPLOYEE) {
						verifiedList = verifiedList.filter(
							(e) =>
								![
									'user_based_onboarder',
									planFeatures.COURT_CHECK,
									// planFeatures.PHYSICAL_VERIFICATION,
									planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
									planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
									planFeatures.GLOBAL_DATABASE_CHECK,
									planFeatures.CIBIL,
									planFeatures.DIRECTORSHIP_TEST,
									planFeatures.DRUG_TEST,
									planFeatures.SOCIAL_MEDIA_CHECK,
									planFeatures.OFAC_CHECK,
								].includes(e.value)
						);
					}
					this.verificationDetailsService.setVerificationList(verifiedList);
					this.checkList = verifiedList;
				},
			});
		}
	}

	setUser(): void {
		this.user = this.userService.getCurrentUser();
	}

	toggleSideBar($event: any): void {
		this.collapsedNav = $event;
	}

	linkActive(url: string) {
		return this.router.url.includes(url) ? 'is-active' : '';
	}

	ngOnDestroy(): void {
		this.mobileQuery.removeListener(this._mobileQueryListener);
	}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
	navigateTo(path: string): void {
		if (this.currentUser.role === ROLES.EMPLOYEE && path === 'help-center') {
			this.router.navigate([path]);
		} else if (this.currentUser.role === ROLES.EMPLOYEE && path === 'start-verification') {
			this.router.navigate([`/start-verification/${this.currentUser.id}/aadhar-card`], {
				queryParams: { id: this.currentUser.id, name: this.currentUser.name },
			});
		} else {
			this.router.navigate([path]);
		}
	}
}
