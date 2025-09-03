import { Injectable } from '@angular/core';

import { of, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UserService } from '../../core/services';
import { PreventUnsavedMessageDialogComponent } from '../components/modals/prevent-unsaved-message-dialog/prevent-unsaved-message-dialog.component';

@Injectable()
export class PreventUnsavedChangesGuard {
	constructor(private dialog: MatDialog, private _authService: UserService) {}

	canDeactivate(component: any): Observable<boolean> {
		const isLoggedIn = this._authService.isAuthenticated;
		const form = component.dataForm;
		return form && form.dirty && isLoggedIn
			? this.dialog.open(PreventUnsavedMessageDialogComponent).afterClosed()
			: of(true);
	}
}
