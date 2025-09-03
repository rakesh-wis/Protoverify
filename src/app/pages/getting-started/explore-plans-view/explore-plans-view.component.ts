import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { planModulesFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-explore-plans-view',
	templateUrl: './explore-plans-view.component.html',
	styleUrls: ['./explore-plans-view.component.scss'],
})
export class ExplorePlansViewComponent implements OnInit {
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
	getColor(item) {
		if (item?.planFeature.length >= 13) {
			return 'green';
		} else if (item.planFeature.length >= 6 && item.planFeature.length < 13) {
			return 'blue';
		} else {
			return 'yellow';
		}
	}
}
