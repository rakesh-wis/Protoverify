import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class RegionsService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/my/region`;
		return this.apiService.post(url, payload, SERVICES.CMS).pipe(
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
		const url = `/admin/my/region`;
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

	update(payload: any): Observable<any> {
		const url = `/admin/my/region/${payload.id}`;
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
		const url = `/admin/my/region/${payload.id}`;
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
		const url = `/admin/my/region/${payload.id}`;
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

	sharedList(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/region`;
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
}
