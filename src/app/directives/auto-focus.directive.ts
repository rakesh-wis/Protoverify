import { Directive, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[libAutoTab]',
})
export class VerificationAutoTabDirective {
	@Input() libAutoTab: any;
	constructor() {}
	@HostListener('input', ['$event.target']) onInput(input: any) {
		const length = input.value.length;
		const maxLength = input.attributes.maxlength.value;
		if (length >= maxLength && this.libAutoTab >= 0) {
			const field = document.getElementById(this.libAutoTab + 1);
			if (field) {
				field.focus();
			}
		} else {
			input.value = '';
		}
	}
}
