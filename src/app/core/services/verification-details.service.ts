import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Observable, map, BehaviorSubject, distinctUntilChanged, Subject } from 'rxjs';
import { ROLES, SERVICES, defaultStatus, planFeatures } from 'src/app/helpers';
import { ApiService } from './api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompletionModalComponent } from 'src/app/pages/verification/completion-modal/completion-modal.component';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root',
})
export class VerificationDetailsService {
	public verificationListSubject = new Subject();
	constructor(
		private apiService: ApiService,
		private router: Router,
		private modalService: NgbModal,
		private userService: UserService
	) {}
	private userVerificationSubject = new BehaviorSubject<any>({});
	public userVerification = this.userVerificationSubject.asObservable().pipe(distinctUntilChanged());

	setVerificationList(list): void {
		this.userVerificationSubject.next(list);
	}

	clearVerificationList() {
		this.userVerificationSubject.next(null);
	}

	getVerificationList(): any {
		return this.userVerificationSubject.getValue();
	}

	getCourtList(): Observable<any> {
		const url = `/admin/verification/court-list`;
		return this.apiService.get(url, null, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	create(payload: any): Observable<any> {
		const url = `/admin/verification`;
		return this.apiService.post(url, payload, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	update(payload: any): Observable<any> {
		const url = `/admin/verification/${payload.id}`;
		return this.apiService.put(url, payload, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	list(params): Observable<any> {
		const url = `/admin/verification`;
		return this.apiService.get(url, params, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	patch(payload: any): Observable<any> {
		const url = `/admin/verification/${payload.id}`;
		return this.apiService.patch(url, payload, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	searchGST(payload: any): Observable<any> {
		const url = `/search/gst`;
		return this.apiService.get(url, payload, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	verificationCount(params): Observable<any> {
		const url = `/admin/verification/count`;
		return this.apiService.get(url, params, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	verificationList(params): Observable<any> {
		const url = `/admin/verification/list`;
		return this.apiService.get(url, params, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	sendReport(params): Observable<any> {
		const url = `/admin/employee/${params.userId}/send-report`;
		return this.apiService.get(url, null, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	regenerateReport(params): Observable<any> {
		const url = `/admin/verification/generate-report/${params.userId}`;
		return this.apiService.post(url, {}, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	sendReportToVendor(params: any): Observable<any> {
		const url = `/admin/verification/send-vendor-email/${params.id}/${params.type}`;
		return this.apiService.get(url, null, SERVICES.VERIFICATION).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	// navigateToNext(path: string, routeParams: Params, nextPage: string): void {
	// 	if (nextPage === null) {
	// 		this.router.navigate([`/${path}-verification`]);
	// 	} else {
	// 		this.router.navigate([`/${path}-verification/${routeParams['id']}/${nextPage}`], {
	// 			queryParams: { id: routeParams['id'], name: routeParams['name'] },
	// 		});
	// 	}
	// }
	navigateToNext(path: string, currentPage: string, routeParams: Params): void {
		const currentUser = this.userService.getCurrentUser();
		let verificationList = this.getVerificationList();
		let index = verificationList.findIndex((element) => element.path === currentPage);
		index++;
		if (index >= verificationList.length) {
			if (currentUser.role != ROLES.EMPLOYEE) {
				this.router.navigate([`/${path}-verification`]);
			} else {
				this.showCompleteModal(currentPage, verificationList[index - 1], null);
			}
		} else {
			this.router.navigate([`/${path}-verification/${routeParams['id']}/${verificationList[index].path}`], {
				queryParams: { id: routeParams['id'], name: routeParams['name'] },
			});
		}
	}
	updateCheckList(currentPage: string, status: string = '') {
		let verificationList = this.getVerificationList();
		let index = verificationList.findIndex((element) => element.path === currentPage);
		this.verificationListSubject.next({ index, status });
	}

	showCompleteModal(currentPage: string, status: string = '', currentUpload: number): void {
		let verificationList = this.getVerificationList();
		const index = verificationList.findIndex((element) => element.path === currentPage);
		console.log('currentUpload', currentUpload);
		if (
			[
				planFeatures.EDUCATIONAL,
				planFeatures.PAST_EMPLOYMENT,
				planFeatures.REFERENCE_CHECK,
				planFeatures.PHYSICAL_ADDRESS,
			].includes(verificationList[index].value) &&
			(!verificationList[index].status || [defaultStatus.PENDING].includes(verificationList[index].status))
		) {
			verificationList[index].status = status;
			verificationList[index]['currentUpload'] = currentUpload;
			verificationList[index]['checked'] =
				verificationList[index].maxUploadNumber <= verificationList[index].currentUpload;
		} else if (!verificationList[index].status) {
			verificationList[index].status = status;
			verificationList[index]['checked'] = true;
		}
		console.log('verificationList', verificationList);
		this.setVerificationList(verificationList);
		if (this.userService.getCurrentUser().role === ROLES.EMPLOYEE) {
			let pendingList = verificationList.filter((e) => {
				if (e.status && !e.checked) {
					return e;
				} else if ([null, ''].includes(e.status)) {
					return e;
				}
			});
			console.log('pendingList', pendingList);
			const modalRef = this.modalService.open(CompletionModalComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.modelData = {
				isCompleted: pendingList.length === 0,
				pendingList,
			};
			modalRef.result.then(
				(result) => {
					this.userService.purgeAuth();
					let path = '/login';
					this.router.navigate([path]);
				},
				(dismiss) => {}
			);
		}
	}
}
