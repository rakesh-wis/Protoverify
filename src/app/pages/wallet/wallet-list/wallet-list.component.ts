import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OPTIONS, connectionType, planModulesFeatures } from '../../../helpers/constants.helper';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';
import { WalletRechargeComponent } from '../wallet-recharge/wallet-recharge.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ROLES } from 'src/app/helpers';
import {  UserService } from 'src/app/core';



@Component({
	selector: 'app-wallet-list',
	templateUrl: './wallet-list.component.html',
	styleUrls: ['./wallet-list.component.scss'],
})
export class WalletListComponent implements OnInit {
	statsCards = [
		{
			icon: './assets/icons/dashboard/completed-verification.svg',
			label: 'Initiated Verifications',
			type: 'text',
			walletType: [connectionType.PRE_PAID, connectionType.POST_PAID],
			value: 0,
		},
		{
			icon: './assets/icons/dashboard/revenue.svg',
			label: 'Amount Used',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.PRE_PAID],
			value: 0,
		},
		{
			icon: './assets/icons/dashboard/upcoming-renewal.svg',
			label: 'Remaining Wallet Balance',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.PRE_PAID],
			value: 0,
			suffix: '',
		},
		{
			icon: './assets/icons/dashboard/upcoming-renewal.svg',
			label: 'Amount due',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.POST_PAID],
			value: 0,
			suffix: `${moment().format('MMMM')}`,
		},
		{
			icon: './assets/icons/dashboard/pay-now.svg',
			label: 'Pay Now',
			type: 'button',
			prefix: '₹ ',
			walletType: [connectionType.POST_PAID],
			value: 0,
			suffix: `${moment().subtract(1, 'month').format('MMMM')}`,
		},
	];
	userWallet: any = {};
	userBill: any = {};
	connectionType = connectionType;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	dataList: any = {
		data: [],
		count: -1,
	};
	userId: number;
	OPTIONS = OPTIONS;
	VERIFICATION_BASE_URL = `${VERIFICATION_BASE_URL}/assets/verification/active/`;
	roles = ROLES;
	currentUser: any;
	dataForm = new FormGroup({
		amount: new FormControl('', [Validators.required]),
		notes: new FormControl(),
		triggerManually: new FormControl(false),
	});
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private subscriptionService: SubscriptionService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private modalService: NgbModal,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.loadData();
		this.getWallet();
	}

	getVerificationTitle(item) {
		return planModulesFeatures.find((e) => e.value === item.title)?.title;
	}

	getWallet(): void {
		this.subscriptionService.getWallet({}).subscribe({
			next: (result) => {
				this.userWallet = result.data['wallet'];
				if (this.userWallet && this.userWallet?.walletType === connectionType.POST_PAID) {
					this.userBill = result.data.billing;
					this.statsCards[4].value = this.userBill ? this.userBill?.totalAmount : 0;
				}
				this.statsCards[3].value = this.userWallet.amountDue;
				this.statsCards[2].value = this.userWallet.currentBalance;
				this.statsCards[1].value = this.userWallet.amountUsed;
				this.userId = this.userWallet?.userId;
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.subscriptionService.employeeVerificationList(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				this.statsCards[0].value = this.collectionSize;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onPageChange(event): void {
		this.page = event?.page;
		this.updatePageRoute();
		this.loadData();
	}

	updatePageRoute() {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page },
			queryParamsHandling: 'merge',
		});
	}

	payBalanceAmount() {
		this.dataForm.get('amount')?.setValue(this.userBill?.totalAmount);
		this.dataForm.get('notes')?.setValue({ billId: this.userBill?.id });
		this.dataForm.get('triggerManually').setValue(true);
	}

	refresh($event) {
		this.getWallet();
	}

	openRechargeWallet() {
		const modalRef = this.modalService.open(WalletRechargeComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.notes = {};
		modalRef.componentInstance.userId = this.userId;
		modalRef.result.then(
			(result) => {
				this.getWallet();
			},
			(dismiss) => {}
		);
	}
}
