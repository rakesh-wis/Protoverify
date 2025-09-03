import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
	parse: {
		dateInput: 'MMM YYYY',
	},
	display: {
		dateInput: 'MMM YYYY',
		monthYearLabel: 'MMMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'app-year-month-picker',
	templateUrl: './year-month-picker.component.html',
	styleUrls: ['./year-month-picker.component.scss'],
	providers: [
		// `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
		// application's root module. We provide it at the component level here, due to limitations of
		// our example generation script.
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},

		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class YearMonthPickerComponent implements OnInit {
	formControlDate = new FormControl(moment());
	@Output() change: EventEmitter<any> = new EventEmitter();

	constructor() {}

	ngOnInit(): void {
		// console.log('app-year-month-picker', this.formControlDate.value.year(), this.formControlDate.value.month());
		this.change.emit(this.formControlDate);
	}

	setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
		const ctrlValue = this.formControlDate.value!;
		ctrlValue.month(normalizedMonthAndYear.month());
		ctrlValue.year(normalizedMonthAndYear.year());
		this.formControlDate.setValue(ctrlValue);
		datepicker.close();
		this.change.emit(this.formControlDate);
	}
}
