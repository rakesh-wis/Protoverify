import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { planFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-sites-content',
	templateUrl: './sites-content.component.html',
	styleUrls: ['./sites-content.component.scss'],
})
export class SitesContentComponent implements OnInit {
	private iconsList: string[] = ['pen-note-edit'];
	sitesId = null;
	planItems: string[] = [];
	planFeatures = planFeatures;
	constructor(
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private activatedRoute: ActivatedRoute,
		private subscriptionService: SubscriptionService
	) {
		this.registerIcons();
		this.subscriptionService.userPlan.subscribe((plan) => {
			if (plan && plan.length > 0) {
				this.planItems = plan.map((plan) => [...new Set([...this.planItems, ...plan.features])]);
			}
		});
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.sitesId = params['id'];
			}
		});
	}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}

	showItems(item): boolean {
		return this.planItems.includes(item);
	}
}
