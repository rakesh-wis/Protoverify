import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminBillingRoutingModule } from './admin-billing-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminBillingComponent } from './admin-billing.component';
import { AdminBillingCandidateListComponent } from './admin-billing-candidate-list/admin-billing-candidate-list.component';
import { AdminBillingClientInvoiceListComponent } from './admin-billing-client-invoice-list/admin-billing-client-invoice-list.component';
import { VerificationStatusPopoverComponent } from '../verification/verification-status-popover/verification-status-popover.component';

@NgModule({
	declarations: [AdminBillingComponent, AdminBillingCandidateListComponent, AdminBillingClientInvoiceListComponent],
	imports: [CommonModule, AdminBillingRoutingModule, SharedModule, VerificationStatusPopoverComponent],
})
export class AdminBillingModule {}
