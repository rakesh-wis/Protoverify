import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { monthNames, yearsListForward } from 'src/app/helpers';

@Component({
	selector: 'app-dashboard-applicant-record',
	templateUrl: './dashboard-applicant-record.component.html',
	styleUrls: ['./dashboard-applicant-record.component.scss'],
})
export class DashboardApplicantRecordComponent implements OnInit {
	chartData = [];
	chartLabels = monthNames.map(({ name }) => name);
	selectedYearChart = new Date().getFullYear();
	yearList = [];
	chartOptions = {
		responsive: true,
		scales: {
			// We use this empty structure as a placeholder for dynamic theming.
			y: {
				position: 'left',
				min: 0,
				grid: {
					drawBorder: false,
					display: true,
				},
			},
			x: {
				grid: {
					display: false,
				},
			},
		},
		plugins: {
			tooltip: {
				callbacks: {},
			},
			scales: {
				y: {
					beginAtZero: true,
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
	verificationAnalysisData = [];
	constructor(private toastService: ToastService, private dashboardService: DashboardService) {
		let dynamicYear = new Date().getFullYear() - 2;  
		// let yearList = yearsListForward(4, 2023);
		let yearList = yearsListForward(4, dynamicYear);
		this.yearList = yearList.map(
			(element, index) =>
				index < yearList.length - 1 && {
					label: `${yearList[index]}-${yearList[index + 1]}`,
					value: yearList[index],
				}
		);
	}

	ngOnInit(): void {
		this.getVerificationAnalysis();
	}

	getVerificationAnalysis(): void {
		this.chartData = [];
		let params = {
			year: this.selectedYearChart,
		};
		this.dashboardService.getVerificationAnalysis(params).subscribe({
			next: ({ data }) => {
				this.verificationAnalysisData = data;
				this.chartData.push({
					label: 'Received applicants',
					data: data.map((element) => element.remainingCount + element.verifiedCount),
					backgroundColor: ['#D8DCEA'],
					hoverBackgroundColor: ['#D8DCEA'],
					borderWidth: 0,
				});
				this.chartData.push({
					label: 'Verified applicants',
					data: data.map((element) => element.verifiedCount),
					backgroundColor: ['#3d6ec7'],
					hoverBackgroundColor: ['#3d6ec7'],
					borderWidth: 0,
				});
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
}
