import { Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RazorPayService } from 'src/app/core/services/razorpay.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SUBSCRIPTION_BASE_URL, environment } from 'src/environments/environment';

@Component({
	selector: 'app-razorPay-payment',
	templateUrl: './razorPay-payment.components.html',
	styleUrls: ['./razorPay-payment.components.scss'],
	providers: [RazorPayService],
})
export class RazorPayPaymentComponent implements OnInit, OnChanges {
	@Input() amount = 0;
	@Input() orderId = null;
	@Input() description = 'Recharge';
	@Input() notes: any = {};
	@Input() triggerManually: boolean = false;
	@Input() hideButton: boolean = false;
	razorPayOptions = {
		key: environment.RAZOR_PAY_KEY,
		amount: '',
		description: 'Buy subscription',
		order_id: '', //Order ID generated in Step 1
		currency: 'INR',
		theme: {
			color: '#112b64',
		},
		http_post: this.razorPayService,
		callback_url: `${SUBSCRIPTION_BASE_URL}/api/v1/payment/capture`,
		// image: '../../../favicon.ico', // company logo or product image
		modal: {
			escape: false,
			ondismiss: () => {
				this.spinnerService.stop();
				// console.log('Transaction cancelled.');
				this.toastService.error('Your transaction was cancelled');
			},
		},
		handler: (response) => {
			this.successCallback(response);
		},
	};

	dataForm = new FormGroup({
		amount: new FormControl(null, [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.email]),
		currency: new FormControl('INR'),
		receipt: new FormControl(),
		notes: new FormControl(),
	});
	@Output() paymentMade: EventEmitter<Boolean> = new EventEmitter();

	constructor(
		private zone: NgZone,
		private toastService: ToastService,
		private spinnerService: SpinnerService,
		private razorPayService: RazorPayService
	) {}

	ngOnInit() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['amount'] && this.amount) {
			this.razorPayOptions.amount = this.amount.toString();
			this.razorPayOptions.description = this.description;
			this.dataForm.get('amount').setValue(this.amount);
			this.dataForm.get('notes').setValue(this.notes);
			this.dataForm.get('receipt').setValue(this.orderId || (Math.random() + 1).toString(36).substring(7));
		}

		if (changes['triggerManually'] && changes['triggerManually'].currentValue) {
			this.createRazorPay();
		}
	}

	createRazorPay() {
		this.spinnerService.start();
		// call api to create order_id
		this.razorPayService.createOrder(this.dataForm.value).subscribe({
			next: (result: any) => {
				// console.log("SUCCESS ORDER", result.data);
				this.razorPayOptions.order_id = result.data.value.id;
				const RazorPayCheckout = new this.razorPayService.nativeWindow.Razorpay(this.razorPayOptions);
				RazorPayCheckout.open();
				RazorPayCheckout.on('payment.cancel', this.cancelCallback);
				RazorPayCheckout.on('payment.failed', this.cancelCallback);
			},
			error: (error) => {
				console.log('ERROR ORDER', error);
				this.spinnerService.stop();
				this.toastService.error('Your transaction was cancelled, please retry again.');
			},
		});
	}
	cancelCallback = (error) => {
		console.log('ERROR', error);
		this.spinnerService.stop();
		this.toastService.error('Your transaction was cancelled');
	};
	successCallback = (response) => {
		console.log('RESPONSE handler', JSON.stringify(response));
		// this.verifyPayment(response);
		this.spinnerService.stop();
		this.toastService.success('Transaction has been completed');
		this.paymentMade.emit(true);
	};
	verifyPayment(response: any) {
		// call your backend api to verify payment signature & capture transaction
		let payload = {
			razorpay_order_id: response.razorpay_order_id,
			razorpay_payment_id: response.razorpay_payment_id,
			razorpay_signature: response.razorpay_signature,
			amount: this.dataForm.get('amount').value,
			currency: 'INR',
		};
		this.razorPayService.verifyPayment(payload).subscribe({
			next: (result: any) => {
				// console.log("SUCCESS VERIFY", JSON.stringify(result));
				this.spinnerService.stop();
				this.toastService.success(result.message);
				if (result.data) {
					this.paymentMade.emit(result.data);
				}
			},
			error: (error) => {
				console.log('ERROR VERIFY', error);
				this.spinnerService.stop();
				this.toastService.error('Your transaction was cancelled, please retry again.');
			},
		});
	}
}
