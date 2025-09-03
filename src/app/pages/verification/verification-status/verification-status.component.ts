import { Component, OnInit } from '@angular/core';
import { verificationLevelList } from 'src/app/helpers';

@Component({
	selector: 'app-verification-status',
	templateUrl: './verification-status.component.html',
	styleUrls: ['./verification-status.component.scss'],
})
export class VerificationStatusComponent implements OnInit {
	verificationLevelList = verificationLevelList;
	constructor() {}

	ngOnInit(): void {}

	getVerificationIcon(item) {
		return `./assets/icons/verification/${item?.name}.svg`;
	}
}
