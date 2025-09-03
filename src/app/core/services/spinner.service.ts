import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class SpinnerService {
	private subject = new Subject<any>();
	staticAlertClosed = false;
	constructor() {}

	getLoading(): Observable<any> {
		return this.subject.asObservable().pipe();
	}

	start() {
		this.subject.next(true);
	}
	stop() {
		this.subject.next(false);
	}
}
