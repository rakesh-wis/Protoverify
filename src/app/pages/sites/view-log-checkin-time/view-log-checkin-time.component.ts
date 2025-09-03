import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AttendanceService } from 'src/app/core/services/attendance.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-view-log-checkin-time',
	templateUrl: './view-log-checkin-time.component.html',
	styleUrls: ['./view-log-checkin-time.component.scss'],
})
export class ViewLogCheckinTimeComponent implements OnInit {
	monthFilter = '';
	employeeFilter = '';
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	data: any = [];

	constructor(
		private spinnerService: SpinnerService,
		public activeModal: NgbActiveModal,
		private modalService: NgbModal,
		private attendanceService: AttendanceService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {
		this.loadData();
	}

	applyFilters() {
		// this.loadData({
		// 	monthFilter: this.monthFilter,
		// 	employeeFilter: this.employeeFilter,
		// });
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.attendanceService.checkInList(params).subscribe({
			next: (result) => {
				this.data = result.data[0];
				// this.collectionSize = result.data['count'];
				console.log('data', this.data);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	/**
	 * close modal
	 */
	closeModal() {
		this.activeModal.close('close with cancel button');
	}
	/**
	 * dismiss modal
	 */
	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
}
