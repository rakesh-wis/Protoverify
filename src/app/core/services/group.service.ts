import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class GroupService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/group`;
		return this.apiService.post(url, payload, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/group`;
		return this.apiService.get(url, filter, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/group/${id}`;
		return this.apiService.get(url, null, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/group/${payload.id}`;
		return this.apiService.put(url, payload, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/group/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/group/${payload.id}`;
		return this.apiService.delete(url, SERVICES.SOCIAL).pipe(
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
