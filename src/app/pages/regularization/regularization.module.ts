import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegularizationRoutingModule } from './regularization-routing.module';
import { RegularizationListComponent } from './regularization-list/regularization-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RegularizationUploadComponent } from './regularization-upload/regularization-upload.component';

@NgModule({
	declarations: [RegularizationListComponent, RegularizationUploadComponent],
	imports: [CommonModule, RegularizationRoutingModule, SharedModule],
})
export class RegularizationModule {}
