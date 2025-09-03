import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-prevent-unsaved-message-dialog',
	templateUrl: './prevent-unsaved-message-dialog.component.html',
	styleUrls: ['./prevent-unsaved-message-dialog.component.scss'],
})
export class PreventUnsavedMessageDialogComponent {
	image: string;
	title: string = 'Confirmation';
	description: string = 'You will lose unsaved changes if you leave this page';

	@Input() cancelText: string = 'Continue without saving';
	@Input() okText: string = 'Go back to form';
	@Input() okButtonColor: string = 'btn-primary';
	@Input() cancelButtonColor: string = 'btn-light';
	constructor(public dialogRef: MatDialogRef<PreventUnsavedMessageDialogComponent>) {}
}
