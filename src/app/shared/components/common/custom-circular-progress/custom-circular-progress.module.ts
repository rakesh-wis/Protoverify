import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomCircularProgressComponent } from './custom-circular-progress.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
	declarations: [CustomCircularProgressComponent],
	imports: [
		CommonModule,
		NgCircleProgressModule.forRoot({
			// set defaults here
			radius: 100,
			outerStrokeWidth: 16,
			innerStrokeWidth: 8,
			outerStrokeColor: '#78C000',
			// innerStrokeColor: '#C7E596',
			animationDuration: 300,
		}),
	],
	exports: [CustomCircularProgressComponent],
	providers: [],
})
export class CustomCircularProgressModule {}
