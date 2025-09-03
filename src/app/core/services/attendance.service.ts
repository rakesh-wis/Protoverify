import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class AttendanceService {
	constructor(private apiService: ApiService) {}

	checkInList(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/attendance/checkin/log`;
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

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/attendance`;
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

	summary(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/attendance/summary`;
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

	patch(payload: any): Observable<any> {
		const url = `/admin/attendance/${payload.id}`;
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

	downloadAttendance(params): Observable<any> {
		const url = `/admin/attendance/download`;
		return this.apiService.bulkExport(url, params, SERVICES.CMS);
	}
}
