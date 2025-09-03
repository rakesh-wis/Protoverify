import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class PlanService {
	refreshTable = new Subject();
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/plan`;
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
	getClientPlan(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/plan/client`;
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
	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/plan`;
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
		const url = `/admin/plan/${id}`;
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
	update(payload: any): Observable<any> {
		const url = `/admin/plan/${payload.id}`;
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
		const url = `/admin/plan/${payload.id}`;
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
		const url = `/admin/plan/${payload.id}`;
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
	updateAutoRenewal(payload: any): Observable<any> {
		const url = `/admin/plan/${payload.id}/auto-renewal`;
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
