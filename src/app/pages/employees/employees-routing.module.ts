import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeDocumentTemplateComponent } from './employee-document-template/employee-document-template.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeesManageComponent } from './employees-manage/employees-manage.component';

const routes: Routes = [
	{
		path: '',
		component: EmployeeListComponent,
	},
	{
		path: 'manage',
		component: EmployeesManageComponent,
		data: {
			breadcrumb: 'View Details',
		},
	},
	{
		path: ':id/download-letter',
		component: EmployeeDocumentTemplateComponent,
		data: {
			breadcrumb: 'View offer letter',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EmployeesRoutingModule {}
