import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminTeamRoutingModule } from './admin-team-routing.module';
import { AdminTeamListComponent } from './admin-team-list/admin-team-list.component';
import { AdminTeamDetailsComponent } from './admin-team-details/admin-team-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
	declarations: [AdminTeamListComponent, AdminTeamDetailsComponent],
	imports: [CommonModule, AdminTeamRoutingModule, SharedModule],
})
export class AdminTeamModule {}
