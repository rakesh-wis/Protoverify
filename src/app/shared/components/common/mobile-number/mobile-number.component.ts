import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, Validator, FormControl } from '@angular/forms';
// @ts-ignore
import { all } from 'country-codes-list';
import { parsePhoneNumber } from 'awesome-phonenumber';

@Component({
	selector: 'app-mobile-number',
	templateUrl: './mobile-number.component.html',
	styleUrls: ['./mobile-number.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MobileNumberComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MobileNumberComponent),
			multi: true,
		},
	],
})
export class MobileNumberComponent implements OnInit, ControlValueAccessor, OnChanges, Validator {
	@Input() label: string;
	@Input() placeholder!: string;
	@Input() inputType = 'text';
	@Input() isRequired = false;
	@Input() formControlMobileNumber: FormControl;
	@Input() formControlCountryCode: FormControl;

	public inputFormControlMobileNumber: FormControl = new FormControl();
	public inputFormControlCountryCode: FormControl = new FormControl();

	@Output() blur: EventEmitter<any> = new EventEmitter();
	@Output() change: EventEmitter<any> = new EventEmitter();
	@Output() InitValue: EventEmitter<any> = new EventEmitter();
	@Output() keyUp: EventEmitter<any> = new EventEmitter();
	@Output() validNumberEvent: EventEmitter<Boolean> = new EventEmitter();

	@Input() errorValidator: any = [];
	@Input() customClass: string = null;
	public currentValue = '';
	public isDisabled: boolean = false;
	public inputCtrl: any;
	public inFocus = false;
	countryList = all();
	isMobileNumberValid: boolean = true;

	constructor() {}

	public ngOnInit() {
		this.initInputListener();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['formControlMobileNumber'] && this.formControlMobileNumber) {
			// If FormControl has changed, ensure we update the disabled state
			this.setDisabledState(this.formControlMobileNumber.disabled);
			this.currentValue = this.formControlMobileNumber.value;
			this.InitValue.emit(this.formControlMobileNumber.value);
		}
		if (changes['formControlCountryCode'] && this.formControlCountryCode) {
			// If FormControl has changed, ensure we update the disabled state
			this.setDisabledState(this.formControlCountryCode.disabled);
			this.InitValue.emit(this.formControlCountryCode.value);
		}
	}

	private initInputListener() {
		// Whenever input is changed (by text, or textMask), transform and set current value
		this.inputFormControlMobileNumber.valueChanges.subscribe((val) => {
			this.setCurrentValue(val);
		});
		this.inputFormControlCountryCode.valueChanges.subscribe((val) => {
			this.setCurrentValue(val);
		});
	}

	onTouched = () => {};
	private propagateChange = (_: any) => {};

	public setDisabledState(isDisabled: boolean) {
		if (isDisabled) {
			this.inputFormControlMobileNumber.disable({ emitEvent: false });
			this.inputFormControlCountryCode.disable({ emitEvent: false });
		} else {
			this.inputFormControlMobileNumber.enable({ emitEvent: false });
			this.inputFormControlCountryCode.enable({ emitEvent: false });
		}
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	checkMobileAndCountryCode(): boolean {
		if (
			this.formControlMobileNumber.value &&
			parsePhoneNumber(`+${this.formControlCountryCode.value}${this.formControlMobileNumber.value}`).isMobile()
		) {
			this.validNumberEvent.next(true);
			this.isMobileNumberValid = true;
			return true;
		}
		this.validNumberEvent.next(false);
		this.isMobileNumberValid = false;
		return false;
	}

	writeValue(obj: any): void {
		this.setInputValue(obj);
	}

	registerOnChange(fn: any): void {
		this.propagateChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	public handleKeyUp(event: { srcElement: any }) {
		this.keyUp.emit(event);
		this.inputCtrl = event.srcElement;
	}
	public onFocus() {
		this.inFocus = true;
	}

	public onBlur() {
		this.inFocus = false;
		this.blur.emit();
	}
	public trimValue(pCtrl: { value: string }) {
		if (pCtrl && pCtrl.value && this.inputType !== 'tel') {
			pCtrl.value = pCtrl.value.trim();
			this.setInputValue(pCtrl.value);
		}
	}
	private setInputValue(value: any) {
		this.inputFormControlMobileNumber.setValue(value, { emitEvent: false });
		this.inputFormControlCountryCode.setValue(value, { emitEvent: false });
	}

	private setCurrentValue(val: any, justChange = false) {
		this.currentValue = val;

		// For number input; if non-number is entered, wipe input clean!
		if (val === null) {
			this.setInputValue(val);
		}

		if (!justChange) {
			this.propagateChange(val);
		}

		this.change.emit(val);
	}
	private isNumberInput() {
		return this.inputType === 'number';
	}
	validateNumber(value: string): any {
		const numVal = parseFloat(value);
		const errors: any = {};

		if (isNaN(numVal)) {
			return errors;
		}
		return errors;
	}
	public validate(control: FormControl) {
		const errors: any = {};

		// Only validate min/max if a number!
		if (this.isNumberInput()) {
			Object.assign(errors, this.validateNumber(this.currentValue));
		}

		return errors;
	}
}
