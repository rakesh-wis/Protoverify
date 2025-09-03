import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { planModulesFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-favourite-plan-view',
	templateUrl: './favourite-plan-view.component.html',
	styleUrls: ['./favourite-plan-view.component.scss'],
})
export class FavouritePlanViewComponent implements OnInit {
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
		return this.planModulesFeatures.find((e) => e.value === item.title);
	}
	getAmountPerVerification(item) {
		return item.favouritePlanFeatures.reduce((acc, curr) => acc + curr.price * curr.maxUploadNumber, 0);
	}
	getColor(item) {
		if (item?.favouritePlanFeatures.length >= 13) {
			return 'green';
		} else if (item.favouritePlanFeatures.length >= 6 && item.favouritePlanFeatures.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}
}
