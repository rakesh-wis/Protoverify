import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ApiService } from './api.service';
import { SERVICES } from 'src/app/helpers';

@Injectable({
	providedIn: 'root',
})
export class FavouritePlanService {
	constructor(private apiService: ApiService) {}

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/favourite-plan`;
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

	create(payload: any): Observable<any> {
		const url = `/admin/favourite-plan`;
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
		const url = `/admin/favourite-plan/${payload.id}`;
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
	delete(payload: any): Observable<any> {
		const url = `/admin/favourite-plan/${payload.id}`;
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
}
