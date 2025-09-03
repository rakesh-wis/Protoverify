import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class AddressService {
	constructor(private apiService: ApiService) {}

	getData(params): Observable<any> {
		return this.apiService.get(params.url, params, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	create(payload: any, url): Observable<any> {
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
	update(payload: any, url): Observable<any> {
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

	patchStatus(payload: any): Observable<any> {
		const url = `/admin/address/${payload.id}`;
		return this.apiService.patch(url, {}, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	generateOtp(id: any): Observable<any> {
		const url = `/admin/address/${id}/generate-otp`;
		return this.apiService.patch(url, {}, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	verifyOtp(payload: any): Observable<any> {
		const url = `/address/${payload.id}/verify-otp`;
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
}
