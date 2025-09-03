import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core';
import { DocumentTemplateService } from 'src/app/core/services/document-template.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-employee-document-template',
	templateUrl: './employee-document-template.component.html',
	styleUrls: ['./employee-document-template.component.scss'],
})
export class EmployeeDocumentTemplateComponent implements OnInit {
	documentTemplateData: any = null;
	employeeId: number = null;
	constructor(
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private employeeService: EmployeeService,
		private location: Location,
		private templateService: DocumentTemplateService,
		private activeRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.employeeId = this.activeRoute.snapshot.params['id'];
		this.getData();
	}

	getData(): void {
		this.spinnerService.start();
		this.templateService.getDataByType('offer_letter').subscribe({
			next: (result) => {
				if (result.data) this.documentTemplateData = result.data;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				// this.toastService.error(error);
			},
		});
	}

	downloadTemplate(): void {
		this.spinnerService.start();
		this.templateService.getDataByType('offer_letter').subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) saveAs(result.data.link, 'Offer Letter.pdf');
				else this.toastService.error('No offer letter');
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error('Please try after some time');
			},
		});
	}
	goBack() {
		this.location.back();
	}
}
