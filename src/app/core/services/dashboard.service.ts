import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class DashboardService {
	constructor(private apiService: ApiService) {}

	getCompleteCaseSeverity(filter: any, service): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/case-severity`;
		return this.apiService.get(url, filter, service).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getVerificationStats(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/verification-stats`;
		return this.apiService.get(url, filter, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getClientStats(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/client-stats`;
		return this.apiService.get(url, filter, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getClientRecentActivity(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/client-recent-activity`;
		return this.apiService.get(url, filter, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getVerificationAnalysis(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/verification-analysis`;
		return this.apiService.get(url, filter, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getWalletStats(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/wallet-stats`;
		return this.apiService.get(url, filter, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getOperationFlowVerificationStats(filter: any, service): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/status-checks-count`;
		return this.apiService.get(url, filter, service).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getVerificationDetails(type: string, filter: any, service): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/employee-verifications/${type}`;
		return this.apiService.get(url, filter, service).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getVerificationDetailsView(filter: any, service): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/employee-verification-view`;
		return this.apiService.get(url, filter, service).pipe(
			map((data) => {
				if (data && data.result) {
					console.log(data);
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getExportData(type: string, filter: any, service): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		let httpParams = new HttpParams();
		filter.userIds.forEach((id) => {
			httpParams = httpParams.append('userId', id.toString());
		});
		if (filter.status) httpParams = httpParams.append('status', filter.status);
		const url = `/admin/dashboard/employee-verification-details/${type}`;
		return this.apiService.bulkExport(url, httpParams, service);
	}
}
