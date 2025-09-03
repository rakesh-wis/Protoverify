import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpCenterRoutingModule } from './help-center-routing.module';
import { HelpCenterComponent } from './help-center/help-center.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewFaqComponent } from './view-faq/view-faq.component';
import { ViewContactUsComponent } from './view-contact-us/view-contact-us.component';
import { HelpCenterDetailsComponent } from './help-center-details/help-center-details.component';
import { ViewFaqDetailsComponent } from './view-faq-details/view-faq-details.component';
import { ContactUsDetailsComponent } from './contact-us-details/contact-us-details.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
	declarations: [
		HelpCenterComponent,
		ViewFaqComponent,
		ViewContactUsComponent,
		HelpCenterDetailsComponent,
		ViewFaqDetailsComponent,
		ContactUsDetailsComponent,
	],
	imports: [CommonModule, HelpCenterRoutingModule, NgbAccordionModule, SharedModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HelpCenterModule {}
