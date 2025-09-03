import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupChatComponent } from './group-chat/group-chat.component';
import { GroupsListComponent } from './groups-list/groups-list.component';

const routes: Routes = [
	{ path: '', component: GroupsListComponent },
	{
		path: 'chat',
		component: GroupChatComponent,
		data: {
			breadcrumb: 'Chat',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class GroupsRoutingModule {}
