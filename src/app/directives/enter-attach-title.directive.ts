import { Directive, ElementRef } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { ROLES } from '../helpers';

@Directive({
	selector: '[canViewEnterAttach]',
})
export class EnterAttachTitleDirective {
	constructor(private elementRef: ElementRef, private userService: UserService) {
		let currentUser = this.userService.getCurrentUser();
		if ([...ROLES.getClientArray(true), ROLES.PROTO_LAWYER].includes(currentUser.role)) {
			this.elementRef.nativeElement.style.display = 'none';
		}
	}
}
