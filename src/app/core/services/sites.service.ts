import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class SitesService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/my/sites`;
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
		const url = `/admin/my/sites`;
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
	selectedList(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/my/sites/selected`;
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
		const url = `/admin/my/sites/${id}`;
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
		const url = `/admin/my/sites/${payload.id}`;
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
		const url = `/admin/my/sites/${payload.id}`;
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
		const url = `/admin/my/sites/${payload.id}`;
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
	bulkExport(filter: any): Observable<any> {
		const url = `/admin/my/sites/bulk-export`;
		return this.apiService.bulkExport(url, filter, SERVICES.CMS);
	}
	downloadTemplate(): Observable<any> {
		const url = `/admin/my/sites/download-template`;
		return this.apiService.bulkExport(url, null, SERVICES.CMS);
	}
}
