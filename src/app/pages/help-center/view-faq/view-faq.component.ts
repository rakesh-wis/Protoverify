import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/core/services/shared.service';
import { UserService } from 'src/app/core';
import { FaqService } from 'src/app/core/services/faq.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ViewFaqDetailsComponent } from '../view-faq-details/view-faq-details.component';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { confirmMessages, defaultStatus } from 'src/app/helpers';

@Component({
	selector: 'app-view-faq',
	templateUrl: './view-faq.component.html',
	styleUrls: ['./view-faq.component.scss'],
})
export class ViewFaqComponent implements OnInit {
	dataList: any = [];
	isRoleAccess: boolean;
	defaultStatus = defaultStatus;
	constructor(
		private spinnerService: SpinnerService,
		private faqService: FaqService,
		private userService: UserService,
		private sharedService: SharedService,
		private toastService: ToastService,
		private modalService: NgbModal
	) {}

	ngOnInit(): void {
		this.isRoleAccess = this.userService.switchRoleAccess();
		this.getViewFaq();
	}

	getViewFaq() {
		this.spinnerService.start();
		if (this.isRoleAccess) {
			this.faqService.list({}).subscribe({
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
					this.dataList = result.faqs;
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
		const modalRef = this.modalService.open(ViewFaqDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = this.dataList.length > 0 ? this.dataList[i] : {};
		modalRef.result.then(
			(result) => {
				this.getViewFaq();
			},
			(dismiss) => {}
		);
	}
	add(): void {
		const modalRef = this.modalService.open(ViewFaqDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.getViewFaq();
			},
			(dismiss) => {}
		);
	}
	toggleCheck($event, item) {
		this.openConfirmStatus(item, $event);
	}
	openConfirmStatus(item, $event) {
		let status = item.status === defaultStatus.ACTIVE ? defaultStatus.BLOCKED : defaultStatus.ACTIVE;
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription}${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				item.status = status;
				this.changeStatus(item);
			},
			(dismiss) => {
				if ($event) {
					$event.target.checked = !$event.target.checked;
				}
			}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.faqService.block(item).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.getViewFaq();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	openConfirmDelete(item): void {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.delete(item);
			},
			(dismiss) => {}
		);
	}

	delete(item: any) {
		this.spinnerService.start();
		this.faqService.delete(item).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.getViewFaq();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
