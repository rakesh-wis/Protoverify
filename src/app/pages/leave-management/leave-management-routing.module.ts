import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveManagementDetailsComponent } from './leave-management-details/leave-management-details.component';
import { LeaveManagementListComponent } from './leave-management-list/leave-management-list.component';

const routes: Routes = [
	{
		path: '',
		component: LeaveManagementListComponent,
	},
	{
		path: ':id/details',
		component: LeaveManagementDetailsComponent,
		data: {
			breadcrumb: 'View Details',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LeaveManagementRoutingModule {}
