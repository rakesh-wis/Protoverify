import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, verificationStatus } from 'src/app/helpers';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';

@Component({
	selector: 'app-dashboard-recent-application',
	templateUrl: './dashboard-recent-application.component.html',
	styleUrls: ['./dashboard-recent-application.component.scss'],
})
export class DashboardRecentApplicationComponent implements OnInit {
	page: number = 1;
	pageSize: number = 4;
	collectionSize: number = 0;
	VERIFICATION_BASE_URL = VERIFICATION_BASE_URL;
	verificationStatus = verificationStatus;

	dataList: any = {
		data: [],
		count: -1,
	};
	OPTIONS = OPTIONS;

	constructor(private employeeService: EmployeeService, private toastService: ToastService) {}

	ngOnInit(): void {
		this.loadData();
	}
	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.employeeService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
}
