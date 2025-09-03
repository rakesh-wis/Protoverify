import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class KycService {
	constructor(private apiService: ApiService) {}

	list(params): Observable<any> {
		const url = `/admin/kyc`;
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
	getType(params): Observable<any> {
		return this.apiService.get(params.url, params, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	create(payload: any, url: string): Observable<any> {
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
	update(payload: any, url: string): Observable<any> {
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
	patch(payload: any): Observable<any> {
		const url = `/admin/kyc/${payload.id}`;
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

	delete(url: string): Observable<any> {
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

	requestOtp(payload): Observable<any> {
		const url = `/kyc/otp/request`;
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
	verifyAadhar(payload): Observable<any> {
		const url = `/kyc/otp/verify`;
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

	getAadharAddress(query): Observable<any> {
		const url = `/admin/kyc/address`;
		return this.apiService.get(url, query, SERVICES.VERIFICATION).pipe(
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
