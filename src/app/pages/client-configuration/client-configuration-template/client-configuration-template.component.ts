import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientConfigurationTemplateDetailsComponent } from '../client-configuration-template-details/client-configuration-template-details.component';
@Component({
	selector: 'app-client-configuration-template',
	templateUrl: './client-configuration-template.component.html',
	styleUrls: ['./client-configuration-template.component.scss'],
})
export class ClientConfigurationTemplateComponent implements OnInit {
	documentList = [
		{
			label: 'Offer Letters',
			type: 'offer_letter',
		},
		{
			label: 'Joining Letter',
			type: 'joining_letter',
		},
		{
			label: 'Agreement Letter',
			type: 'agreement_letter',
		},
	];
	constructor(private modalService: NgbModal) {}

	ngOnInit(): void {}

	open(item) {
		const modalRef = this.modalService.open(ClientConfigurationTemplateDetailsComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.componentInstance.modelData = item;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
}
