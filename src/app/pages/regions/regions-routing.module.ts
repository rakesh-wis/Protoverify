import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegionsListComponent } from './regions-list/regions-list.component';

const routes: Routes = [
	{ path: '', redirectTo: 'list', pathMatch: 'full' },
	{ path: 'list', component: RegionsListComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class RegionsRoutingModule {}
