import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-custom-progress',
	templateUrl: './custom-progress.component.html',
	styleUrls: ['./custom-progress.component.scss'],
})
export class CustomProgressComponent implements OnInit {
	@Input() percentage: any;
	@Input() customClass: string;
	constructor() {}

	ngOnInit(): void {}

	getPercentage(value: number = 0) {
		return 'width: ' + value + '%';
	}
}
