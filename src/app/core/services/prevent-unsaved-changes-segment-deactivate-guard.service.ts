import { Injectable, Injector } from '@angular/core';
import { map } from 'rxjs/operators';
import { SegmentContextService } from './segment-context.service';
import { PreventUnsavedChangesGuard } from '../../shared/validators/prevent-unsaved-changes-guard.service';

@Injectable({
	providedIn: 'root',
})
export class PreventUnsavedChangesSegmentDeactivateGuard {
	constructor(private injector: Injector, private _segmentContext: SegmentContextService) {}

	public canDeactivate(component: any) {
		let preventUnsavedChangesGuard = this.injector.get(PreventUnsavedChangesGuard);
		// console.log('preventUnsavedChangesGuard', preventUnsavedChangesGuard)
		return preventUnsavedChangesGuard.canDeactivate(component).pipe(
			map((result) => {
				if (result) {
					this._segmentContext.segmentId = null;
					return true;
				}
				return false;
			})
		);
	}
}
