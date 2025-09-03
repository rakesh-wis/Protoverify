import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapComponent } from './google-map.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { GoogleMapsModule } from '@angular/google-maps'; // Importing GoogleMapModule

@NgModule({
	declarations: [GoogleMapComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	imports: [CommonModule, NgbModule, GoogleMapsModule, SharedModule],
	exports: [GoogleMapComponent],
})
export class GoogleMapModule {}
