import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { VendorLinkGenerateComponent } from './vendor-link-generate/vendor-link-generate.component';

@NgModule({
	declarations: [
		VendorListComponent,
		VendorDetailsComponent,
		VendorLinkGenerateComponent,
	],
	imports: [CommonModule, VendorRoutingModule, SharedModule],
})
export class VendorModule {}
