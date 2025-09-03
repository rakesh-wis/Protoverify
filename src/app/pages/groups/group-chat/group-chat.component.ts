import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { GroupService } from 'src/app/core/services/group.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { PostService } from 'src/app/core/services/post.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UploadService } from 'src/app/core';
import { OPTIONS, SERVICES } from 'src/app/helpers';

@Component({
	selector: 'app-group-chat',
	templateUrl: './group-chat.component.html',
	styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit {
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	dataList: any = {
		rows: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	selectedGroup: any = {};
	dataForm = new FormGroup({
		message: new FormControl('', [Validators.required]),
		postMedia: new FormArray([]),
	});
	isCollapsed: boolean = false;
	postMedia = this.dataForm.get('postMedia') as FormArray;

	private iconsList: string[] = ['smile-emoji'];
	@ViewChild('scrollMe') private myScrollContainer: ElementRef;

	constructor(
		private domSanitizer: DomSanitizer,
		private groupService: GroupService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private matIconRegistry: MatIconRegistry,
		private postService: PostService,
		private formBuilder: FormBuilder,
		private uploadService: UploadService
	) {
		this.registerIcons();
	}

	ngOnInit(): void {
		this.loadData();
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.groupService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
				this.scrollToBottom();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	clearFilter() {
		this.statusFilter = null;
		this.searchTerm = null;
		this.loadData();
	}
	applyFilters() {
		this.loadData({
			search: this.searchTerm,
			status: this.statusFilter,
		});
	}
	selectGroup(group) {
		this.selectedGroup = group;
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(null),
			fileType: new FormControl(item.fileType),
			filePath: new FormControl(item.filePath, [Validators.required]),
			fileName: [item.fileName],
			fileSize: new FormControl(item.fileSize),
			status: new FormControl(''),
		});
	}

	addItems(element): void {
		this.postMedia.push(this.createItem(element));
	}
	removeItem(index: number) {
		this.postMedia.removeAt(index);
	}

	removeUploadedMedia(index) {
		this.postMedia.removeAt(index);
	}
	uploadFile(event: any): void {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkImageType(file)) {
			this.toastService.error(OPTIONS.imageType);
			return;
		}
		if (this.uploadService.checkFileSize(file)) {
			this.toastService.error(OPTIONS.sizeLimit);
			return;
		}
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.SOCIAL).subscribe({
			next: (value) => {
				let payload = {
					fileType: file.type,
					filePath: value.cdn,
					fileName: file.name,
					fileSize: file.size,
				};
				this.addItems(payload);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	createPost() {
		if (!this.dataForm.get('message').value && this.dataForm.get('postMedia').value) {
			this.dataForm.controls['message'].setValue('Media');
		}
		if (this.dataForm.invalid) {
			return;
		}
		this.postService.create(this.dataForm.getRawValue(), this.selectedGroup.id).subscribe({
			next: (result) => {
				this.dataForm.reset();
				this.postMedia.clear();
				this.scrollToBottom();
				this.postService.postDataSubject.next({ ...result.data, isAddPost: true });
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
	scrollToBottom(): void {
		try {
			this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
		} catch (err) {}
	}

	@HostListener('scroll', ['$event'])
	onScroll(event: any) {
		if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
			if (this.dataList.rows.length < this.collectionSize) {
				this.postService.postDataSubject.next({ isScroll: true });
			}
		}
	}
}
