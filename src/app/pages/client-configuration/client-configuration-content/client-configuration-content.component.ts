import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-client-configuration-content',
	templateUrl: './client-configuration-content.component.html',
	styleUrls: ['./client-configuration-content.component.scss'],
})
export class ClientConfigurationContentComponent implements OnInit {
	private iconsList: string[] = ['pen-note-edit'];
	constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
		this.registerIcons();
	}

	ngOnInit(): void {}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
}
