import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import SignaturePad from 'signature_pad';

@Component({
	selector: 'app-signature-pad',
	templateUrl: './signature-pad.component.html',
	styleUrls: ['./signature-pad.component.scss'],
})
export class SignaturePadComponent implements OnInit {
	@ViewChild('canvas') canvasEl!: ElementRef;
	signaturePad!: SignaturePad;

	constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) {}

	ngOnInit(): void {}

	ngAfterViewInit() {
		this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
	}

	startDrawing(event: Event) {
		// works in device not in browser
	}

	moved(event: Event) {
		// works in device not in browser
	}

	clearPad() {
		this.signaturePad.clear();
	}

	onSubmit() {
		const base64Data = this.signaturePad.toDataURL();
		this.activeModal.close({ data: base64Data });
	}

	dismissModal() {
		this.modalService.dismissAll();
	}
}
