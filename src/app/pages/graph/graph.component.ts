import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
@Component({
	selector: 'app-graph',
	templateUrl: './graph.component.html',
	styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnInit, OnChanges {
	@Input() chartLabels: string[] = [];
	@Input() chartDataSets: ChartDataset[] = [];
	@Input() chartType: ChartType = 'line';
	@Input() chartOptions: ChartOptions = {};

	constructor() {}
	ngOnInit(): void {}
	ngOnChanges(changes: SimpleChanges): void {
		let charDataChange = changes['chartDataSets'];
		this.chartDataSets = charDataChange.currentValue;
		this.chartOptions = changes['chartOptions'].currentValue;
	}
}
