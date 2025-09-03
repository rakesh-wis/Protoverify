import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { SubscriptionService } from 'src/app/core/services/subscription.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { displayRenewPlan, getDaysBetween } from 'src/app/helpers/utils.helper';
import { confirmMessages, connectionType, planFeatures, planModules, planModulesFeatures } from 'src/app/helpers';
import { SubscriptionViewComponent } from '../subscription-view/subscription-view.component';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { PlanService } from 'src/app/core/services/plan.service';

@Component({
	selector: 'app-subscription-current',
	templateUrl: './subscription-current.component.html',
	styleUrls: ['./subscription-current.component.scss'],
})
export class SubscriptionCurrentComponent implements OnInit {
	plan: any;
	displayRenew = false;
	collapse: boolean[] = [];
	planModulesFeatures = [
		...planModulesFeatures,
		...[
			{
				checked: false,
				label: 'Aadhaar Card',
				title: 'Aadhaar Card',
				value: planFeatures.AADHAR_CARD,
				module: planModules[0].value,
			},
		],
	];
	connectionType = connectionType;
	constructor(
		private subscriptionService: SubscriptionService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private planService: PlanService,
		private modalService: NgbModal,
		private router: Router
	) {}

	ngOnInit(): void {
		this.getData();
	}

	get validity(): string {
		let difference = getDaysBetween(this.plan?.validFrom, this.plan?.validTill, 'month');
		if (difference >= 12) {
			return `${getDaysBetween(this.plan?.validFrom, this.plan?.validTill, 'y')} years`;
		}
		return `${difference} months`;
	}

	getPlanTitle(item) {
		return this.planModulesFeatures.find((e) => e.value === item);
	}

	getColor(item) {
		if (item?.features.length >= 13) {
			return 'green';
		} else if (item.features.length >= 6 && item.features.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}
	view(item: any): void {
		const modalRef = this.modalService.open(SubscriptionViewComponent, {
			centered: true,
			size: 'sm',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
	getData(): void {
		this.spinnerService.start();
		this.subscriptionService.getCurrentPlan().subscribe({
			next: (result) => {
				this.plan = result.data;
				this.displayRenew = this.plan ? displayRenewPlan(this.plan.validTill) : false;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	openConfirmStopRenewal(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.updateTitle}?`;
		modalRef.componentInstance.description = `${
			confirmMessages.hideDescription
		} stop renewal of plan ${item?.title.toUpperCase()} ?\n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.updateAutoRenewal({
					id: item.planId,
					userId: item.userId,
					autoRenewal: false,
				});
			},
			(dismiss) => {}
		);
	}

	updateAutoRenewal(item: any) {
		this.spinnerService.start();
		this.planService.updateAutoRenewal(item).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.getData();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
