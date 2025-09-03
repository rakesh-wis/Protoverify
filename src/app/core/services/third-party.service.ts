import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class ThirdPartyService {
	constructor(private httpClient: HttpClient, handler: HttpBackend, private apiService: ApiService) {
		this.httpClient = new HttpClient(handler);
	}

	post(url: string, payload: any, token: string): Observable<any> {
		const httpHeaders = {
			headers: new HttpHeaders({
				...(token && { Authorization: `JWT ${token}` }),
				Accept: 'application/json',
			}),
		};
		return this.httpClient
			.post(url, payload, httpHeaders)
			.pipe(catchError(this.formatErrors))
			.pipe(
				map((data) => {
					if (data && data['result']) {
						return data['result'];
					} else {
						return null;
					}
				})
			);
	}
	get(url: string, params: HttpParams, token: string): Observable<any> {
		const httpHeaders = {
			headers: new HttpHeaders({
				...(token && { Authorization: `JWT ${token}` }),
				Accept: 'application/json',
			}),
			params,
		};
		return this.httpClient
			.get(url, httpHeaders)
			.pipe(catchError(this.formatErrors))
			.pipe(
				map((data) => {
					if (data && data['result']) {
						return data['result'];
					} else {
						return null;
					}
				})
			);
	}
	public formatErrors(error: any) {
		if (error && (error.status === 403 || error.status === 401)) {
			return error;
		}
		let err = error.error;
		if (err.error) {
			err = err.error;
			if (err && err.error_params && err.error_params.length > 0) {
				const errors = err.error_params.map((e: any) => e.message);
				return throwError(errors || ['Oops something went wrong!']);
			} else if (err && err.errors && err.errors.length > 0) {
				return throwError(err.errors || ['Oops something went wrong!']);
			} else {
				return throwError(['Oops something went wrong!']);
			}
		} else {
			return throwError(
				err ? (err.errors ? err.errors : 'Oops something went wrong!') : 'Oops something went wrong!'
			);
		}
	}
}
