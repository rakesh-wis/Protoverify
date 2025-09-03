import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeeVerificationComponent } from './employee-verification/employee-verification.component';
import { ChangeOrganizationComponent } from './change-organization/change-organization.component';
import { EmployeesManageComponent } from './employees-manage/employees-manage.component';
import { EmployeePastHistoryListComponent } from './employee-past-history-list/employee-past-history-list.component';
import { EmployeeAttendanceListComponent } from './employee-attendance-list/employee-attendance-list.component';
import { EmployeeChangeStatusComponent } from './employee-change-status/employee-change-status.component';

@NgModule({
	declarations: [
		EmployeeListComponent,
		EmployeeDetailsComponent,
		EmployeeVerificationComponent,
		ChangeOrganizationComponent,
		EmployeesManageComponent,
		EmployeePastHistoryListComponent,
		EmployeeAttendanceListComponent,
		EmployeeChangeStatusComponent,
	],
	imports: [CommonModule, EmployeesRoutingModule, SharedModule],
})
export class EmployeesModule {}
