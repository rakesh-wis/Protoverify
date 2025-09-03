import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-vendor-link-generate',
	templateUrl: './vendor-link-generate.component.html',
	styleUrls: ['./vendor-link-generate.component.scss'],
})
export class VendorLinkGenerateComponent implements OnInit {
	@Input() modelData: any = {};
	dataForm = new FormGroup({
		link: new FormControl(''),
	});

	constructor(
		public activeModal: NgbActiveModal,
		private modalService: NgbModal
	) {}

	ngOnInit(): void {}

	get form() {
		return this.dataForm.controls;
	}

	/**
	 * close modal
	 */
	closeModal() {
		this.activeModal.close('close with cancel button');
	}
	/**
	 * dismiss modal
	 */
	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}

	onSubmit() {
		console.log('clicked on submit');
		this.dismissModal();
	}
}
