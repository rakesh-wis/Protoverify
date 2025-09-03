import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SegmentContextService {
	private _segmentId = new BehaviorSubject<string>('');
	private _segmentId$ = this._segmentId.asObservable();

	constructor() {}

	public get segmentId$(): Observable<string> {
		return this._segmentId$;
	}

	public get truthySegmentId$(): Observable<string> {
		return this.segmentId$.pipe(filter((segment) => !!segment));
	}

	public set segmentId(value: string) {
		// do validation if needed
		// update segment
		this._segmentId.next(value);
	}
}
