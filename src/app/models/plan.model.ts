export interface Plan {
	description: string;
	id: number;
	status: string;
	title: string;
	planType: string;
	userId: number;
	price?: number;
	priceMonthly?: number;
	priceYearly?: number;
}
