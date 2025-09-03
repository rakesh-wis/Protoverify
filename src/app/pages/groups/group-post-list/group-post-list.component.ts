import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PostService } from 'src/app/core/services/post.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
	selector: 'app-group-post-list',
	templateUrl: './group-post-list.component.html',
	styleUrls: ['./group-post-list.component.scss'],
})
export class GroupPostListComponent implements OnInit, OnChanges {
	@Input() groupId: number = null;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	dataList: any = {
		rows: [],
		count: -1,
	};
	constructor(
		private postService: PostService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {
		this.postService.postDataSubject.subscribe((result) => {
			if (result.hasOwnProperty('isAddPost')) {
				this.dataList['rows'].push(result);
			} else if (result.hasOwnProperty('isScroll')) {
				this.page++;
				this.loadData();
			}
		});
	}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes && changes['groupId']) {
			this.dataList['rows'] = [];
			this.loadData();
		}
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.postService.list(params, this.groupId).subscribe({
			next: (result) => {
				this.collectionSize = result.data['count'];
				for (let i = 0; i < result.data['rows'].length; i++) {
					this.dataList['rows'].unshift(result.data['rows'][i]);
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
