import { Component, OnInit } from '@angular/core';
import { OPTIONS } from 'src/app/helpers';

@Component({
	selector: 'app-all-verifications',
	templateUrl: './all-verifications.component.html',
	styleUrls: ['./all-verifications.component.scss'],
})
export class AllVerificationsComponent implements OnInit {
	checkTypes: Array<{ label: string; ngbNavItemVal: number }> = [
		{
			label: 'API Checks',
			ngbNavItemVal: 0,
		},
		{
			label: 'Past Employment',
			ngbNavItemVal: 1,
		},
		{
			label: 'Reference Check',
			ngbNavItemVal: 2,
		},
		{
			label: 'Education',
			ngbNavItemVal: 3,
		},
		{
			label: 'Bank Check',
			ngbNavItemVal: 4,
		},
		{
			label: 'Custom Checks',
			ngbNavItemVal: 5,
		},
	];
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Name',
			value: 'name',
			sorting: true,
		},
		{
			label: 'Status',
			value: 'status',
			sorting: true,
		},
		{
			label: 'TAT',
			value: 'tat',
			sorting: true,
		},
		{
			label: 'Check',
			value: 'check',
			sorting: true,
		},
		{
			label: 'Clients',
			value: 'clients',
			sorting: true,
		},
	];
	dataList: any = {
		rows: [
			{
				name: 'Roshni Yadav',
				status: 'Candidate Open',
				tat: { value: 'Medium', status: 'medium' },
				check: 'PAN Card',
				clients: 'Infosys',
			},
			{
				name: 'Roshni Yadav',
				status: 'Candidate Open',
				tat: { value: 'High', status: 'high' },
				check: 'PAN Card',
				clients: 'Infosys',
			},
			{
				name: 'Roshni Yadav',
				status: 'Candidate Open',
				tat: { value: 'Critical', status: 'critical' },
				check: 'PAN Card',
				clients: 'Infosys',
			},
		],
		count: 3,
	};
	OPTIONS = OPTIONS;
	constructor() {}

	ngOnInit(): void {}
}
