import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { OPTIONS, ROLES } from 'src/app/helpers';
import { User } from 'src/app/models';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';

@Component({
	selector: 'app-dashboard-track-analytics',
	templateUrl: './dashboard-track-analytics.component.html',
	styleUrls: ['./dashboard-track-analytics.component.scss'],
})
export class DashboardTrackAnalyticsComponent implements OnInit {
	page: number = 1;
	pageSize: number = 4;
	collectionSize: number = 0;
	VERIFICATION_BASE_URL = VERIFICATION_BASE_URL;

	dataList: any = {
		data: [],
		count: -1,
	};
	OPTIONS = OPTIONS;
	user: User;
	constructor(
		private verificationDetailsService: VerificationDetailsService,
		private employeeService: EmployeeService,
		private toastService: ToastService,
		private router: Router,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.user = this.userService.getCurrentUser();
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
				this.dataList['rows'].forEach((element) => {
					this.verificationDetailsService.verificationCount({ userId: element.id }).subscribe({
						next: (verificationResult) => {
							element['verificationCount'] = verificationResult.data;
						},
					});
				});
				this.collectionSize = result.data['count'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	navigateTo() {
		if (ROLES.getAdminArray().includes(this.user.role) && !sessionStorage.getItem('clientId')) {
			this.router.navigate([`/direct-verification`]);
		} else {
			this.router.navigate([`/start-verification`]);
		}
	}

	getClass(item): string {
		const percentage = parseInt(item?.verificationCount?.percentage);
		if (percentage >= 80) {
			return 'progress-bar-100';
		} else if (percentage < 80 && percentage >= 50) {
			return 'progress-bar-50';
		} else {
			return 'progress-bar-20';
		}
	}
}
