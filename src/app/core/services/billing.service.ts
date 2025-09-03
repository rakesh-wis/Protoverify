import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SERVICES } from '../../helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class BillingService {
	constructor(private apiService: ApiService) {}

	list(params): Observable<any> {
		const url = `/admin/billing`;
		return this.apiService.get(url, params, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	clientWiseList(params): Observable<any> {
		const url = `/admin/billing/client-list`;
		return this.apiService.get(url, params, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	employeeList(params): Observable<any> {
		const url = `/admin/billing/employee-list`;
		return this.apiService.get(url, params, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	downloadInvoice(id, query: any): Observable<any> {
		const url = `/admin/billing/${id}/invoice`;
		return this.apiService.bulkExport(url, query, SERVICES.SUBSCRIPTION);
	}
}
