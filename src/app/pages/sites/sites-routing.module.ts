import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SitesContentComponent } from './sites-content/sites-content.component';
import { SitesDetailsComponent } from './sites-details/sites-details.component';
import { SitesListComponent } from './sites-list/sites-list.component';
import { SitesLocationComponent } from './sites-location/sites-location.component';

const routes: Routes = [
	{ path: '', redirectTo: 'list', pathMatch: 'full' },
	{ path: 'list', component: SitesListComponent },
	{ path: 'create', component: SitesContentComponent },
	{ path: 'view', component: SitesContentComponent },
	{ path: 'location', component: SitesLocationComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SitesRoutingModule {}
