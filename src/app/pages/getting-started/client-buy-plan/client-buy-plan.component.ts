import { Location } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { PlanService } from 'src/app/core/services/plan.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { confirmMessages, monthDropdown, planModulesFeatures, yearDropdown } from 'src/app/helpers';
import { connectionType } from '../../../helpers/constants.helper';

@Component({
	selector: 'app-client-buy-plan',
	templateUrl: './client-buy-plan.component.html',
	styleUrls: ['./client-buy-plan.component.scss'],
})
export class ClientBuyPlanComponent implements OnInit {
	plan: any;
	public params: any = null;
	planId: any = null;
	dataForm = new FormGroup({
		planId: new FormControl(),
		isPaid: new FormControl(false),
		totalAmount: new FormControl(),
		noOfVerification: new FormControl(),
		amountPerVerification: new FormControl(),
		amount: new FormControl(),
		interval: new FormControl(1),
		paymentDetails: new FormControl(),
	});
	notes: any = {};
	connectionType = connectionType;
	constructor(
		private spinnerService: SpinnerService,
		private planService: PlanService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute,
		private location: Location,
		private subscriptionService: SubscriptionService,
		private userService: UserService,
		private zone: NgZone,
		private router: Router
	) {}

	get form() {
		return this.dataForm.controls;
	}

	ngOnInit(): void {
		this.userService.currentUser.subscribe((data) => {
			this.notes = {
				role: data.role,
				name: data.name,
				isSwitchCLient: sessionStorage.getItem('clientId') ? true : false,
			};
		});
		this.planId = this.activatedRoute.snapshot.params['id'];
		this.form['planId'].setValue(this.planId);
		this.activatedRoute.queryParams.subscribe((params) => {
			this.params = JSON.parse(JSON.stringify(params));
			this.getDataById();
		});
	}

	getPlanTitle(item) {
		return planModulesFeatures.find((e) => e.value === item.title);
	}

	changeDropDown() {}

	getDataById(): void {
		this.spinnerService.start();
		this.planService.getById(this.planId).subscribe({
			next: (result) => {
				this.plan = result.data;
				if (this.plan?.connectionType === connectionType.PRE_PAID) {
					this.dataForm.get('noOfVerification').setValue(this.plan.noOfVerification);
					this.dataForm.get('amount').setValue(this.plan.totalAmount);
					this.dataForm.get('amountPerVerification').setValue(this.plan.amountPerVerification);
					this.dataForm.get('totalAmount').setValue(this.plan.totalAmount);
				} else {
					this.dataForm.get('noOfVerification').setValue(0);
					this.dataForm.get('amountPerVerification').setValue(this.plan.amountPerVerification);
					this.dataForm.get('amount').setValue(this.plan.amountPerVerification);
					this.dataForm.get('totalAmount').setValue(0);
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	goBack() {
		this.location.back();
	}

	onSubmit($event): void {
		this.dataForm.get('paymentDetails').setValue($event);
		if ($event.status === 'captured') {
			this.dataForm.get('isPaid').setValue(true);
		}
		this.createSubscription();
	}

	createSubscription() {
		this.subscriptionService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.zone.run(() => {
					this.subscriptionService.refreshSidebar.next(true);
					this.router.navigate(['/subscriptions'], { replaceUrl: true });
				});
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
