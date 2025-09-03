import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { planFeatures, planModules, planModulesFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-manage-plans-view',
	templateUrl: './manage-plans-view.component.html',
	styleUrls: ['./manage-plans-view.component.scss'],
})
export class ManagePlansViewComponent implements OnInit {
	@Input() modelData: any;
	planModulesFeatures = [
		...planModulesFeatures,
		...[
			{
				checked: false,
				label: 'Aadhaar Card',
				title: 'Aadhaar Card',
				value: planFeatures.AADHAR_CARD,
				module: planModules[0].value,
			},
		],
	];
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
