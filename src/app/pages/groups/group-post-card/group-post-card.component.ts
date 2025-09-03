import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GroupService } from 'src/app/core/services/group.service';
import { PostService } from 'src/app/core/services/post.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-group-post-card',
	templateUrl: './group-post-card.component.html',
	styleUrls: ['./group-post-card.component.scss'],
})
export class GroupPostCardComponent implements OnInit {
	@Input() postData: any = {};
	constructor(
		private domSanitizer: DomSanitizer,
		private postService: PostService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {}

	ngOnInit(): void {}

	getUserName(mobileNumber) {
		return `${'x'.repeat(10)}${mobileNumber.slice(-3)}`;
	}

	likeUnLike(): void {
		this.postService.likeUnLike(this.postData.id).subscribe({
			next: (result) => {
				this.postData = result.data;
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
}
