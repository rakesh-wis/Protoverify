import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
	name: 'safe',
})
export class SafePipe implements PipeTransform {
	constructor(private sanitized: DomSanitizer) {}
	public transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
		if (!value) return null;
		switch (type) {
			case 'html':
				return this.sanitized.bypassSecurityTrustHtml(value);
			case 'style':
				return this.sanitized.bypassSecurityTrustStyle(value);
			case 'script':
				return this.sanitized.bypassSecurityTrustScript(value);
			case 'url':
				return this.sanitized.bypassSecurityTrustUrl(value);
			case 'resourceUrl':
				return this.sanitized.bypassSecurityTrustResourceUrl(value);
			default:
				throw new Error(`Invalid safe type specified: ${type}`);
		}
	}
}
