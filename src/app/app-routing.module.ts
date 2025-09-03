import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core';
import { OPTIONS, ROLES } from './helpers';
import { AdminLoginComponent } from './pages/auth/admin-login/admin-login.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { VerifyAdminMobileComponent } from './pages/auth/verify-admin-mobile/verify-admin-mobile.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';
import { VerifyMobileComponent } from './pages/auth/verify-mobile/verify-mobile.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { MainLayoutComponent } from './shared/components/common/main-layout/main-layout.component';
import { NotfoundComponent } from './shared/components/common/notfound/notfound.component';
import { PhysicalVerificationComponent } from './pages/verification/physical-verification/physical-verification.component';
import { ThirdPartyPhysicalVerificationComponent } from './pages/third-party-verification/third-party-physical-verification/third-party-physical-verification.component';
import { ThirdPartyPastEmploymentVerificationComponent } from './pages/third-party-verification/third-party-past-employment-verification/third-party-past-employment-verification.component';
import { ThirdPartyVerificationReferenceCheckComponent } from './pages/third-party-verification/third-party-verification-reference-check/third-party-verification-reference-check.component';
import { EmployeeTermsAndConditionsComponent } from './pages/employee-terms-and-conditions/employee-terms-and-conditions.component';
import { ThirdPartyPermanentAddressVerificationComponent } from './pages/third-party-verification/third-party-permanent-address-verification/third-party-permanent-address-verification.component';

const routes: Routes = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{
		path: 'admin-login',
		data: { title: 'Protoverify Admin Login' },
		component: AdminLoginComponent,
	},
	{ path: 'terms-and-conditions', data: { title: 'Terms & Conditions' }, component: TermsConditionsComponent },
	{ path: 'login', data: { title: 'Login' }, component: LoginComponent },
	{ path: 'signup', data: { title: 'Sign up' }, component: SignupComponent },
	{
		path: ':phone/verify-admin-mobile',
		data: { title: 'Verify-Admin-mobile' },
		component: VerifyAdminMobileComponent,
	},
	{
		path: ':phone/verify-mobile',
		data: { title: 'Verify-mobile' },
		component: VerifyMobileComponent,
	},
	{
		path: 'verify-email',
		data: { title: 'Verify-email' },
		component: VerifyEmailComponent,
	},
	{
		path: 'verification/:token/physical-verification',
		data: { title: 'Current Address Physical Verification' },
		component: ThirdPartyPhysicalVerificationComponent,
	},
	{
		path: 'verification/:token/permanent-address',
		data: { title: 'Permanent Address Physical Verification' },
		component: ThirdPartyPermanentAddressVerificationComponent,
	},
	{
		path: 'verification/:token/past-employment-verification',
		data: { title: 'Past Employment Verification' },
		component: ThirdPartyPastEmploymentVerificationComponent,
	},
	{
		path: 'verification/:token/reference-check-verification',
		data: { title: 'Reference Check Verification' },
		component: ThirdPartyVerificationReferenceCheckComponent,
	},
	{
		path: '',
		component: MainLayoutComponent,
		children: [
			{
				path: 'profile',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Profile',
					role: ROLES.getWebArray(),
				},
				loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfileModule),
			},
			{
				path: 'dashboard',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Dashboard',
					role: ROLES.getWebArray(),
				},
				loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
			},
			{
				path: 'wallet',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Wallet',
					role: ROLES.getWebArray(),
				},
				loadChildren: () => import('./pages/wallet/wallet.module').then((m) => m.WalletModule),
			},
			{
				path: 'billing',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Transaction',
					role: ROLES.getWebArray(),
				},
				loadChildren: () => import('./pages/billing/billing.module').then((m) => m.BillingModule),
			},
			{
				path: 'admin-billing',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Billing',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () =>
					import('./pages/admin-billing/admin-billing.module').then((m) => m.AdminBillingModule),
			},
			{
				path: 'getting-started',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Getting Started',
					role: ROLES.getClientArray(true),
				},
				loadChildren: () =>
					import('./pages/getting-started/getting-started.module').then((m) => m.GettingStartedModule),
			},
			{
				path: 'clients',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Clients',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/clients/clients.module').then((m) => m.ClientsModule),
			},
			{
				path: 'employee',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Employee',
					role: ROLES.getWebArray(),
				},
				loadChildren: () => import('./pages/employees/employees.module').then((m) => m.EmployeesModule),
			},
			// {
			// 	path: 'location',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Region',
			// 		role: ROLES.getWebArray(),
			// 	},
			// 	loadChildren: () => import('./pages/regions/regions.module').then((m) => m.RegionsModule),
			// },
			{
				path: 'locations',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Locations',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/locations/locations.module').then((m) => m.LocationsModule),
			},
			{
				path: 'groups',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Groups',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/groups/groups.module').then((m) => m.GroupsModule),
			},
			{
				path: 'help-center',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Help Center',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/help-center/help-center.module').then((m) => m.HelpCenterModule),
			},
			{
				path: 'admins',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Admins',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/admin-team/admin-team.module').then((m) => m.AdminTeamModule),
			},
			{
				path: 'client-teams',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Teams',
					role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
				},
				loadChildren: () => import('./pages/client-team/client-team.module').then((m) => m.ClientTeamModule),
			},
			{
				path: 'direct-verification',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Candidate Verification',
					role: [...ROLES.getAdminArray(), ROLES.PROTO_LAWYER],
				},
				loadChildren: () =>
					import('./pages/direct-verification/direct-verification.module').then(
						(m) => m.DirectVerificationModule
					),
			},
			{
				path: 'start-verification',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Candidate Verification',
					role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
				},
				loadChildren: () =>
					import('./pages/start-verification/start-verification.module').then(
						(m) => m.StartVerificationModule
					),
			},
			// {
			// 	path: 'manage-plans',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Plans',
			// 		role: ROLES.getAdminArray(),
			// 	},
			// 	loadChildren: () => import('./pages/manage-plans/manage-plans.module').then((m) => m.ManagePlansModule),
			// },
			// {
			// 	path: 'subscriptions',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Subscriptions',
			// 		role: ROLES.CLIENT_SUPER_ADMIN,
			// 	},
			// 	loadChildren: () =>
			// 		import('./pages/subscription/subscription.module').then((m) => m.SubscriptionModule),
			// },
			{
				path: 'vendors',
				canLoad: [AuthGuard],
				data: {
					breadcrumb: 'Vendors',
					role: [...ROLES.getWebArray(), ROLES.PROTO_OPERATION],
				},
				loadChildren: () => import('./pages/vendor/vendor.module').then((m) => m.VendorModule),
			},
			// {
			// 	path: 'configuration',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Configurations',
			// 		role: ROLES.getWebArray(),
			// 	},
			// 	loadChildren: () =>
			// 		import('./pages/client-configuration/client-configuration.module').then(
			// 			(m) => m.ClientConfigurationModule
			// 		),
			// },
			// {
			// 	path: 'leave-management',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Leave Management',
			// 		role: ROLES.getWebArray(),
			// 	},
			// 	loadChildren: () =>
			// 		import('./pages/leave-management/leave-management.module').then((m) => m.LeaveManagementModule),
			// },
			// {
			// 	path: 'regularization',
			// 	canLoad: [AuthGuard],
			// 	data: {
			// 		breadcrumb: 'Regularization',
			// 		role: ROLES.getWebArray(),
			// 	},
			// 	loadChildren: () =>
			// 		import('./pages/regularization/regularization.module').then((m) => m.RegularizationModule),
			// },
		],
	},
	{ path: '404', component: NotfoundComponent, data: { title: 'Page 404' } },
	{ path: '**', component: NotfoundComponent },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			preloadingStrategy: PreloadAllModules,
			scrollPositionRestoration: 'enabled',
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
