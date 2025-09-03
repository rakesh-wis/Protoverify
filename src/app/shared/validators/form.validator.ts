import { FormArray, FormControl, FormGroup } from '@angular/forms';

/* validatte form fields */
export const validateField = (form: any) => {
	Object.keys(form.controls).forEach((field) => {
		const controls = form.get(field);
		if (controls instanceof FormArray) {
			validateFormArray(controls);
		} else if (controls instanceof FormGroup) {
			validateField(controls);
		}
		controls.markAsTouched({ onlySelf: true });
	});
};

const validateFormArray = (formArray) => {
	formArray.controls.forEach((form) => {
		Object.keys(form.controls).forEach((field) => {
			const controls: FormControl = form.get(field);
			controls.markAsDirty({ onlySelf: true });
		});
	});
};
