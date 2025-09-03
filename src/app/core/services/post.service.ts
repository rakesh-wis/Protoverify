import { Injectable } from '@angular/core';
import { Observable, map, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SERVICES } from 'src/app/helpers';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root',
})
export class PostService {
	postDataSubject = new Subject();
	constructor(private apiService: ApiService) {}

	create(payload: any, groupId: number): Observable<any> {
		const url = `/admin/post/${groupId}`;
		return this.apiService.post(url, payload, SERVICES.SOCIAL).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	list(filter: any, groupId: number): Observable<any> {
		debounceTime(500);
		distinctUntilChanged();
		const url = `/admin/post/${groupId}`;
		return this.apiService.get(url, filter, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/post/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.SOCIAL).pipe(
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
		const url = `/admin/post/${payload.id}`;
		return this.apiService.delete(url, SERVICES.SOCIAL).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	likeUnLike(id: number): Observable<any> {
		const url = `/admin/post/${id}/like-unlike`;
		return this.apiService.patch(url, {}, SERVICES.SOCIAL).pipe(
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
