import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientConfigurationRoutingModule } from './client-configuration-routing.module';
import { ClientConfigurationGeneralComponent } from './client-configuration-general/client-configuration-general.component';
import { ClientConfigurationTemplateComponent } from './client-configuration-template/client-configuration-template.component';
import { ClientConfigurationContentComponent } from './client-configuration-content/client-configuration-content.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LogListComponent } from './log-list/log-list.component';
import { ClientConfigurationTemplateEditComponent } from './client-configuration-template-edit/client-configuration-template-edit.component';
import { ClientConfigurationTemplateDetailsComponent } from './client-configuration-template-details/client-configuration-template-details.component';
@NgModule({
	declarations: [
		ClientConfigurationGeneralComponent,
		ClientConfigurationTemplateComponent,
		ClientConfigurationContentComponent,
		LogListComponent,
		ClientConfigurationTemplateEditComponent,
		ClientConfigurationTemplateDetailsComponent,
	],
	imports: [CommonModule, ClientConfigurationRoutingModule, SharedModule],
})
export class ClientConfigurationModule {}
