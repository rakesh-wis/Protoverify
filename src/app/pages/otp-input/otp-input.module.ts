import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtpInputComponent } from './otp-input.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [OtpInputComponent],
	imports: [CommonModule, NgOtpInputModule, FormsModule, ReactiveFormsModule],
	exports: [OtpInputComponent],
})
export class OtpInputModule {}
