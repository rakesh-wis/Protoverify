import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientConfigurationContentComponent } from './client-configuration-content/client-configuration-content.component';
import { ClientConfigurationTemplateEditComponent } from './client-configuration-template-edit/client-configuration-template-edit.component';

const routes: Routes = [
	{ path: '', component: ClientConfigurationContentComponent },
	{
		path: ':type/edit',
		component: ClientConfigurationTemplateEditComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ClientConfigurationRoutingModule {}
