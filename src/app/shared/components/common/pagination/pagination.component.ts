import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-pagination',
	templateUrl: './pagination.component.html',
	styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {
	@Input() collectionSize!: number;
	@Input() page!: number;
	@Input() pageSize!: number;
	@Input() maxSize: number = 5;

	@Output() pageChange: EventEmitter<any> = new EventEmitter();

	constructor() {}

	ngOnInit(): void {}

	isPrevious(): boolean {
		return this.page === 1;
	}

	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	onPageChange(page: number, $event: string) {
		if (this.isLastPage() && $event === 'next') {
			return;
		}
		if (this.isPrevious() && $event === 'prev') {
			return;
		}
		if (this.isPrevious() && $event === 'prev') {
			this.page -= 1;
			return;
		} else if ($event === 'next' && this.isLastPage()) {
			this.page += 1;
			return;
		} else {
			if ($event === 'prev') {
				this.page -= 1;
			} else {
				this.page += 1;
			}
		}
		this.pageChange.emit({ page, $event });
	}
}
