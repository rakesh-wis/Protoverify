import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StartVerificationRoutingModule } from './start-verification-routing.module';
import { StartVerificationListComponent } from './start-verification-list/start-verification-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { VerificationModule } from '../verification/verification.module';
import { VerificationStatusPopoverComponent } from '../verification/verification-status-popover/verification-status-popover.component';

@NgModule({
	declarations: [StartVerificationListComponent],
	imports: [
		CommonModule,
		StartVerificationRoutingModule,
		SharedModule,
		VerificationModule,
		VerificationStatusPopoverComponent,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StartVerificationModule {}
