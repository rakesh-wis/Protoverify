import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ROLES, connectionType, verificationStatus } from 'src/app/helpers';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
	selector: 'app-dashboard-stats',
	templateUrl: './dashboard-stats.component.html',
	styleUrls: ['./dashboard-stats.component.scss'],
})
export class DashboardStatsComponent implements OnInit {
	adminStats = [
		{
			icon: './assets/icons/dashboard/client.svg',
			lineIcon: './assets/icons/dashboard/orange-line.svg',
			label: 'Clients',
			category: 'client',
			path: '/clients',
			value: 0,
			visibleRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			icon: './assets/icons/dashboard/pending-verification.svg',
			lineIcon: './assets/icons/dashboard/red-line.svg',
			label: 'Pending Verifications',
			category: 'pending',
			path: `/direct-verification/list?verificationStatus=${verificationStatus.DID_NOT_VERIFY}&verificationStatus=${verificationStatus.PARTIALLY_VERIFIED}`,
			value: 0,
			visibleRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			icon: './assets/icons/dashboard/admin-completed-verification.svg',
			lineIcon: './assets/icons/dashboard/yellow-line.svg',
			label: 'Completed Verifications',
			category: 'completed',
			path: `/direct-verification/list?verificationStatus=${verificationStatus.PROTO_VERIFIED}`,
			value: 0,
			visibleRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			icon: './assets/icons/dashboard/admin-revenue.svg',
			lineIcon: './assets/icons/dashboard/bluish-line.svg',
			label: 'Revenue',
			category: 'revenue',
			subTitle: 'This month',
			value: 0,
			visibleRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER],
		},
		{
			icon: './assets/icons/dashboard/pdf-co-balance.svg',
			lineIcon: './assets/icons/dashboard/blue-line.svg',
			label: 'PDF Co. balance',
			category: 'pdfco',
			value: 0,
			visibleRole: [ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN],
		},
	];
	clintStats = [
		{
			icon: './assets/icons/dashboard/pending-verification.svg',
			// lineIcon: './assets/icons/dashboard/purple-line.svg',
			label: 'Pending Verifications',
			category: 'pending',
			walletType: [connectionType.PRE_PAID, connectionType.POST_PAID],
			path: `/start-verification/list?verificationStatus=${verificationStatus.DID_NOT_VERIFY}&verificationStatus=${verificationStatus.PARTIALLY_VERIFIED}`,
			value: 0,
			visibleRole: [...ROLES.getWebArray()],
		},
		{
			icon: './assets/icons/dashboard/completed-verification.svg',
			// lineIcon: './assets/icons/dashboard/blue-line.svg',
			label: 'Completed Verifications',
			category: 'completed',
			walletType: [connectionType.PRE_PAID, connectionType.POST_PAID],
			path: `/start-verification/list?verificationStatus=${verificationStatus.PROTO_VERIFIED}`,
			value: 0,
			visibleRole: [...ROLES.getWebArray()],
		},
		{
			icon: './assets/icons/dashboard/revenue.svg',
			label: 'Amount Used',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.PRE_PAID],
			value: 0,
			visibleRole: [...ROLES.getWebArray()],
		},
		{
			icon: './assets/icons/dashboard/upcoming-renewal.svg',
			label: 'Remaining Wallet Balance',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.PRE_PAID],
			value: 0,
			suffix: '',
			visibleRole: [...ROLES.getWebArray()],
		},
		{
			icon: './assets/icons/dashboard/upcoming-renewal.svg',
			label: 'Amount due',
			type: 'text',
			prefix: '₹ ',
			walletType: [connectionType.POST_PAID],
			value: 0,
			suffix: `${moment().format('MMMM')}`,
			visibleRole: [...ROLES.getWebArray()],
		},
		// {
		// 	icon: './assets/icons/dashboard/pay-now.svg',
		// 	label: 'Pay Now',
		// 	type: 'text',
		// 	prefix: '₹ ',
		// 	walletType: [connectionType.POST_PAID],
		// 	value: 0,
		// 	suffix: `${moment().subtract(1, 'month').format('MMMM')}`,
		// },
	];
	statsCards: any = [];
	userWallet: any = {};
	userBill: any = {};
	currentUser: any;
	isRoleAccess: boolean = false;

	constructor(
		private toastService: ToastService,
		private userService: UserService,
		private sharedService: SharedService,
		private dashboardService: DashboardService,
		private subscriptionService: SubscriptionService,
		private route: Router
	) {
		this.currentUser = this.userService.getCurrentUser();
		this.isRoleAccess =
			ROLES.getClientArray(true).includes(this.currentUser.role) || !!sessionStorage.getItem('clientId');
	}

	ngOnInit(): void {
		this.statsCards =
			ROLES.getAdminArray().includes(this.currentUser.role) && !sessionStorage.getItem('clientId')
				? this.adminStats
				: this.clintStats;
		this.getVerificationStats();
		if (ROLES.getAdminArray().includes(this.currentUser.role) && !sessionStorage.getItem('clientId')) {
			this.getClientStats();
			this.getSubScriptionStats();
			this.getPdfCoBalance();
		} else {
			this.getWallet();
		}
	}
	getVerificationStats(): void {
		this.dashboardService.getVerificationStats({}).subscribe({
			next: ({ data }) => {
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'completed')].value = data.reduce(
					(accumulator, currentValue) =>
						accumulator +
						(currentValue.verificationStatus === verificationStatus.PROTO_VERIFIED
							? currentValue.count
							: 0),
					0
				);
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'pending')].value = data.reduce(
					(accumulator, currentValue) =>
						accumulator +
						([verificationStatus.DID_NOT_VERIFY, verificationStatus.PARTIALLY_VERIFIED].includes(
							currentValue.verificationStatus
						)
							? currentValue.count
							: 0),
					0
				);
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
	getClientStats(): void {
		this.dashboardService.getClientStats({}).subscribe({
			next: ({ data }) => {
				this.statsCards[this.statsCards.findIndex((x) => x.category === 'client')].value = data.activeClient;
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
	getSubScriptionStats(): void {
		this.dashboardService.getWalletStats({}).subscribe({
			next: ({ data }) => {
				this.statsCards[3].value = data.totalRevenue || 0;
			},
		});
	}
	getWallet(): void {
		this.subscriptionService.getWallet({}).subscribe({
			next: (result) => {
				this.userWallet = result.data['wallet'];
				if (this.userWallet && this.userWallet?.walletType === connectionType.POST_PAID) {
					this.userBill = result.data.billing;
					// this.statsCards[4].value = this.userBill?.totalAmount || 0;
				}
				this.statsCards[4].value = this.userWallet.amountDue;
				this.statsCards[3].value = this.userWallet.currentBalance;
				this.statsCards[2].value = this.userWallet.amountUsed;
			},
		});
	}

	getPdfCoBalance(): void {
		this.sharedService.getPdfCoBalance().subscribe({
			next: ({ data }) => {
				this.statsCards[4].value = data.remainingCredits;
			},
		});
	}

	navigateTo(path) {
		if (path) {
			this.route.navigateByUrl(path);
		}
	}
}
