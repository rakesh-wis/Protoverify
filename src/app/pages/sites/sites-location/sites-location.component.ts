import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-sites-location',
	templateUrl: './sites-location.component.html',
	styleUrls: ['./sites-location.component.scss'],
})
export class SitesLocationComponent implements OnInit {
	@Input() modelData: any;
	@Input() isForView: boolean = false;
	dataForm = new FormGroup({
		address: new FormControl(''),
		latitude: new FormControl(''),
		longitude: new FormControl(''),
		geoFence: new FormControl(),
	});
	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, config: NgbModalConfig) {
		config.backdrop = 'static';
		config.keyboard = false;
	}

	get form() {
		return this.dataForm.controls;
	}

	ngOnInit(): void {
		this.form['latitude'].setValue(this.modelData.latitude);
		this.form['longitude'].setValue(this.modelData.longitude);
		this.form['geoFence'].setValue(this.modelData.geoFence);
	}

	/**
	 * close modal
	 */
	closeModal() {
		this.activeModal.close(this.dataForm.getRawValue());
	}
	dismissModal() {
		this.activeModal.dismiss('dismiss modal');
	}
	onSubmit(): void {
		this.activeModal.close(this.dataForm.getRawValue());
	}

	updateLocation($event): void {
		console.log($event);
		this.dataForm.setValue($event);
	}
}
