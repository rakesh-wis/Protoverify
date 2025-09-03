import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientTeamRoutingModule } from './client-team-routing.module';
import { ClientTeamListComponent } from './client-team-list/client-team-list.component';
import { ClientTeamDetailsComponent } from './client-team-details/client-team-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
	declarations: [ClientTeamListComponent, ClientTeamDetailsComponent],
	imports: [CommonModule, ClientTeamRoutingModule, SharedModule],
})
export class ClientTeamModule {}
