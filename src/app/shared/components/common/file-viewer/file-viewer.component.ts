import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Gallery, GalleryConfig, GalleryItem, ImageItem } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';

@Component({
	selector: 'app-file-viewer',
	templateUrl: './file-viewer.component.html',
	styleUrls: ['./file-viewer.component.scss'],
})
export class FileViewerComponent implements OnInit {
	@Input() fileType: string;
	@Input() files: string[];
	items: GalleryItem[];
	galleryConfig: GalleryConfig;
	constructor(public gallery: Gallery, public lightbox: Lightbox, public activeModal: NgbActiveModal) {}

	ngOnInit(): void {
		if (this.fileType === 'images') {
			// This is for Basic example
			this.items = this.files.map((item) => {
				return new ImageItem({ src: item });
			});
			this.gallery.ref('lightbox').load(this.items);
			this.lightbox.open(0, 'lightbox');
			// this.lightbox.close()
			this.lightbox.closed.subscribe((result) => {
				this.gallery.destroyAll();
				this.gallery.resetAll();
				this.activeModal.dismiss();
			});
		}
	}
}
