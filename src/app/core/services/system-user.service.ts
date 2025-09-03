import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class SystemUserService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/system-user/`;
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
	getById(id: any): Observable<any> {
		const url = `/admin/system-user/${id}`;
		return this.apiService.get(url, null, SERVICES.USER).pipe(
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
		const url = `/admin/system-user/`;
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

	update(payload: any): Observable<any> {
		const url = `/admin/system-user/${payload.id}`;
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

	patch(payload: any): Observable<any> {
		const url = `/admin/system-user/${payload.id}`;
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

	delete(payload: any): Observable<any> {
		const url = `/admin/user/${payload.id}`;
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
}
