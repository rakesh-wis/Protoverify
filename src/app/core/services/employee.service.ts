import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class EmployeeService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		debounceTime(1000);
		distinctUntilChanged();
		const url = `/admin/employee/`;
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

	list(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/employee/`;
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
		const url = `/admin/employee/${payload.id}`;
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
		const url = `/admin/employee/${payload.id}`;
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
		const url = `/admin/employee/${payload.id}`;
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

	getById(id: number): Observable<any> {
		const url = `/admin/employee/${id}`;
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
	sendWhatsAppOnBoarding(id: number): Observable<any> {
		const url = `/admin/employee/${id}/send-onboarding-message`;
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
	changeOrganization(payload: any): Observable<any> {
		const url = `/admin/employee/${payload.id}/change-organization`;
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
	postConsentSignature(payload: any, url: string): Observable<any> {
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
	pastOrganizationList(payload): Observable<any> {
		const url = `/admin/employee/past-organization`;
		return this.apiService.get(url, payload, SERVICES.USER).pipe(
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
