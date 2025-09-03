import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-completion-modal',
	templateUrl: './completion-modal.component.html',
	styleUrls: ['./completion-modal.component.scss'],
})
export class CompletionModalComponent implements OnInit {
	@Input() modelData: any = {};
	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

	ngOnInit(): void {
		console.log(this.modelData);
	}

	closeModal() {
		this.activeModal.close();
	}

	dismissModal() {
		this.activeModal.dismiss('dismiss modal');
	}

	get pendingList() {
		return this.modelData.pendingList.map((e) => e?.title).join(' ,');
	}
}
