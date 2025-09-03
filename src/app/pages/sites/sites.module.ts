import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitesRoutingModule } from './sites-routing.module';
import { SitesListComponent } from './sites-list/sites-list.component';
import { SitesDetailsComponent } from './sites-details/sites-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SitesContentComponent } from './sites-content/sites-content.component';
import { ClientConfigurationLeaveManagementComponent } from './client-configuration-leave-management/client-configuration-leave-management.component';
import { ClientConfigurationCheckinTimeListComponent } from './client-configuration-checkin-time-list/client-configuration-checkin-time-list.component';
import { ClientConfigurationTimeShiftComponent } from './client-configuration-time-shift/client-configuration-time-shift.component';
import { ClientConfigurationManageHolidayComponent } from './client-configuration-manage-holiday/client-configuration-manage-holiday.component';
import { ViewLogCheckinTimeComponent } from './view-log-checkin-time/view-log-checkin-time.component';
import { SitesUploadComponent } from './sites-upload/sites-upload.component';
import { SitesLocationComponent } from './sites-location/sites-location.component';
import { GoogleMapModule } from '../google-map/google-map.module';

@NgModule({
	declarations: [
		SitesListComponent,
		SitesDetailsComponent,
		SitesContentComponent,
		ClientConfigurationLeaveManagementComponent,
		ClientConfigurationTimeShiftComponent,
		ClientConfigurationManageHolidayComponent,
		ClientConfigurationCheckinTimeListComponent,
		ViewLogCheckinTimeComponent,
		SitesUploadComponent,
		SitesLocationComponent,
	],
	imports: [CommonModule, SitesRoutingModule, SharedModule, GoogleMapModule],
	exports: [SitesListComponent, SitesDetailsComponent, SitesContentComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SitesModule {}
