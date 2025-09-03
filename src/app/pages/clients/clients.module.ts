import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientsDetailsComponent } from './clients-details/clients-details.component';
import { GettingStartedModule } from '../getting-started/getting-started.module';
import { ClientsAddComponent } from './clients-add/clients-add.component';

@NgModule({
	declarations: [ClientsListComponent, ClientsDetailsComponent, ClientsAddComponent],
	imports: [CommonModule, ClientsRoutingModule, SharedModule, GettingStartedModule],
})
export class ClientsModule {}
