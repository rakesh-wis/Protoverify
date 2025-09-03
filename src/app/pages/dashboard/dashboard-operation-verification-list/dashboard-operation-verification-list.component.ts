import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VerificationTicketsByChecksComponent } from './verification-tickets-by-checks/verification-tickets-by-checks.component';
import { AllVerificationsComponent } from './all-verifications/all-verifications.component';

@Component({
	selector: 'app-dashboard-operation-verification-list',
	templateUrl: './dashboard-operation-verification-list.component.html',
	styleUrls: ['./dashboard-operation-verification-list.component.scss'],
})
export class DashboardOperationVerificationListComponent implements OnInit {
	@ViewChild('VerificationTicketsByChecksComponent', { static: false })
	VerificationTicketsByChecksComponent: VerificationTicketsByChecksComponent;

	@ViewChild('AllVerificationsComponent', { static: false })
	AllVerificationsComponent: AllVerificationsComponent;

	selectedTab: number = 0;

	constructor(private router: Router) {}

	ngOnInit(): void {}

	navigateTo(path) {
		this.router.navigateByUrl(path);
	}
}
