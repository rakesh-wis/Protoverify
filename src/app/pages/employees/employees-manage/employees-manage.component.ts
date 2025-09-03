import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-employees-manage',
	templateUrl: './employees-manage.component.html',
	styleUrls: ['./employees-manage.component.scss'],
})
export class EmployeesManageComponent implements OnInit {
	employeeId: number;
	isRoleAccess: boolean = false;
	private iconsList: string[] = ['download'];

	constructor(
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer
	) {
		this.registerIcons();
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.employeeId = params['id'];
			}
		});
		this.isRoleAccess = this.userService.switchRoleAccess();
	}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
}
