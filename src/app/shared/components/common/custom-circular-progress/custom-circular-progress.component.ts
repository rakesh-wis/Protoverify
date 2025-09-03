import { Component, OnInit, Input } from '@angular/core';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';

@Component({
	selector: 'app-custom-circular-progress',
	templateUrl: './custom-circular-progress.component.html',
	styleUrls: ['./custom-circular-progress.component.scss'],
})
export class CustomCircularProgressComponent implements OnInit {
	@Input() verificationCount: any = {};

	constructor() {}

	ngOnInit(): void {}
}
