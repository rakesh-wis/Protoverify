import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { planModulesFeatures } from 'src/app/helpers';

interface Features {
	value: string;
	label: string;
}

interface PlanModulesFeaturesGroup {
	disabled?: boolean;
	label: string;
	features: Features[];
}

@Component({
	selector: 'app-plan-features',
	templateUrl: './plan-features.component.html',
	styleUrls: ['./plan-features.component.scss'],
})
export class PlanFeaturesComponent implements OnInit, OnChanges {
	pokemonControl = new FormControl('');
	planModuleFeatureGroup = planModulesFeatures;
	// @Input() itemsGroup: PlanModulesFeaturesGroup;
	@Input() modules: any;
	ItemsGroups = [];

	constructor() {}

	ngOnInit(): void {
		console.log('input', this.modules);
	}

	ngOnChanges(changes: SimpleChanges): void {
		console.log('in change', this.modules);
		if (changes['modules'] && this.modules) {
			const feature = this.planModuleFeatureGroup.find((item) => {
				console.log('df', item.value);
				return this.modules.includes(item.value);
			});
			this.ItemsGroups.push(feature);
		}
		console.log('ites', this.ItemsGroups);
	}
}
