import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-getting-started',
	templateUrl: './getting-started.component.html',
	styleUrls: ['./getting-started.component.scss'],
})
export class GettingStartedComponent implements OnInit {
	constructor(private router: Router) {}

	ngOnInit(): void {}
}
