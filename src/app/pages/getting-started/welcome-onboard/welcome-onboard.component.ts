import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core';
import { GettingStartedService } from 'src/app/core/services/getting-started.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-welcome-onboard',
	templateUrl: './welcome-onboard.component.html',
	styleUrls: ['./welcome-onboard.component.scss'],
})
export class WelcomeOnboardComponent implements OnInit {
	data: any = {
		sourcePath: 'assets/video/getting-started.mp4',
	};
	currentUser: any;
	constructor(
		private gettingStartedService: GettingStartedService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private userService: UserService
	) {}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
	}

	loadData(): void {
		this.spinnerService.start();
		this.gettingStartedService.gettingStarted().subscribe({
			next: (result) => {
				this.data = result.data['rows'][0];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
