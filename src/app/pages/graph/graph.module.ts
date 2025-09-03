import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from './graph.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
	declarations: [GraphComponent],
	imports: [CommonModule, NgChartsModule],
	exports: [GraphComponent],
})
export class GraphModule {}
