import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { dashboardKeyBasedVerificationList } from 'src/app/helpers';
import { Router } from '@angular/router';

@Component({
	selector: 'app-dashboard-operation-verification-details-view',
	templateUrl: './dashboard-operation-verification-details-view.component.html',
	styleUrls: ['./dashboard-operation-verification-details-view.component.scss'],
})
export class DashboardOperationVerificationDetailsViewComponent implements OnInit {
	@Input() modelData: any;

	dashboardKeyBasedVerificationList = dashboardKeyBasedVerificationList;
	verificationCheckDetailView: any = {};
	candidateOpenverificationCheck = [];
	opsOpenverificationCheck = [];
	vendorOpenverificationCheck = [];
	completedVerificationCheck = [];
	keyDetails: any = {};

	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private router: Router,
		private dashboardService: DashboardService
	) {}

	ngOnInit(): void {
		if (this.modelData && this.modelData.hasOwnProperty('empId') && this.modelData.hasOwnProperty('type')) {
			this.getData();
		}
	}

	getCheckDetails(item) {
		return this.dashboardKeyBasedVerificationList.find((e) => e.value == item);
	}

	/**
	 * dismiss modal
	 */
	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}

	getData(): void {
		try {
			this.spinnerService.start();
			const params = {
				type: this.modelData.type,
				userId: this.modelData.empId,
			};
			this.keyDetails = this.getCheckDetails(this.modelData.type);

			this.dashboardService.getVerificationDetailsView(params, this.keyDetails.service).subscribe({
				next: (response) => {
					this.spinnerService.stop();
					try {
						if (response && response.data) {
							this.verificationCheckDetailView = response.data;

							this.populateVerificationChecks(
								response.data.candidateOpen,
								this.candidateOpenverificationCheck,
								'Candidate Open'
							);
							this.populateVerificationChecks(
								response.data.opsOpen,
								this.opsOpenverificationCheck,
								'Ops Open'
							);
							this.populateVerificationChecks(
								response.data.vendorOpen,
								this.vendorOpenverificationCheck,
								'Vendor Open'
							);
							this.populateVerificationChecks(
								response.data.completed,
								this.completedVerificationCheck,
								'Completed'
							);
						}
					} catch (error) {
						console.error('Error processing verification data:', error);
						this.toastService.error('Error processing verification data');
					}
				},
				error: (error) => {
					this.spinnerService.stop();
					console.error('Error fetching verification details:', error);
					this.toastService.error('Error fetching verification details');
				},
			});
		} catch (error) {
			this.spinnerService.stop();
			console.error('Unexpected error:', error);
			this.toastService.error('Unexpected error occurred');
		}
	}

	private populateVerificationChecks(count: number, targetArray: any[], label: string): void {
		if (this.modelData.type == 'physical_verification' || this.modelData.type == 'permanent_address'){
			label = 'FO Open'
		}
			for (let i = 0; i < count; i++) {
				targetArray.push({
					name: this.keyDetails.name,
					label: label,
				});
			}
	}

	view(): void {
		// this.router.navigate([`/direct-verification/${this.modelData.empId}/organization-details`], {
		// 	queryParams: { id: this.modelData.empId.id, name: this.modelData.type },
		// });
		this.dismissModal();
		this.router.navigate([`/direct-verification/${this.modelData.empId}/${this.modelData.path}`], {
			queryParams: { id: this.modelData.empId, name: this.verificationCheckDetailView.employee.name },
		});
	}
}
