import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegionsRoutingModule } from './regions-routing.module';
import { RegionsListComponent } from './regions-list/regions-list.component';
import { RegionsDetailsComponent } from './regions-details/regions-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
	declarations: [RegionsListComponent, RegionsDetailsComponent],
	imports: [CommonModule, RegionsRoutingModule, SharedModule],
	exports: [RegionsListComponent, RegionsDetailsComponent],
})
export class RegionsModule {}
