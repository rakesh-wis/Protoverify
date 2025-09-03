import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { LeaveRequestService } from 'src/app/core/services/leave-request.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-leave-management-details',
	templateUrl: './leave-management-details.component.html',
	styleUrls: ['./leave-management-details.component.scss'],
})
export class LeaveManagementDetailsComponent implements OnInit {
	leaveRequestId = null;
	leaveRequestData: any = {};
	constructor(
		private leaveRequestService: LeaveRequestService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.leaveRequestId = params['id'];
				this.getDataById();
			}
		});
	}

	getDataById(): void {
		this.leaveRequestService.getById(this.leaveRequestId).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.leaveRequestData = result.data;
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	downloadDocument(url: string) {
		window.open(url, '_blank');
	}
}
