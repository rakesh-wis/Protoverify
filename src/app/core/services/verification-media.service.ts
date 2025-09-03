import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class VerificationMediaService {
	constructor(private apiService: ApiService) {}

	create(payload: any): Observable<any> {
		const url = `/admin/verification/media`;
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
	createBulk(payload: any): Observable<any> {
		const url = `/admin/verification/media/bulk`;
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
		const url = `/admin/verification/media/${payload.id}`;
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
		const url = `/admin/verification/media/${payload.id}`;
		return this.apiService.patch(url, {}, SERVICES.VERIFICATION).pipe(
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
