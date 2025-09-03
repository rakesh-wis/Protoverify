import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-dashboard-recent-activity',
	templateUrl: './dashboard-recent-activity.component.html',
	styleUrls: ['./dashboard-recent-activity.component.scss'],
})
export class DashboardRecentActivityComponent implements OnInit {
	page: number = 1;
	pageSize: number = 4;
	collectionSize: number = 0;

	dataList: any = {
		data: [],
		count: -1,
	};

	constructor(
		private toastService: ToastService,
		private dashboardService: DashboardService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.dashboardService.getClientRecentActivity(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
	navigateTo() {
		this.router.navigate([`/clients`]);
	}
}
