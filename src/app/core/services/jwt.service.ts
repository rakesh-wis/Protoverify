import { Injectable } from '@angular/core';

@Injectable()
export class JwtService {
	getToken(): String {
		return window.sessionStorage['jwtToken'];
	}

	saveToken(token: String) {
		window.sessionStorage['jwtToken'] = token;
	}

	destroyToken() {
		window.sessionStorage.removeItem('jwtToken');
	}
}
