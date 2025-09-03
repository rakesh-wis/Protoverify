import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardContentComponent } from './dashboard-content/dashboard-content.component';
import { DashboardClientCreditListComponent } from './dashboard-client-credit-list/dashboard-client-credit-list.component';
import { DashboardClientVerificationListComponent } from './dashboard-client-verification-list/dashboard-client-verification-list.component';
import { DashboardOperationVerificationDetailsComponent } from './dashboard-operation-verification-details/dashboard-operation-verification-details.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		children: [
			{ path: '', redirectTo: 'stats', pathMatch: 'full' },
			{
				path: 'stats',
				component: DashboardContentComponent,
				data: {
					breadcrumb: null,
				},
			},
			{
				path: 'credits',
				component: DashboardClientCreditListComponent,
				data: {
					breadcrumb: 'Client Credits',
				},
			},
			{
				path: 'client-verification',
				component: DashboardClientVerificationListComponent,
				data: {
					breadcrumb: 'Client Verification',
				},
			},
			{
				path: 'verification/:type',
				component: DashboardOperationVerificationDetailsComponent,
				data: {
					breadcrumb: null,
				},
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DashboardRoutingModule {}
