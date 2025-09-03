import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';

@Injectable({
	providedIn: 'root',
})
export class ReportService {
	token: String;
	private httpClient: HttpClient;

	constructor(
		private jwtService: JwtService,
		private apiService: ApiService,
		handler: HttpBackend
	) {
		this.httpClient = new HttpClient(handler);
		this.token = this.jwtService.getToken();
	}
}
