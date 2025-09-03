import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Component({
	selector: 'app-loading',
	templateUrl: './loading.component.html',
	styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
	private subscription: Subscription;
	loading: boolean = false;

	constructor(
		private spinnerService: SpinnerService,
		private changeDetection: ChangeDetectorRef
	) {
		this.subscription = this.spinnerService
			.getLoading()
			.subscribe((loading: boolean) => {
				this.loading = loading;
				this.changeDetection.detectChanges();
			});
	}

	ngOnInit() {
		this.subscription = this.spinnerService
			.getLoading()
			.subscribe((loading: boolean) => {
				this.loading = loading;
				this.changeDetection.detectChanges();
			});
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}
