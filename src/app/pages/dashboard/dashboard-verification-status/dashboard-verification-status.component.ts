import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ToastService } from '../../../core/services/toast.service';
import { OPTIONS, SERVICES, verificationLevel, verificationLevelList, verificationStatus } from '../../../helpers';
import { forkJoin } from 'rxjs';
import { sortAlphabetically } from 'src/app/helpers/utils.helper';

@Component({
	selector: 'app-dashboard-verification-status',
	templateUrl: './dashboard-verification-status.component.html',
	styleUrls: ['./dashboard-verification-status.component.scss'],
})
export class DashboardVerificationStatusComponent implements OnInit {
	chartData = [];
	chartLabels = verificationLevelList.map((element) => element.label);
	chartOptions = {
		responsive: true,
		// maintainAspectRatio: false,
		aspectRatio: 2,
		plugins: {
			tooltip: {
				callbacks: {},
			},
			legend: {
				display: false,
			},
		},
	};
	OPTIONS = OPTIONS;
	verificationLevelList = verificationLevelList;
	constructor(private toastService: ToastService, private dashboardService: DashboardService) {}

	ngOnInit(): void {
		this.getVerificationStats();
	}
	getVerificationIcon(item) {
		return `./assets/icons/verification/${item?.name}.svg`;
	}

	combineArray(combinedArray) {
		const counts = new Map();
		combinedArray.forEach((item) => {
			const { count, status } = item;
			counts.set(status, (counts.get(status) || 0) + count);
		});
		const result = [...counts].map(([status, count]) => ({
			count,
			status,
		}));
		return result;
	}
	getVerificationStats(): void {
		const params = {
			startDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
			endDate: moment().format('YYYY-MM-DD'),
		};
		const userService = this.dashboardService.getCompleteCaseSeverity(params, SERVICES.USER);
		const verificationService = this.dashboardService.getCompleteCaseSeverity(params, SERVICES.VERIFICATION);
		forkJoin(userService, verificationService).subscribe((response) => {
			const resultArray = this.combineArray(response.map((e) => e.data).flat(1));
			this.mapChartData([
				resultArray.find((e) => e.status === verificationLevel.CLEAR_REPORT)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.MINOR_DISCREPANCY)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.IN_ACCESSIBLE_FOR_VERIFICATION)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.UNABLE_TO_VERIFY)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.ADDITIONAL_INPUTS_REQUIRED)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.ADDITIONAL_DOCUMENTS_REQUIRED)?.count || 0,
				resultArray.find((e) => e.status === verificationLevel.MAJOR_DISCREPANCY)?.count || 0,
			]);
		});
	}

	mapChartData(data: any) {
		if (data.every((e) => e === 0)) {
			return;
		}
		this.chartData.push({
			label: 'Complete Case by Severity',
			data,
			backgroundColor: verificationLevelList.map((e) => e.color),
			hoverBackgroundColor: verificationLevelList.map((e) => e.color),
			borderWidth: 0,
		});
	}
}
