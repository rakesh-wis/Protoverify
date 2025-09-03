import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientTeamListComponent } from './client-team-list/client-team-list.component';

const routes: Routes = [
	{ path: '', redirectTo: 'list', pathMatch: 'full' },
	{ path: 'list', component: ClientTeamListComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ClientTeamRoutingModule {}
