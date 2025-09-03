import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { ROLES, defaultStatus, planFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-checklist',
	templateUrl: './checklist.component.html',
	styleUrls: ['./checklist.component.scss'],
})
export class ChecklistComponent implements OnInit {
	@Input() checkList: any = [];
	params: any = {};
	roles = ROLES;
	currentUser: any;
	defaultStatus = defaultStatus;
	assignedVerificationChecks: any = [];
	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private verificationDetailsService: VerificationDetailsService,
		private userService: UserService,
		private toastService: ToastService
	) {
		this.verificationDetailsService.verificationListSubject.subscribe(({ index, status }: any) => {
			this.checkList[index].checked = true;
			this.checkList[index].status = status;
		});
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.params = this.activatedRoute.snapshot.queryParams;
		console.log(this.checkList);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['checkList'] && this.checkList) {
			console.log(this.checkList);
			console.log(changes['showList']);
			// this.checkList = this.checkList.filter((element) => this.showList.includes(element.value));
			console.log(changes['checkList']);
		}
	}

	navigateTo(item): void {
		if (item.value) {
			// if (item.value !== planFeatures.AADHAR_CARD) {
			// 	const isAadharCardAdded = this.checkList.find(
			// 		(element) => element.value === planFeatures.AADHAR_CARD && element.status != null
			// 	);
			// 	if (!isAadharCardAdded) {
			// 		this.toastService.error('Aadhaar card need to be added');
			// 		return;
			// 	}
			// }
			let appendPath = this.router.url.includes('start') ? 'start' : 'direct';
			this.router.navigate([`/${appendPath}-verification/${this.params.id}/${item.path}`], {
				queryParams: { id: this.params.id, name: this.params.name },
			});
		} else {
			item.checked = true;
			this.router.navigateByUrl(item?.path);
		}
	}

	linkActive(url: string) {
		return this.router.url.includes(url)
			? this.grayOutLinks(url)
				? 'disabled-active-verification mx-2 px-2'
				: 'active-verification mx-2 px-2 bg-primary-200'
			: 'px-3';
	}
	getVerificationIcon(item) {
		if (item?.checked) {
			return item?.status
				? `./assets/icons/verification/${item?.status}.svg`
				: [
						'getting-started',
						'getting-started/on-board',
						'getting-started/account-setup',
						'getting-started/explore-plans',
				  ].includes(item.path)
				? './assets/icons/verified.svg'
				: './assets/icons/rejected.svg';
		} else {
			return './assets/icons/rejected.svg';
		}
	}

	isSubMenuItemActive(url: string) {
		return this.router.url === `/${url}` ? true : false;
	}

	grayOutLinks(link: string) {
		if (
			['court-check', 'police-verification', 'police-lawyer'].includes(link) &&
			![this.roles.CLIENT_ADMIN].includes(this.currentUser?.role)
		) {
			return true;
		}
		return false;
	}
}
