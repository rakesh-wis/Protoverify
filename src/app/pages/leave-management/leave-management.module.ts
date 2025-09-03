import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveManagementRoutingModule } from './leave-management-routing.module';
import { LeaveManagementListComponent } from './leave-management-list/leave-management-list.component';
import { LeaveManagementDetailsComponent } from './leave-management-details/leave-management-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
	declarations: [LeaveManagementListComponent, LeaveManagementDetailsComponent],
	imports: [CommonModule, LeaveManagementRoutingModule, SharedModule],
})
export class LeaveManagementModule {}
