import { Component, OnInit, QueryList, ViewChild, ElementRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { AttendanceService } from 'src/app/core/services/attendance.service';
import { RegularizationService } from 'src/app/core/services/regularization.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeShiftService } from 'src/app/core/services/time-shift.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/directives/sortable.directive';
import { defaultStatus, OPTIONS } from 'src/app/helpers';
import { saveAs } from 'file-saver';
import { RegularizationUploadComponent } from '../regularization-upload/regularization-upload.component';
import * as XLSX from 'xlsx';

@Component({
	selector: 'app-regularization-list',
	templateUrl: './regularization-list.component.html',
	styleUrls: ['./regularization-list.component.scss'],
})
export class RegularizationListComponent implements OnInit {
	defaultStatus = defaultStatus;

	headerColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Emp ID',
			value: 'profileIdentifier',
			sorting: false,
		},
		{
			label: 'Name',
			value: 'name',
			sorting: false,
		},
	];
	mainHeaderColumn: Array<{ label: string; value: string; sorting: boolean }> = [
		{
			label: 'Emp ID',
			value: 'profileIdentifier',
			sorting: false,
		},
		{
			label: 'Name',
			value: 'name',
			sorting: false,
		},
	];
	page: number = 1;
	pageSize: number = 10;
	collectionSize: number = 0;
	dataList: any = {
		rows: [],
		count: -1,
	};
	pageSites: number = 1;
	collectionSizeSites: number = 0;
	sitesList: any = {
		rows: [],
		count: -1,
	};
	selectedSites = '';
	timeShiftList: any = {
		rows: [],
		count: -1,
	};
	selectedTimeShift = '';

	searchTerm: string = '';
	OPTIONS = OPTIONS;
	selectedDate = null;
	selectedMonthNumber = 0;
	selectedYearNumber = 0;
	private iconsList: string[] = ['absent', 'full-present', 'half-present', 'less-half-present', 'download'];
	markList = [
		{
			icon: 'full-present',
			label: 'Present Full shift',
			value: 'present_full_shift',
		},
		{
			icon: 'half-present',
			label: 'Present Half shift',
			value: 'present_falf_shift',
		},
		{
			icon: 'less-half-present',
			label: 'Present for less than Half shift',
			value: 'present_less_shift',
		},
		{
			icon: 'absent',
			label: 'Absent',
			value: 'absent',
		},
	];
	@ViewChild(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
	constructor(
		config: NgbDropdownConfig,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private sitesService: SitesService,
		private regularizationService: RegularizationService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private timeShiftService: TimeShiftService,
		private attendanceService: AttendanceService,
		private modalService: NgbModal
	) {
		// customize default values of dropdowns used by this component tree
		config.autoClose = true;
		this.registerIcons();
	}

	createDays() {
		let days = Array.from(Array(moment(this.selectedDate).daysInMonth()), (_, i) => i + 1).map((element) => {
			return Object.assign({
				label: `${this.selectedDate.month(this.selectedDate.month()).format('MMM')} ${element}`,
				value: moment(`${this.selectedDate.year()}-${this.selectedDate.month() + 1}-${element}`).format(
					'YYYY-MM-DD'
				),
				sorting: false,
			});
		});
		this.headerColumn = this.headerColumn.concat(days);
		this.loadData();
	}

	selectMonthYear($event) {
		this.headerColumn = this.mainHeaderColumn;
		this.selectedDate = $event.value;
		this.createDays();
	}

	get selectedMonthYear() {
		this.selectedMonthNumber = this.selectedDate.format('MM');
		this.selectedYearNumber = this.selectedDate.format('YYYY');
		return `${this.selectedDate.format('MMM YYYY')}`;
	}

	getAttendanceData(item, date) {
		return item.attendance.find((element) => moment(element?.punchInDate).isSame(date));
	}

	ngOnInit(): void {
		this.loadSites();
	}

	calculateDateDifference(item) {
		return item.dayType === 'full_day'
			? moment.duration(moment(item.toDate).diff(moment(item.fromDate))).asDays() + 1
			: 0;
	}

	loadData(filters = {}): void {
		let params = {
			start: (this.page - 1) * this.pageSize,
			limit: this.pageSize,
			month: this.selectedDate.month() + 1,
			year: this.selectedDate.year(),
			...filters,
		};
		this.spinnerService.start();
		this.regularizationService.list(params).subscribe({
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

	onPageChange($event: number, event: string): void {
		if (this.isPrevious() && event === 'prev') {
			return;
		} else if (event === 'next' && this.isLastPage()) {
			return;
		}
		this.page = $event;
		this.loadData({
			search: this.searchTerm,
		});
	}

	isPrevious(): boolean {
		return this.page === 1;
	}
	isLastPage(): boolean {
		return this.page === Math.ceil(this.collectionSize / this.pageSize);
	}

	clearFilter() {
		this.searchTerm = null;
		this.selectedTimeShift = '';
		this.loadData({
			search: this.searchTerm,
			sitesId: this.selectedSites,
		});
	}

	applyFilters() {
		this.selectedTimeShift = '';
		this.loadTimeShift();
	}
	setFilters() {
		this.loadData({
			search: this.searchTerm,
			sitesId: this.selectedSites,
			timeShiftId: this.selectedTimeShift,
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

	loadSites(filters = {}): void {
		let params = {
			start: (this.pageSites - 1) * this.pageSize,
			limit: this.pageSize,
			...filters,
		};
		this.spinnerService.start();
		this.sitesService.list(params).subscribe({
			next: (result) => {
				this.sitesList = result.data;
				this.collectionSizeSites = result.data['count'];
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchSites($event) {
		this.loadSites({ search: $event.term });
	}
	onScrollSites() {
		if (this.sitesList.rows.length === this.collectionSizeSites) {
			return;
		}
		this.pageSites++;
		this.loadSites();
	}

	loadTimeShift(filters = {}) {
		let params = {
			start: 0,
			limit: this.pageSize,
			sitesId: this.selectedSites,
			...filters,
		};
		this.timeShiftService.list(params).subscribe({
			next: (result) => {
				this.timeShiftList = result.data;
				this.selectedTimeShift = this.timeShiftList['rows'].map((element) => element.id);
				this.loadData({
					search: this.searchTerm,
					sitesId: this.selectedSites,
					timeShiftId: this.selectedTimeShift,
				});
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	@ViewChild('TABLE') table: ElementRef;

	exportBulk(): void {
		const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		/* save to file */
		XLSX.writeFile(wb, `Regularization List ${moment().format('DD-MM-YYYY hh:mm a')}.xlsx`);
	}

	openBulkUpload(): void {
		const modalRef = this.modalService.open(RegularizationUploadComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.selectedDate = this.selectedDate.format('YYYY-MM-DD');
		modalRef.result.then(
			(result) => {
				this.loadData();
			},
			(dismiss) => {}
		);
	}
}
