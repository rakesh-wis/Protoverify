import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class BankService {
	constructor(private apiService: ApiService) {}

	getData(params): Observable<any> {
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
	create(payload: any, url): Observable<any> {
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
	update(payload: any, url): Observable<any> {
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
		const url = `/admin/bank/${payload.id}`;
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
	searchIFSC(params) {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/search/bank`;
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

	verifyBank(payload) {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/search/verify/bank`;
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
}
