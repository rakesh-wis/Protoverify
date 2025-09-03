import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagePlanRequestListComponent } from './manage-plan-request-list/manage-plan-request-list.component';
import { ManagePlansListComponent } from './manage-plans-list/manage-plans-list.component';
import { ManagePlansStandardListComponent } from './manage-plans-standard-list/manage-plans-standard-list.component';
import { ManagePlansComponent } from './manage-plans.component';

const routes: Routes = [
	{
		path: '',
		component: ManagePlansComponent,
		children: [
			{ path: '', redirectTo: 'list', pathMatch: 'full' },
			{ path: 'list', component: ManagePlansListComponent },
			{ path: 'standard-list', component: ManagePlansStandardListComponent },
			{
				path: 'requested-plan',
				component: ManagePlanRequestListComponent,
				data: {
					breadcrumb: 'Requested Plans',
				},
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ManagePlansRoutingModule {}
