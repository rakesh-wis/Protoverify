import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { GroupsDetailsComponent } from './groups-details/groups-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { GroupPostCardComponent } from './group-post-card/group-post-card.component';
import { GroupPostListComponent } from './group-post-list/group-post-list.component';

@NgModule({
	declarations: [
		GroupsListComponent,
		GroupsDetailsComponent,
		GroupChatComponent,
		GroupPostCardComponent,
		GroupPostListComponent,
	],
	imports: [CommonModule, GroupsRoutingModule, SharedModule],
})
export class GroupsModule {}
