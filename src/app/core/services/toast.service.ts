import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from 'src/app/shared/components/common/toast/toast.component';

@Injectable({
	providedIn: 'root',
})
export class ToastService {
	constructor(private snackBar: MatSnackBar) {}

	success(message: string) {
		this.snackBar.openFromComponent(ToastComponent, {
			data: {
				type: 'success',
				text: 'Success message',
				description: message,
				icon: 'check',
				cssClass: 'bg-green',
			},
			// duration: 5 * 1000,
		});
	}

	error(message: string) {
		this.snackBar.openFromComponent(ToastComponent, {
			data: {
				type: 'error',
				text: 'Error message',
				description: message,
				icon: 'error_outline',
				cssClass: 'bg-danger',
			},
		});
	}
}
