import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from 'src/app/core';
import { ContactUsService } from 'src/app/core/services/contact-us.service';
import { ContactUsDetailsComponent } from '../contact-us-details/contact-us-details.component';

@Component({
	selector: 'app-view-contact-us',
	templateUrl: './view-contact-us.component.html',
	styleUrls: ['./view-contact-us.component.scss'],
})
export class ViewContactUsComponent implements OnInit {
	dataList: any = [];
	isRoleAccess: boolean;

	constructor(
		private spinnerService: SpinnerService,
		private contactUsService: ContactUsService,
		private userService: UserService,
		private sharedService: SharedService,
		private toastService: ToastService,
		private modalService: NgbModal
	) {}
	ngOnInit(): void {
		this.isRoleAccess = this.userService.switchRoleAccess();
		this.getContact();
	}

	getContact() {
		this.spinnerService.start();
		if (this.isRoleAccess) {
			this.contactUsService.list({}).subscribe({
				next: (result) => {
					this.dataList = result.data.rows;
					this.spinnerService.stop();
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		} else {
			this.sharedService.getHelpCenter().subscribe({
				next: (result) => {
					this.dataList = result.contacts;
					this.spinnerService.stop();
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		}
	}
	edit(i): void {
		const modalRef = this.modalService.open(ContactUsDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = this.dataList.length > 0 ? this.dataList[i] : {};
		modalRef.result.then(
			(result) => {
				this.getContact();
			},
			(dismiss) => {}
		);
	}
	add(): void {
		const modalRef = this.modalService.open(ContactUsDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});

		modalRef.result.then(
			(result) => {
				this.getContact();
			},
			(dismiss) => {}
		);
	}
}
