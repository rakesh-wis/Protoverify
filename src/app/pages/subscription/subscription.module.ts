import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubscriptionCurrentComponent } from './subscription-current/subscription-current.component';
import { SubscriptionViewComponent } from './subscription-view/subscription-view.component';

@NgModule({
	declarations: [SubscriptionListComponent, SubscriptionCurrentComponent, SubscriptionViewComponent],
	imports: [CommonModule, SubscriptionRoutingModule, SharedModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SubscriptionModule {}
