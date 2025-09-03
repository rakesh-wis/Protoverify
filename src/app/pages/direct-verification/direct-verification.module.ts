import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectVerificationRoutingModule } from './direct-verification-routing.module';
import { DirectVerificationListComponent } from './direct-verification-list/direct-verification-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { VerificationModule } from '../verification/verification.module';
import { VerificationStatusPopoverComponent } from '../verification/verification-status-popover/verification-status-popover.component';

@NgModule({
	declarations: [DirectVerificationListComponent],
	imports: [
		CommonModule,
		DirectVerificationRoutingModule,
		SharedModule,
		VerificationModule,
		VerificationStatusPopoverComponent,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DirectVerificationModule {}
