import { Input, Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionManagerService } from '../core/services/permission-manager.service';
import { PermissionType } from '../helpers';

@Directive({
	selector: '[appIsGranted]',
})
export class IsGrantedDirective {
	constructor(
		private templateRef: TemplateRef<any>,
		private viewContainer: ViewContainerRef,
		private permissionManagerService: PermissionManagerService
	) {}

	@Input() set appIsGranted(permission: PermissionType) {
		this.isGranted(permission);
	}

	private isGranted(permission: PermissionType) {
		// console.log('permission check', permission);
		if (this.permissionManagerService.isGranted(permission)) {
			this.viewContainer.createEmbeddedView(this.templateRef);
		} else {
			this.viewContainer.clear();
		}
	}
}
