import { Injectable } from '@angular/core';
import { City, Country, State } from 'country-state-city';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class SharedService {
	constructor(private apiService: ApiService) {}

	momentDateTime(date, time = null) {
		if (date && date.hasOwnProperty('year') && time) {
			return moment()
				.set({
					year: date.year,
					month: date.month - 1,
					date: date.day,
					hour: time.hour,
					minute: time.minute,
					second: 0,
				})
				.format('YYYY-MM-DD hh:mm:ss');
		} else if (date && date.hasOwnProperty('year')) {
			return moment()
				.set({ year: date.year, month: date.month - 1, date: date.day })
				.format('YYYY-MM-DD');
		}
		return null;
	}

	setDisplayDate(value) {
		let newDate = new Date(value);
		if (value) {
			return {
				day: newDate.getDate(),
				month: newDate.getMonth() + 1,
				year: newDate.getFullYear(),
			};
		}
		return null;
	}

	getCountries() {
		return Country.getAllCountries();
	}
	getCountryByCode(isoCode: string) {
		return Country.getCountryByCode(isoCode);
	}

	getStatesOfCountry(countryCode: string) {
		return State.getStatesOfCountry(countryCode);
	}

	getCitiesOfState(countryCode: string, stateCode: string) {
		return City.getCitiesOfState(countryCode, stateCode);
	}

	getOrganizations(filter?: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/organization`;
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

	getHelpCenter(filter?: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/help-center`;
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

	getPdfCoBalance(): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/pdf-co`;
		return this.apiService.get(url, null, SERVICES.NOTIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	getUserList(filter?: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/users`;
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
	searchPincode(pincode: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/pincode/${pincode}`;
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
	getTimeShift(params: any): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/shared/timeshift`;
		return this.apiService.get(url, params, SERVICES.CMS).pipe(
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
