import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentTemplateService } from 'src/app/core/services/document-template.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-client-configuration-template-details',
	templateUrl: './client-configuration-template-details.component.html',
	styleUrls: ['./client-configuration-template-details.component.scss'],
})
export class ClientConfigurationTemplateDetailsComponent implements OnInit {
	@Input() modelData: any;

	constructor(
		private templateService: DocumentTemplateService,
		private spinnerService: SpinnerService,
		public activeModal: NgbActiveModal,
		private toastService: ToastService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.getData();
	}

	getData(): void {
		this.spinnerService.start();
		this.templateService.getDataByType(this.modelData.type).subscribe({
			next: (result) => {
				if (result.data) this.modelData = result.data;
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				// this.toastService.error(error);
			},
		});
	}
	closeModal() {
		this.activeModal.close();
	}
	dismissModal() {
		this.activeModal.dismiss();
	}
	edit() {
		this.closeModal();
		this.router.navigate([`/configuration/${this.modelData.type}/edit`]);
	}
}
