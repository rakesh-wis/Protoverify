import { FormGroup } from '@angular/forms';
import { isString } from 'lodash';

export function WhiteSpaceValidator(
	form: FormGroup
): { [key: string]: boolean } | null {
	let keys = Object.keys(form.controls);
	let hasWhiteSpace = keys.some((k) =>
		Array.isArray(form.controls[k])
			? false
			: form.controls[k].value
			? isString(form.controls[k].value)
				? form.controls[k].value.charAt(0).trim() === ''
				: false
			: false
	);
	return hasWhiteSpace ? { whitespace: true } : null;
}
