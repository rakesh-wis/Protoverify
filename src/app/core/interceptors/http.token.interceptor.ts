import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JwtService } from '../services';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
	constructor(private jwtService: JwtService) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const headersConfig: any = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};

		const token = this.jwtService.getToken();

		if (token) {
			headersConfig['Authorization'] = `JWT ${token}`;
		}
		if (sessionStorage.getItem('clientId')) {
			headersConfig['clientId'] = sessionStorage.getItem('clientId');
		}
		const request = req.clone({ setHeaders: headersConfig });
		return next.handle(request);
	}
}
