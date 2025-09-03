import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged, Subject, BehaviorSubject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class SubscriptionService {
	private userPlanSubject = new BehaviorSubject<any>({});
	public userPlan = this.userPlanSubject.asObservable().pipe(distinctUntilChanged());

	public refreshSidebar = new Subject();

	constructor(private apiService: ApiService) {}

	setPlan(plan): void {
		this.userPlanSubject.next(plan);
	}

	clearPlan() {
		this.userPlanSubject.next(null);
	}

	getPlan() {
		return this.userPlanSubject.value;
	}
	listVerificationCheck(payload: any): Observable<any> {
		const url = `/admin/verification-check`;
		return this.apiService.get(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	createOrUpdateVerificationCheck(payload: any): Observable<any> {
		const url = `/admin/verification-check`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	employeeVerificationList(payload: any): Observable<any> {
		const url = `/admin/employee-subscription`;
		return this.apiService.get(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	getWallet(payload): Observable<any> {
		const url = `/admin/wallet`;
		return this.apiService.get(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	downloadTemplate(): Observable<any> {
		const url = `/admin/verification-check/download-template`;
		return this.apiService.bulkExport(url, null, SERVICES.SUBSCRIPTION);
	}
	create(payload: any): Observable<any> {
		const url = `/admin/subscription`;
		return this.apiService.post(url, payload, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getClientCredits(filter: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/dashboard/client-credits`;
		return this.apiService.get(url, filter, SERVICES.SUBSCRIPTION).pipe(
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
		const url = `/admin/subscription`;
		return this.apiService.get(url, filter, SERVICES.SUBSCRIPTION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	getCurrentPlan(): Observable<any> {
		const url = `/admin/subscription/current`;
		return this.apiService.get(url, null, SERVICES.SUBSCRIPTION).pipe(
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
		const url = `/admin/subscription/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.SUBSCRIPTION).pipe(
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
