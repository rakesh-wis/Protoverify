import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

export class MomentDateFormatterHelper extends NgbDateParserFormatter {
	DT_FORMAT = 'DD/MM/YYYY';

	parse(value: any) {
		if (value) {
			value = value.trim();
			let mdt = moment(value, this.DT_FORMAT);
		}
		return null;
	}

	format(date: any) {
		if (!date) {
			return '';
		}
		let mdt = moment([date.year, date.month - 1, date.day]);
		if (!mdt.isValid()) {
			return '';
		}
		return mdt.format(this.DT_FORMAT);
	}
}
