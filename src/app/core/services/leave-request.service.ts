import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class LeaveRequestService {
	constructor(private apiService: ApiService) {}

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/leave-request`;
		return this.apiService.get(url, filter, SERVICES.CMS).pipe(
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
		const url = `/admin/leave-request/${id}`;
		return this.apiService.get(url, null, SERVICES.CMS).pipe(
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
		const url = `/admin/leave-request/${payload.id}`;
		return this.apiService.put(url, payload, SERVICES.CMS).pipe(
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
		const url = `/admin/leave-request/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.CMS).pipe(
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
		const url = `/admin/leave-request/${payload.id}`;
		return this.apiService.delete(url, SERVICES.CMS).pipe(
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
