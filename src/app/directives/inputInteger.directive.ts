import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
	selector: '[inputNumber]',
})
export class InputIntegerDirective {
	@Input() minValue: number;
	@Input() maxValue: number;

	constructor(private el: ElementRef) {}

	@HostListener('document:keypress', ['$event'])
	onKeyPress(event) {
		const oldValue = this.el.nativeElement.value;
		const newKey = event.key;

		if (newKey === '-' || newKey === '.' || newKey === 'e') {
			event.preventDefault();
		}

		const newValue = oldValue + newKey;
		const currentValue = parseInt(newValue);

		if (isNaN(currentValue) || currentValue < this.minValue || currentValue > this.maxValue) {
			event.preventDefault();
		}
	}

	@HostListener('paste', ['$event'])
	onPaste(event: ClipboardEvent) {
		const clipboardData = event?.clipboardData;
		const pastedText = clipboardData.getData('text');
		const pattern = '^[0-9]*$';
		const maskSeperator = new RegExp(pattern, 'g');
		const isJustNumbers = maskSeperator.test(pastedText);

		if (!isJustNumbers) {
			event.preventDefault();
		}
	}
}
