import { SERVICES } from '../helpers';
import { environment } from '../../environments/environment';

export class CKEditorUploadAdapter {
	loader: any;
	service: string;
	path: string;
	xhr: any;
	constructor(loader, service, path) {
		this.loader = loader;
		this.service = service;
		this.path = path;
	}
	upload() {
		return this.loader.file.then(
			(file) =>
				new Promise((resolve, reject) => {
					this._initRequest();
					this._initListeners(resolve, reject, file);
					this._sendRequest(file);
				})
		);
	}
	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}
	public createBaseUrl(type: string): string {
		if (type === SERVICES.CMS) {
			return environment.CMS_API_URL;
		} else if (type === SERVICES.VERIFICATION) {
			return environment.VERIFICATION_API_URL;
		} else if (type === SERVICES.NOTIFICATION) {
			return environment.NOTIFICATION_API_URL;
		} else if (type === SERVICES.SOCIAL) {
			return environment.SOCIAL_API_URL;
		} else if (type === SERVICES.SUBSCRIPTION) {
			return environment.SUBSCRIPTION_API_URL;
		}
		return environment.USER_API_URL;
	}

	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());
		const URL: string = this.createBaseUrl(this.service);
		xhr.open('POST', `${URL}${this.path}`, true); // TODO change the URL
		xhr.responseType = 'json';
		xhr.setRequestHeader('Accept', 'application/json');
		xhr.setRequestHeader('Authorization', `JWT ${window.sessionStorage['jwtToken']}`);
		// xhr.setRequestHeader("enctype", "multipart/form-data");
	}
	_initListeners(resolve, reject, file) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = `Couldn't upload file: ${file.name}.`;
		xhr.addEventListener('error', () => reject(genericErrorText));
		xhr.addEventListener('abort', () => reject());
		xhr.addEventListener('load', () => {
			const response = xhr.response;
			if (!response || response.error) {
				return reject(response && response.error ? response.error.message : genericErrorText);
			}
			resolve({
				default: response.result.cdn,
			});
		});
		if (xhr.file) {
			xhr.file.addEventListener('progress', (evt) => {
				if (evt.lengthComputable) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			});
		}
	}
	_sendRequest(file) {
		const data = new FormData();
		data.append('file', file);
		this.xhr.send(data);
	}
}
