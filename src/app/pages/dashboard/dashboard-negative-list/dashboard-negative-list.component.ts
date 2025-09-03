import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';

@Component({
	selector: 'app-dashboard-negative-list',
	templateUrl: './dashboard-negative-list.component.html',
	styleUrls: ['./dashboard-negative-list.component.scss'],
})
export class DashboardNegativeListComponent implements OnInit {
	dataList: any = {
		rows: [
			{
				label: 'Negative List of Education Institutions',
				publishedOn: '01 Jan 2023',
				link: 'assets/documents/LIST-OF-FAKE-UNIVERSITIES.pdf',
				fileName: 'Negative List of Education Institutions.pdf',
			},
		],
		count: -1,
	};
	constructor() {}

	ngOnInit(): void {}

	downloadFile(item): void {
		saveAs(item?.link, `${item.fileName}`);
	}
}
