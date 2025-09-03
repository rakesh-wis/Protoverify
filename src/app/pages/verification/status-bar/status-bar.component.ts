import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { planFeatures, ROLES } from 'src/app/helpers';
import { User } from 'src/app/models';

@Component({
	selector: 'app-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit {
	@Input() inputData: any = null;
	@Input() startText: string = 'Document';
	@Input() currentUser: User;
	@Input() checkName: string;
	roles = ROLES;
	planFeatures = planFeatures;
	constructor() {}

	ngOnInit(): void {}
}
