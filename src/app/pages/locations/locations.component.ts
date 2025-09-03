import { Component, OnInit, ViewChild } from '@angular/core';
import { RegionsListComponent } from '../regions/regions-list/regions-list.component';
import { SitesListComponent } from '../sites/sites-list/sites-list.component';
import { FormGroup, FormControl } from '@angular/forms';
import { defaultStatus } from 'src/app/helpers';

@Component({
	selector: 'app-locations',
	templateUrl: './locations.component.html',
	styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Block', name: defaultStatus.BLOCKED },
	];
	selectedTab: string = 'regions';
	@ViewChild('regionListComponent', { static: false }) regionListComponent: RegionsListComponent;
	@ViewChild('sitesListComponent', { static: false }) sitesListComponent: SitesListComponent;
	filterForm = new FormGroup({
		search: new FormControl(''),
		status: new FormControl('all'),
	});
	constructor() {}

	ngOnInit(): void {}

	addLocation() {
		if (this.selectedTab === 'regions') {
			this.regionListComponent.add();
		} else {
			this.sitesListComponent.add();
		}
	}
	clearFormField() {
		this.filterForm.reset();
		this.filterForm.get('search').setValue('');
		this.filterForm.get('status').setValue('all');
	}
	clearFilter() {
		this.clearFormField();
		if (this.selectedTab === 'regions') {
			this.regionListComponent.clearFilter();
		} else {
			this.sitesListComponent.clearFilter();
		}
	}
	applyFilters() {
		if (this.selectedTab === 'regions') {
			this.regionListComponent.applyFilters(this.filterForm.getRawValue());
		} else {
			this.sitesListComponent.applyFilters(this.filterForm.getRawValue());
		}
	}
}
