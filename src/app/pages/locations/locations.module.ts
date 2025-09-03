import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationsRoutingModule } from './locations-routing.module';

import { LocationsComponent } from './locations.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SitesModule } from '../sites/sites.module';
import { RegionsModule } from '../regions/regions.module';

@NgModule({
	declarations: [LocationsComponent],
	imports: [CommonModule, LocationsRoutingModule, SharedModule, SitesModule, RegionsModule],
})
export class LocationsModule {}
