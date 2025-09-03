import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WalletRoutingModule } from './wallet-routing.module';
import { WalletListComponent } from './wallet-list/wallet-list.component';
import { SharedModule } from '../../shared/shared.module';
import { WalletRechargeComponent } from './wallet-recharge/wallet-recharge.component';
import { RazorPayPaymentModule } from '../razorPay-ppayment/razorPay-payment.module';

@NgModule({
	declarations: [WalletListComponent, WalletRechargeComponent],
	imports: [CommonModule, WalletRoutingModule, SharedModule, RazorPayPaymentModule],
})
export class WalletModule {}
