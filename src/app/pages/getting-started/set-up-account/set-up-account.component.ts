import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { defaultStatus } from 'src/app/helpers';

@Component({
	selector: 'app-set-up-account',
	templateUrl: './set-up-account.component.html',
	styleUrls: ['./set-up-account.component.scss'],
})
export class SetUpAccountComponent implements OnInit {
	showBusiness: boolean = false;
	constructor(private location: Location, private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		this.showBusiness = this.userService.getCurrentUser().status === defaultStatus.ACTIVE;
	}

	toggleShowBusiness(): void {
		this.showBusiness = !this.showBusiness;
	}

	goBack(): void {
		this.location.back();
	}

	navigateTo(): void {
		this.router.navigateByUrl('getting-started/business-kyc');
	}
}
