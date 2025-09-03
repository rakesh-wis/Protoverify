import moment from 'moment';

export const calculateValidity = (isYearly: boolean, value: number): any => {
	const currentDate = new Date();
	if (isYearly) {
		return new Date(currentDate.setFullYear(currentDate.getFullYear() + value)).toString();
	} else {
		return new Date(currentDate.setMonth(currentDate.getMonth() + value)).toString();
	}
};

export const generateArray = (length: number, period: string) => {
	return Array.apply(null, Array(length)).map((e, i) => {
		return {
			id: i,
			interval: i + 1,
			period: period,
			label: period === 'monthly' ? 'Month' : 'Year',
		};
	});
};

export const getDurationInMonth = (fromDate, toDate): number => {
	fromDate = new Date(fromDate);
	toDate = new Date(toDate);
	return toDate.getMonth() - fromDate.getMonth() + 12 * (toDate.getFullYear() - fromDate.getFullYear());
};

export const getDaysBetween = (
	fromDate,
	toDate,
	type:
		| 'year'
		| 'years'
		| 'y'
		| 'month'
		| 'months'
		| 'M'
		| 'week'
		| 'weeks'
		| 'w'
		| 'day'
		| 'days'
		| 'd'
		| 'hour'
		| 'hours'
		| 'h'
		| 'minute'
		| 'minutes'
		| 'm'
		| 'second'
		| 'seconds'
		| 's'
		| 'millisecond'
		| 'milliseconds'
		| 'ms'
) => {
	const from = moment(fromDate);
	const to = moment(toDate);
	return to.diff(from, type);
};

export const displayRenewPlan = (tillDate: Date): boolean => {
	const currentDate = moment(new Date());
	const expiryDate = moment(tillDate);
	const days = expiryDate.diff(currentDate, 'days');
	if (days <= 3) {
		return true;
	}
	return false;
};

export const sortAlphabetically = (array, key) => {
	return array.sort(function (a, b) {
		const nameA = a[key].toLowerCase();
		const nameB = b[key].toLowerCase();
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0;
	});
};
