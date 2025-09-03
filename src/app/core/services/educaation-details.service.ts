import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class EducaationDetailsService {
	refreshTable = new Subject();

	constructor(private apiService: ApiService) {}

	getList(url: string, params: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		return this.apiService.get(url, params, SERVICES.VERIFICATION).pipe(
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
		const url = `/admin/educational-details`;
		return this.apiService.post(url, payload, SERVICES.VERIFICATION).pipe(
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
		const url = `/admin/educational-details/${payload.id}`;
		return this.apiService.put(url, payload, SERVICES.VERIFICATION).pipe(
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
		const url = `/admin/educational-details/${id}`;
		return this.apiService.delete(url, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	updateStatus(payload: any): Observable<any> {
		const url = `/admin/educational-details/bulk-status`;
		return this.apiService.patch(url, payload, SERVICES.VERIFICATION).pipe(
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
