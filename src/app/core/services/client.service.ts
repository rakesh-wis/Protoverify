import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class ClientService {
	refreshTable = new Subject();

	constructor(private apiService: ApiService) {}

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/client`;
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
	sharedList(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/organization`;
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
	getById(id: any): Observable<any> {
		const url = `/admin/client/${id}`;
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
	create(payload: any): Observable<any> {
		const url = `/admin/client`;
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
	update(payload: any): Observable<any> {
		const url = `/admin/client/${payload.id}`;
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
	getOrGenerateAPIKey(id: any): Observable<any> {
		const url = `/admin/client/${id}/api-key`;
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
}
