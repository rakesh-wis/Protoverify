import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RazorPayPaymentComponent } from './razorPay-payment.components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [RazorPayPaymentComponent],
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	exports: [RazorPayPaymentComponent],
})
export class RazorPayPaymentModule {}
