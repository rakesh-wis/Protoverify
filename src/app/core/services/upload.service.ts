import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { catchError, map, Observable } from 'rxjs';
import { JwtService } from './jwt.service';
import { OPTIONS } from 'src/app/helpers';

@Injectable()
export class UploadService {
	token: String;
	private httpClient: HttpClient;
	constructor(private apiService: ApiService, private jwtService: JwtService, handler: HttpBackend) {
		this.httpClient = new HttpClient(handler);
		this.token = this.jwtService.getToken();
	}

	uploadFile(path, formData, service: string): Observable<any> {
		this.token = this.jwtService.getToken();
		const clientId = sessionStorage.getItem('clientId');
		const httpHeaders = {
			headers: new HttpHeaders({
				Authorization: `JWT ${this.token}`,
				Accept: 'application/json',
				enctype: 'multipart/form-data',
				...(clientId && {
					clientId: clientId,
				}),
			}),
		};
		const URL: string = this.apiService.createBaseUrl(service);
		return this.httpClient
			.post(`${URL}${path}`, formData, httpHeaders)
			.pipe(catchError(this.apiService.formatErrors))
			.pipe(
				map((data) => {
					if (data && data['result']) {
						return data['result'];
					} else {
						return null;
					}
				})
			);
	}

	/**
	 * check upload file type
	 * @param file
	 * @returns
	 */
	checkDocumentType(file: File): boolean {
		let types = ['application/doc', 'application/pdf', 'application/docx'];
		if (!types.includes(file.type)) {
			return true;
		}
		return false;
	}
	/**
	 * check upload file type
	 * @param file
	 * @returns
	 */
	checkImageType(file: File): boolean {
		let types = ['image/png', 'image/jpeg', 'image/jpg'];
		if (!types.includes(file.type)) {
			return true;
		}
		return false;
	}
	checkFileSize(file) {
		let size = file.size / (1024 * 1024);
		if (size > OPTIONS.maxLimit) {
			return true;
		}
		return false;
	}
}
