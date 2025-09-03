import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegularizationListComponent } from './regularization-list/regularization-list.component';

const routes: Routes = [
	{
		path: '',
		component: RegularizationListComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class RegularizationRoutingModule {}
