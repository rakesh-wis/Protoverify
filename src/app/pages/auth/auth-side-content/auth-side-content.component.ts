import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-auth-side-content',
	templateUrl: './auth-side-content.component.html',
	styleUrls: ['./auth-side-content.component.scss'],
	providers: [NgbCarouselConfig], // add NgbCarouselConfig to the component providers
})
export class AuthSideContentComponent implements OnInit {
	dataList = [
		{
			image: 'assets/images/01-slider.png',
			title: 'Trust, but Verify',
			description: 'Pre-employment screening for a safer workplace',
		},
		{
			image: 'assets/images/02-slider.svg',
			title: 'Trust, but Verify',
			description: 'Pre-employment screening for a safer workplace',
		},
		{
			image: 'assets/images/03-slider.svg',
			title: 'Trust, but Verify',
			description: 'Pre-employment screening for a safer workplace',
		},
	];
	constructor(config: NgbCarouselConfig) {
		config.interval = 1000;
		config.wrap = false;
		config.keyboard = false;
		config.pauseOnHover = false;
		config.showNavigationArrows = false;
		config.showNavigationIndicators = true;
	}

	ngOnInit(): void {}
}
