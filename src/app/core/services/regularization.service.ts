import { Injectable } from '@angular/core';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class RegularizationService {
	constructor(private apiService: ApiService) {}

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/regularization`;
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
	bulkExport(filter: any): Observable<any> {
		const url = `/admin/regularization/bulk-export`;
		return this.apiService.bulkExport(url, filter, SERVICES.CMS);
	}
	downloadTemplate(params): Observable<any> {
		const url = `/admin/regularization/download-template`;
		return this.apiService.bulkExport(url, params, SERVICES.CMS);
	}
}
