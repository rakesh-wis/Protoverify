import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from 'src/app/core/services/billing.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS, ROLES, verificationStatus } from 'src/app/helpers';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/models';
import { VERIFICATION_BASE_URL } from 'src/environments/environment';

@Component({
	selector: 'app-admin-billing-candidate-list',
	templateUrl: './admin-billing-candidate-list.component.html',
	styleUrl: './admin-billing-candidate-list.component.scss',
})
export class AdminBillingCandidateListComponent implements OnInit, OnChanges {
	@Input() filters: any;
	@Input() verificationStatus: string[];
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string }> = [
		{
			label: 'Candidate Name',
			value: 'name',
		},
		{
			label: 'Onboarding Date',
			value: 'createdAt',
		},
		{
			label: 'Closure Status',
			value: '',
		},
		{
			label: 'Amount',
			value: '',
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	OPTIONS = OPTIONS;
	assignedVerificationChecks: any = [];
	currentUser: User;
	ROLES = ROLES;
	VERIFICATION_BASE_URL = VERIFICATION_BASE_URL;
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private billingService: BillingService,
		private verificationDetailsService: VerificationDetailsService,
		private userService: UserService
	) {
		this.currentUser = this.userService.getCurrentUser();
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {}
	private areFiltersEqual(prevFilters: any, currentFilters: any): boolean {
		return JSON.stringify(prevFilters) === JSON.stringify(currentFilters);
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes['verificationStatus'] &&
			this.verificationStatus &&
			this.verificationStatus.includes(verificationStatus.PROTO_VERIFIED)
		) {
			!this.headerColumn.map((e) => e.label).includes('Invoice Id') &&
				this.headerColumn.unshift({
					label: 'Invoice Id',
					value: '',
				});
			!this.headerColumn.map((e) => e.label).includes('Client') &&
				this.headerColumn.push(
					...[
						{
							label: 'Client',
							value: '',
						},
						{
							label: 'Billing Date',
							value: '',
						},
					]
				);
		} else {
			!this.headerColumn.map((e) => e.label).includes('Client') &&
				this.headerColumn.push(
					...[
						{
							label: 'Pending',
							value: '',
						},
						{
							label: 'Client',
							value: '',
						},
					]
				);
		}
		if (
			changes['filters'] &&
			!this.areFiltersEqual(changes['filters'].previousValue, changes['filters'].currentValue)
		) {
			this.loadData(this.filters);
		}
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
			verificationStatus: this.verificationStatus,
		};
		this.spinnerService.start();
		this.billingService.employeeList(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.dataList['rows'].forEach((element) => {
					this.verificationDetailsService.verificationCount({ userId: element.id }).subscribe({
						next: (verificationResult) => {
							element['verificationCount'] = verificationResult.data;
						},
					});
				});
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	updatePageRoute() {
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: { page: this.page },
			queryParamsHandling: 'merge',
		});
	}
	onPageChange(event): void {
		this.page = event?.page;
		this.updatePageRoute();
		this.loadData();
	}

	getClass(item): string {
		const percentage = parseInt(item?.verificationCount?.percentage);
		if (percentage >= 80) {
			return 'progress-bar-100';
		} else if (percentage < 80 && percentage >= 50) {
			return 'progress-bar-50';
		} else {
			return 'progress-bar-20';
		}
	}
	getDaysDiff(date: any): number {
		const currentDate = new Date();
		const createdAt = new Date(date);
		const timeDifference = currentDate.getTime() - createdAt.getTime();
		return Math.floor(timeDifference / (1000 * 3600 * 24));
	}
	getDateRange(days: number): string {
		if (Math.round(days / 5) * 5 == Math.ceil(days / 5) * 5) {
			return Math.ceil(days / 5) * 5 - 5 + '-' + Math.ceil(days / 5) * 5 + ' days';
		}
		return Math.round(days / 5) * 5 + '-' + Math.ceil(days / 5) * 5 + ' days';
	}

	checkAllDocumentAreSubmitted(item): boolean {
		return item?.every((element) => element.checked);
	}
	getPendingCount(item): Number {
		return item?.reduce((acc, curr) => (!curr.checked ? (acc += 1) : (acc += 0)), 0);
	}
	navigateToVerificationPage(employee, verification): void {
		let path = 'direct';
		this.router.navigate([`/${path}-verification/${employee['id']}/${verification.path}`], {
			queryParams: { id: employee['id'], name: employee['name'] },
		});
	}
}
