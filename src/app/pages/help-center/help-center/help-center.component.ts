import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/core';
import { HelpCenterService } from 'src/app/core/services/help-center.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { HelpCenterDetailsComponent } from '../help-center-details/help-center-details.component';

@Component({
	selector: 'app-help-center',
	templateUrl: './help-center.component.html',
	styleUrls: ['./help-center.component.scss'],
})
export class HelpCenterComponent implements OnInit {
	dataList: any = [];
	isRoleAccess: boolean = false;
	private iconsList: string[] = ['pen-note-edit'];

	constructor(
		private spinnerService: SpinnerService,
		private helpCenterService: HelpCenterService,
		private userService: UserService,
		private sharedService: SharedService,
		private toastService: ToastService,
		private modalService: NgbModal,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer
	) {
		this.registerIcons();
	}

	ngOnInit(): void {
		this.isRoleAccess = this.userService.switchRoleAccess();
		this.getHelpCenter();
	}

	getHelpCenter() {
		this.spinnerService.start();
		if (this.isRoleAccess) {
			this.helpCenterService.list({}).subscribe({
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
					this.dataList = result.helpCenter;
					this.spinnerService.stop();
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		}
	}

	edit(): void {
		const modalRef = this.modalService.open(HelpCenterDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = this.dataList.length > 0 ? this.dataList[0] : {};
		modalRef.result.then(
			(result) => {
				this.getHelpCenter();
			},
			(dismiss) => {}
		);
	}
	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
}
