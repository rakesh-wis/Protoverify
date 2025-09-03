import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { validateField } from 'src/app/shared/validators/form.validator';
import { RazorPayService } from 'src/app/core/services/razorpay.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from 'src/app/core';
import { ROLES } from 'src/app/helpers';

@Component({
	selector: 'app-wallet-recharge',
	templateUrl: './wallet-recharge.component.html',
	styleUrls: ['./wallet-recharge.component.scss'],
	providers: [RazorPayService],
})
export class WalletRechargeComponent implements OnInit {
	@Input() userId!: number;
	currentUser: any;
	roles = ROLES;
	amountList = [
		{
			value: '2000',
			placeholder: '₹ 2000',
			readonly: true,
			selected: true,
		},
		{
			value: '5000',
			placeholder: '₹ 5000',
			readonly: true,
			selected: false,
		},
		{
			value: '10000',
			placeholder: '₹ 10000',
			readonly: true,
			selected: false,
		},
		{
			value: null,
			placeholder: 'Enter Amount',
			readonly: false,
			selected: false,
		},
	];
	dataForm = new FormGroup({
		amount: new FormControl(null, [Validators.required]),
		notes: new FormControl(),
		triggerManually: new FormControl(false),
		userId: new FormControl(this.userId),
	});
	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private razorPayService: RazorPayService,
		private toastService: ToastService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.dataForm.controls['userId'].setValue(this.userId);
		this.currentUser = this.userService.getCurrentUser();
	}

	closeModal() {
		this.activeModal.close('close with cancel button');
	}

	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}

	onSelectRadioButton($event, index: number): void {
		this.amountList.map((e) => (e.selected = false));
		this.amountList[index].selected = true;
		if (!$event.target.value) {
			this.dataForm.get('amount').setValue(null);
			this.dataForm.get('triggerManually').setValue(false);
		}
	}

	onSubmit($event): void {
		console.log($event);
		this.closeModal();
	}
	openRazorPay(): void {
		const price = this.amountList.find((e) => e.selected).value;
		this.dataForm.get('amount').setValue(parseInt(price, 10));
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		if ([ROLES.PROTO_SUPER_ADMIN].includes(this.currentUser.role)) {
			this.manualPayment();
		} else {
			this.dataForm.get('triggerManually').setValue(false);
			console.log(this.dataForm.getRawValue());
			this.dataForm.get('triggerManually').setValue(true);
		}
	}
	manualPayment(): void {
		const payload = this.dataForm.value;
		delete payload.triggerManually;
		delete payload.notes;
		this.razorPayService.manualPayment(payload).subscribe({
			next: (result: any) => {
				console.log('SUCCESS', result);
				this.closeModal();
				this.toastService.success(result.message);
			},
			error: (error) => {
				console.log('ERROR', error);
				this.toastService.error(error);
			},
		});
	}
}
