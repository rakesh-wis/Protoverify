import { Injectable } from '@angular/core';
import { Subject, Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ApiService } from './api.service';
import { SERVICES } from 'src/app/helpers';

@Injectable({
	providedIn: 'root',
})
export class ReferenceCheckService {
	refreshTable = new Subject();

	constructor(private apiService: ApiService) {}

	getList(params: any, url): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		return this.apiService.get(url, params, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	create(payload: any, url): Observable<any> {
		return this.apiService.post(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	update(payload: any, url): Observable<any> {
		return this.apiService.put(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	delete(id: any): Observable<any> {
		const url = `/admin/employee/reference-check/${id}`;
		return this.apiService.delete(url, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	buildStatus(payload: any): Observable<any> {
		const url = `/admin/employee/reference-check/bulk-status`;
		return this.apiService.patch(url, payload, SERVICES.USER).pipe(
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
