import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsDetailsComponent } from './clients-details/clients-details.component';
import { ClientsListComponent } from './clients-list/clients-list.component';

const routes: Routes = [
	{
		path: '',
		component: ClientsListComponent,
	},
	{
		path: 'view',
		component: ClientsDetailsComponent,
		data: {
			breadcrumb: 'Clients Details',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ClientsRoutingModule {}
