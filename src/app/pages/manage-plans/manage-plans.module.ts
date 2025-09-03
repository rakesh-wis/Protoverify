import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagePlansRoutingModule } from './manage-plans-routing.module';
import { ManagePlansListComponent } from './manage-plans-list/manage-plans-list.component';
import { ManagePlansDetailsComponent } from './manage-plans-details/manage-plans-details.component';
import { ManagePlansCardComponent } from './manage-plans-card/manage-plans-card.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManagePlanRequestListComponent } from './manage-plan-request-list/manage-plan-request-list.component';
import { ManagePlanRequestDetailsComponent } from './manage-plan-request-details/manage-plan-request-details.component';
import { ManagePlansViewComponent } from './manage-plans-view/manage-plans-view.component';
import { ManagePlansComponent } from './manage-plans.component';
import { ManagePlansStandardListComponent } from './manage-plans-standard-list/manage-plans-standard-list.component';

@NgModule({
	declarations: [
		ManagePlansListComponent,
		ManagePlansDetailsComponent,
		ManagePlansCardComponent,
		ManagePlanRequestListComponent,
		ManagePlanRequestDetailsComponent,
		ManagePlansViewComponent,
		ManagePlansComponent,
		ManagePlansStandardListComponent,
	],
	imports: [CommonModule, ManagePlansRoutingModule, SharedModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ManagePlansModule {}
