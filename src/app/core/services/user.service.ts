import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../../models/index';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ROLES, SERVICES } from 'src/app/helpers';

@Injectable()
export class UserService {
	private currentUserSubject = new BehaviorSubject<User>({} as User);
	public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

	private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
	public isAuthenticated = this.isAuthenticatedSubject.asObservable().pipe(distinctUntilChanged());

	private verificationChecksSubject: BehaviorSubject<string[]>;
	public verificationChecks$: Observable<string[]>;

	refreshTable = new Subject();

	constructor(
		private apiService: ApiService,
		private jwtService: JwtService,
	) {
		const savedChecks = JSON.parse(localStorage.getItem('verificationChecks') || '[]');
		this.verificationChecksSubject = new BehaviorSubject<string[]>(savedChecks);
		this.verificationChecks$ = this.verificationChecksSubject.asObservable().pipe(distinctUntilChanged());
	}

	getCurrentUser(): User {
		return this.currentUserSubject.value;
	}

	switchRoleAccess(): boolean {
		if (
			(ROLES.getAdminArray().includes(this.currentUserSubject.value.role) &&
				this.currentUserSubject.value.role != ROLES.PROTO_OPERATION) ||
			sessionStorage.getItem('clientId')
		) {
			return true;
		}
		return false;
	}

	// Verify JWT in sessionStorage with server & load user's info.
	// This runs once on application startup.
	populate() {
		// If JWT detected, attempt to get & store user's info
		if (this.jwtService.getToken()) {
			const url = '/admin/user';
			this.apiService.get(url, undefined, 'USER').subscribe(
				(data) => {
					if (data && data.result) {
						this.setAuth(data.result.data);
					} else {
						this.purgeAuth();
					}
				},
				(err) => this.purgeAuth()
			);
		} else {
			// Remove any potential remnants of previous auth states
			this.purgeAuth();
		}
	}

	setAuth(user: User) {
		// Save JWT sent from server in sessionStorage
		this.jwtService.saveToken(user.token);
		// Set current user data into observable
		this.currentUserSubject.next(user);
		// Set isAuthenticated to true
		this.isAuthenticatedSubject.next(true);
	}

	purgeAuth() {
		// Remove JWT from sessionStorage
		this.jwtService.destroyToken();
		// Set current user to an empty object
		this.currentUserSubject.next({} as User);
		// Set auth status to false
		this.isAuthenticatedSubject.next(false);
	}

	/**
	 * login to app
	 * @param payload
	 * @returns
	 */
	login(payload: any, url: string): Observable<any> {
		return this.apiService.post(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	/**
	 * signup to app
	 * @param payload
	 * @returns
	 */
	signup(payload: any, url: string): Observable<User> {
		return this.apiService.post(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	/**
	 * verify the code
	 * @param payload
	 * @returns
	 */
	verification(payload: any, url): Observable<any> {
		return this.apiService.patch(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					if (url.includes('email')) this.setAuth(data.result.data);
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	/**
	 * @param payload
	 * @returns
	 */
	sendOtp(payload: any, url: string): Observable<any> {
		return this.apiService.post(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	/**
	 * get account setting profile
	 * @returns
	 */
	getProfile(url: string) {
		return this.apiService.get(url, undefined, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					this.currentUserSubject.next(data.result);
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	updateProfile(payload: any): Observable<any> {
		const url = '/admin/user';
		return this.apiService.put(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					this.setAuth(data.result.data);
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	patchStatus(payload: any, url: string): Observable<any> {
		return this.apiService.patch(url, payload, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}
	delete(url: string): Observable<any> {
		return this.apiService.delete(url, SERVICES.USER).pipe(
			map((data) => {
				if (data && data.result) {
					return data.result;
				} else {
					return null;
				}
			})
		);
	}

	
	getVerificationChecks(): string[] {
		return this.verificationChecksSubject.value;
	}

	
	setVerificationChecks(checks: string[]): void {
		
		localStorage.setItem('verificationChecks', JSON.stringify(checks));
		this.verificationChecksSubject.next(checks);
	}
}
