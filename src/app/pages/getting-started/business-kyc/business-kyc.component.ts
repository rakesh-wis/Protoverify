import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAccordionItem } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { BusinessDetailsService } from 'src/app/core/services/business-details.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ROLES } from 'src/app/helpers';
import { User } from 'src/app/models';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-business-kyc',
	templateUrl: './business-kyc.component.html',
	styleUrls: ['./business-kyc.component.scss'],
})
export class BusinessKycComponent implements OnInit {
	dataList = [
		{
			label: 'Business Details',
			key: 1,
		},
		// {
		// 	label: 'Business Documents',
		// 	key: 2,
		// },
		// {
		// 	label: 'Registered Address',
		// 	key: 3,
		// },
	];

	selectedAccordion: number = 1;
	@ViewChild('accordion', { static: true }) accordion: any;
	currentUser: User;
	userId: number;
	constructor(private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		this.userService.currentUser.subscribe((data) => {
			this.currentUser = data;
			if (
				window.sessionStorage.getItem('clientId') &&
				[ROLES.PROTO_SUPER_ADMIN, ROLES.PROTO_ADMIN, ROLES.PROTO_USER].includes(this.currentUser.role)
			) {
				this.userId = parseInt(window.sessionStorage.getItem('clientId'));
			} else if (![ROLES.CLIENT_SUPER_ADMIN].includes(this.currentUser.role)) {
				this.userId = this.currentUser.associateId;
			} else {
				this.userId = this.currentUser.id;
			}
		});
	}

	selectAccordion(index: number) {
		if (index < 1) {
			this.selectedAccordion = index;
			// this.accordion.expand(`panel-${index}`);
		} else {
			this.router.navigateByUrl('getting-started/explore-plans');
		}
	}
}
