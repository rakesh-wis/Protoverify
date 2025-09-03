import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingRoutingModule } from './billing-routing.module';
import { BillingListComponent } from './billing-list/billing-list.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
	declarations: [BillingListComponent],
	imports: [CommonModule, BillingRoutingModule, SharedModule],
})
export class BillingModule {}
