import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, verificationStatus } from 'src/app/helpers';

@Component({
	selector: 'app-dashboard-applicant-status',
	templateUrl: './dashboard-applicant-status.component.html',
	styleUrls: ['./dashboard-applicant-status.component.scss'],
})
export class DashboardApplicantStatusComponent implements OnInit {
	chartData = [];
	chartLabels = ['Completed', 'In progress'];
	chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			tooltip: {
				callbacks: {
					label: function (context) {
						return `${context.label} ${context.formattedValue} %`;
					},
				},
			},
			legend: {
				position: 'bottom',
				labels: {
					usePointStyle: true,
					boxWidth: 6,
				},
			},
		},
	};
	OPTIONS = OPTIONS;
	constructor(private toastService: ToastService, private dashboardService: DashboardService) {}

	ngOnInit(): void {
		this.getVerificationStats();
	}

	getVerificationStats(): void {
		const params = {
			startDate: moment().subtract(90, 'd').format('YYYY-MM-DD'),
			endDate: moment().format('YYYY-MM-DD'),
		};
		this.dashboardService.getVerificationStats(params).subscribe({
			next: ({ data }) => {
				if (data && data.length > 0) {
					const totalCount = data.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);
					this.chartData.push({
						label: 'Applicant Status',
						data: [
							(data.reduce(
								(accumulator, currentValue) =>
									accumulator +
									(currentValue.verificationStatus === verificationStatus.PROTO_VERIFIED
										? currentValue.count
										: 0),
								0
							) *
								100) /
								totalCount,
							(data.reduce(
								(accumulator, currentValue) =>
									accumulator +
									([
										verificationStatus.DID_NOT_VERIFY,
										verificationStatus.PARTIALLY_VERIFIED,
									].includes(currentValue.verificationStatus)
										? currentValue.count
										: 0),
								0
							) *
								100) /
								totalCount,
						],
						backgroundColor: ['#3d6ec7', '#00BDE1'],
						hoverBackgroundColor: ['#3d6ec7', '#00BDE1'],
						borderWidth: 0,
					});
				}
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
}
