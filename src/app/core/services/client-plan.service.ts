import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable, Subject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class ClientPlanService {
	refreshTable = new Subject();

	constructor(private apiService: ApiService) {}

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/plan-request`;
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

	listStandardPlan(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/plan-request/plan-standard`;
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

	getById(id: any): Observable<any> {
		const url = `/admin/plan-request/${id}`;
		return this.apiService.get(url, null, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	create(payload: any): Observable<any> {
		const url = `/admin/plan-request`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	update(payload: any): Observable<any> {
		const url = `/admin/plan-request/${payload.id}`;
		return this.apiService.put(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	patch(payload: any): Observable<any> {
		const url = `/admin/plan-request/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	delete(payload: any): Observable<any> {
		const url = `/admin/plan-request/${payload.id}`;
		return this.apiService.delete(url, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	approve(payload: any): Observable<any> {
		const url = `/admin/plan-request/${payload.id}/approve`;
		return this.apiService.patch(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	reject(payload: any): Observable<any> {
		const url = `/admin/plan-request/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
}
