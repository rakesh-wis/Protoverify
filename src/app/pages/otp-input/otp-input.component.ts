import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'app-otp-input',
	templateUrl: './otp-input.component.html',
	styleUrls: ['./otp-input.component.scss'],
})
export class OtpInputComponent implements OnInit {
	@Input() formControlOtp: FormControl;
	@Input() inputLength: number = 4;
	@Input() allowNumbersOnly: boolean = true;
	configOtp = {
		length: this.inputLength,
		allowNumbersOnly: this.allowNumbersOnly,
	};
	constructor() {}

	ngOnInit(): void {
		this.configOtp.length = this.inputLength;
		this.configOtp.allowNumbersOnly = this.allowNumbersOnly;
	}
}
