import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { planModulesFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-subscription-view',
	templateUrl: './subscription-view.component.html',
	styleUrls: ['./subscription-view.component.scss'],
})
export class SubscriptionViewComponent implements OnInit {
	@Input() modelData: any;
	planModulesFeatures = planModulesFeatures;
	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

	ngOnInit(): void {}

	closeModal() {
		this.activeModal.close('close with cancel button');
	}

	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
	getPlanTitle(item) {
		return planModulesFeatures.find((e) => e.value === item);
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
}
