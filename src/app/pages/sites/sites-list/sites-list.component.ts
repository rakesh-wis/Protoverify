import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { confirmMessages, defaultStatus, OPTIONS } from 'src/app/helpers';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { saveAs } from 'file-saver';
import { SitesUploadComponent } from '../sites-upload/sites-upload.component';
import { SitesLocationComponent } from '../sites-location/sites-location.component';
import { SitesDetailsComponent } from '../sites-details/sites-details.component';

@Component({
	selector: 'app-sites-list',
	templateUrl: './sites-list.component.html',
	styleUrls: ['./sites-list.component.scss'],
})
export class SitesListComponent implements OnInit {
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'All', name: 'all' },
		{ label: 'Active', name: defaultStatus.ACTIVE },
		{ label: 'Blocked', name: defaultStatus.BLOCKED },
	];
	defaultStatus = defaultStatus;
	collectionSize: number = 10;
	page: number = 1;
	pageSize: number = 10;
	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Location Name',
			value: 'name',
			sorting: false,
		},
		{
			label: 'Contact Name',
			value: 'sites',
			sorting: false,
		},
		{
			label: 'Address',
			value: 'address',
			sorting: false,
		},
		{
			label: 'Location',
			value: 'location',
			sorting: false,
		},
		{
			label: 'Email',
			value: 'email',
			sorting: false,
		},
		{
			label: 'Website',
			value: 'website',
			sorting: false,
		},
		{
			label: 'Mobile Number',
			value: 'mobileNumber',
			sorting: false,
		},
		{
			label: 'Region',
			value: '',
			sorting: false,
		},
		{
			label: 'Action',
			value: '',
			sorting: false,
		},
	];
	dataList: any = {
		rows: [],
		count: -1,
	};
	statusFilter: string = 'all';
	searchTerm: string = '';
	OPTIONS = OPTIONS;

	private iconsList: string[] = ['address', 'location', 'mail', 'phone', 'web', 'download'];
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(
		dropDownConfig: NgbDropdownConfig,
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private router: Router,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private sitesService: SitesService,
		private spinnerService: SpinnerService,
		private toastService: ToastService
	) {
		dropDownConfig.autoClose = true;
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
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
		this.sitesService.list(params).subscribe({
			next: (result) => {
				this.dataList = result.data;
				this.collectionSize = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	onSort({ column, direction }: SortEvent) {
		this.headers.forEach((header) => {
			if (header.sortable !== column) {
				header.direction = '';
			}
		});

		if (direction === '' || column === '') {
			this.loadData();
		} else {
			this.loadData({
				column,
				direction,
			});
		}
	}

	onPageChange(event): void {
		this.page = event?.page;
		this.loadData();
	}

	clearFilter() {
		this.statusFilter = null;
		this.searchTerm = null;
		this.loadData();
	}
	applyFilters(filters) {
		this.loadData(filters);
	}

	add(): void {
		// this.router.navigate(['/locations/create']);
		const modalRef = this.modalService.open(SitesDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	edit(item: any): void {
		// this.router.navigate(['/locations/view'], { queryParams: { id: item.id } });
		const modalRef = this.modalService.open(SitesDetailsComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.siteId = item.id;
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}
	toggleCheck($event, item) {
		this.openConfirmStatus(item, $event);
	}
	openConfirmStatus(item, $event) {
		let status = item.status === defaultStatus.ACTIVE ? 'block' : defaultStatus.ACTIVE;
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription}${status} ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.changeStatus(item);
			},
			(dismiss) => {
				if ($event) {
					$event.target.checked = !$event.target.checked;
				}
			}
		);
	}

	changeStatus(item: any) {
		this.spinnerService.start();
		this.sitesService.patch(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
				});
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	openConfirmDelete(item) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} ?`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.delete(item);
			},
			(dismiss) => {}
		);
	}

	delete(item: any) {
		this.spinnerService.start();
		this.sitesService.delete(item).subscribe({
			next: (result) => {
				this.loadData({
					search: this.searchTerm,
					status: this.statusFilter,
				});
				this.spinnerService.stop();
				this.toastService.success(result.message);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	exportBulk(): void {
		this.spinnerService.start();
		this.sitesService.bulkExport({}).subscribe({
			next: (result) => {
				saveAs(result, `Locations List${moment().format('DD-MM-YYYY hh:mm a')}`);
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	openBulkUpload(): void {
		const modalRef = this.modalService.open(SitesUploadComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}

	registerIcons(): void {
		this.iconsList.map((icons) => {
			this.matIconRegistry.addSvgIcon(
				icons,
				this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icons}.svg`)
			);
		});
	}
	addLocation(item) {
		if (!item.geometry) {
			this.toastService.error('Geo location is not marked');
			return;
		}
		const modalRef = this.modalService.open(SitesLocationComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = {
			latitude: item.geometry['latitude'],
			longitude: item.geometry['longitude'],
			geoFence: item.geoFence,
		};
		modalRef.componentInstance.isForView = true;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}
}
