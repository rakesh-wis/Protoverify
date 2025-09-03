import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

const _window = () => {
	// return the global native browser window object
	return window;
};

@Injectable({
	providedIn: 'root',
})
export class RazorPayService {
	constructor(private apiService: ApiService) {}

	get nativeWindow(): any {
		return _window();
	}

	createOrder(payload): Observable<any> {
		let url: string = `/payment/create`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data: any) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	verifyPayment(payload): Observable<any> {
		let url: string = `/payment/verify`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data: any) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	manualPayment(payload): Observable<any> {
		let url: string = `/payment/manual-payment`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data: any) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
}
