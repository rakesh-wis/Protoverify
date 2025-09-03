import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SERVICES } from '../../../helpers';
import { Observable, forkJoin } from 'rxjs';
import { dashboardKeyBasedVerificationList } from 'src/app/helpers';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { DashboardOperationVerificationDetailsViewComponent } from '../dashboard-operation-verification-details-view/dashboard-operation-verification-details-view.component';
import { saveAs } from 'file-saver';
import moment from 'moment';

@Component({
	selector: 'app-dashboard-operation-verification-details',
	templateUrl: './dashboard-operation-verification-details.component.html',
	styleUrls: ['./dashboard-operation-verification-details.component.scss'],
})
export class DashboardOperationVerificationDetailsComponent implements OnInit {
	@ViewChild('allCandidateOpenCheckbox', { static: false }) allCandidateOpenCheckbox!: ElementRef<HTMLInputElement>;
	@ViewChild('allOpsOpenCheckbox', { static: false }) allOpsOpenCheckbox!: ElementRef<HTMLInputElement>;
	@ViewChild('allVendorOpenCheckbox', { static: false }) allVendorOpenCheckbox!: ElementRef<HTMLInputElement>;
	@ViewChild('allCompletedCheckbox', { static: false }) allCompletedCheckbox!: ElementRef<HTMLInputElement>;
	verificationName: string = null;
	icon: string = null;
	type: string = '';
	keyDetails: any = {};

	candidateOpenVerificationList = [];
	opsOpenVerificationList = [];
	vendorOpenVerificationList = [];
	completedVerificationList = [];
	dashboardKeyBasedVerificationList = dashboardKeyBasedVerificationList;

	candidateOpenSelectedData = [];
	opsOpenSelectedData = [];
	vendorOpenSelectedData = [];
	completedSelectedData = [];
	statusMapping = {
		candidateOpen: {
			list: this.candidateOpenVerificationList,
			selectedData: 'candidateOpenSelectedData',
			element: 'allCandidateOpenCheckbox',
			isSelected: false,
		},
		opsOpen: {
			list: this.opsOpenVerificationList,
			selectedData: 'opsOpenSelectedData',
			element: 'allOpsOpenCheckbox',
			isSelected: false,
		},
		vendorOpen: {
			list: this.vendorOpenVerificationList,
			selectedData: 'vendorOpenSelectedData',
			element: 'allVendorOpenCheckbox',
			isSelected: false,
		},
		completed: {
			list: this.completedVerificationList,
			selectedData: 'completedSelectedData',
			element: 'allCompletedCheckbox',
			isSelected: false,
		},
	};

	// dataList: any = {
	// 	data: [],
	// 	count: -1,
	// };
	dataList: any = {};
	page: any = {
		candidateOpen: 1,
		opsOpen: 1,
		vendorOpen: 1,
		completed: 1,
	};
	pageSize: number = 50;
	categoryLabel = 'Vendor Open';
	statusList: Array<{ label: string; name: string }> = [
		{ label: 'all', name: '' },
		{ label: 'medium', name: 'medium' },
		{ label: 'high', name: 'high' },
		{ label: 'critical', name: 'critical' },
	];
	statusFilter: string = '';
	vendorBasedChecks = [
		'police_verification_through_lawyer',
		'police_verification_through_police',
		'court_check',
		'drug_test',
		'global_database_check',
		'cibil',
		'directorship_test',
		'social_media_check',
		'ofac_check',
	];
	nonVendorBasedChecks = [
		'aadhar_card',
		'driving_license',
		'pan_card',
		'bank_account',
		'voter_id',
		'past_employment',
		'reference_check',
		'bank_statement',
		'postal_address',
	];

	constructor(
		private route: ActivatedRoute,
		private toastService: ToastService,
		private dashboardService: DashboardService,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.verificationName = params['name'];
		});
		this.type = this.route.snapshot.paramMap.get('type') || '';
		if (this.type === 'physical_verification' || this.type === 'permanent_address') {
			this.categoryLabel = 'FO Open';
		}
		this.getVerificationDetails();
	}

	getCheckDetails(item) {
		return this.dashboardKeyBasedVerificationList.find((e) => e.value == item);
	}

	getVerificationList(key: string): any[] {
		switch (key) {
			case 'candidateOpen':
				return this.candidateOpenVerificationList;
			case 'opsOpen':
				return this.opsOpenVerificationList;
			case 'completed':
				return this.completedVerificationList;
			case 'vendorOpen':
				return this.vendorOpenVerificationList;
			default:
				return [];
		}
	}

	clearVerificationList(key: string): void {
		switch (key) {
			case 'candidateOpen':
				this.candidateOpenVerificationList = [];
				break;
			case 'opsOpen':
				this.opsOpenVerificationList = [];
				break;
			case 'completed':
				this.completedVerificationList = [];
				break;
			case 'vendorOpen':
				this.vendorOpenVerificationList = [];
				break;
			default:
				break;
		}
	}

	getVerificationDetails(filters = {}): void {
		try {
			this.spinnerService.start();
			this.keyDetails = this.getCheckDetails(this.type);
			console.log(this.keyDetails);
			this.icon = this.keyDetails.icon;
			const serviceArray: Observable<any>[] = [];
			const params = [
				{ key: 'candidateOpen', status: 'candidate-open' },
				{ key: 'opsOpen', status: 'ops-open' },
				{ key: 'completed', status: 'completed' },
			];

			if (this.keyDetails.category.includes('Vendor Open')) {
				params.push({ key: 'vendorOpen', status: 'vendor-open' });
			}

			params.forEach((param) => {
				const serviceParams = {
					start: (this.page[param.key] - 1) * this.pageSize,
					limit: this.pageSize,
					status: param.status === 'vendor-open' ? 'field-officer-open' : param.status,
					...filters,
				};

				serviceArray.push(
					this.dashboardService.getVerificationDetails(this.type, serviceParams, this.keyDetails.service)
				);
			});
			forkJoin(serviceArray).subscribe({
				next: (response: any[]) => {
					try {
						this.spinnerService.stop();
						params.forEach((param) => {
							this.clearVerificationList(param.key);
							this.page[param.key] = 1;
						});
						// Store responses in respective lists
						// Check if each response is defined before accessing its data property
						response.forEach((response, index) => {
							if (response && response.data) {
								const key = params[index].key;
								const dataList = this.getVerificationList(key);
								dataList.push(response.data);
								this.statusMapping[key].list = dataList;
								this.page[key] = this.page[key] + 1;
							}
						});
						console.log(this.statusMapping);
					} catch (error) {
						this.spinnerService.stop();
						this.toastService.error(error);
					}
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error('Error fetching data.');
				},
			});
		} catch (error) {
			this.spinnerService.stop();
			this.toastService.error(error);
		}
	}

	loadMore(status: string, filters = {}): void {
		try {
			const params = {
				start: (this.page[status.replace(/-./g, (match) => match[1].toUpperCase())] - 1) * this.pageSize,
				limit: this.pageSize,
				status: status === 'vendor-open' ? 'field-officer-open' : status, // as in BE  'field-officer-open' is accepting as param
				...filters,
			};
			this.dashboardService.getVerificationDetails(this.type, params, this.keyDetails.service).subscribe({
				next: (response) => {
					try {
						if (response && response.data) {
							if (status == 'candidate-open') {
								this.candidateOpenVerificationList[0].rows.push(...response.data.rows);
							} else if (status == 'ops-open') {
								this.opsOpenVerificationList[0].rows.push(...response.data.rows);
							} else if (status == 'vendor-open') {
								this.vendorOpenVerificationList[0].rows.push(...response.data.rows);
							} else {
								this.completedVerificationList[0].rows.push(...response.data.rows);
							}
						}
						this.page[status.replace(/-./g, (match) => match[1].toUpperCase())] =
							this.page[status.replace(/-./g, (match) => match[1].toUpperCase())] + 1;
					} catch (error) {
						this.toastService.error(error);
					}
				},
				error: (error) => {
					this.toastService.error(error);
				},
			});
		} catch (error) {
			this.toastService.error(error);
		}
	}

	selectAll($event, statusVal) {
		let status = statusVal.replace(/-./g, (match) => match[1].toUpperCase());
		this.dataList = [];
		if (this.statusMapping[status]) {
			this.dataList = this.statusMapping[status].list[0];
			this[this.statusMapping[status].selectedData] = this.dataList?.rows?.map((e) =>
				Object.assign(e, { selected: $event.target.checked })
			);

			this.statusMapping[status].isSelected = $event.target.checked;
			if (!this.statusMapping[status].isSelected) {
				this[this.statusMapping[status].selectedData] = [];
			}
		}
	}

	singleSelect($event: any, item, statusVal) {
		$event.stopPropagation();
		let status = statusVal.replace(/-./g, (match) => match[1].toUpperCase());
		if (this.statusMapping[status]) {
			const selectedDataKey = this.statusMapping[status].selectedData;
			const selectedData = this[selectedDataKey];
			if (selectedData && Array.isArray(selectedData)) {
				if (!$event.target.checked) {
					const index = selectedData.findIndex((e) => e.id === item.id);
					if (index !== -1) {
						selectedData.splice(index, 1);
					}
					if (this[this.statusMapping[status].selectedData].length === 0) {
						this.statusMapping[status].isSelected = false;
						if (this[this.statusMapping[status].element]) {
							this[this.statusMapping[status].element].nativeElement.checked = false;
						}
					}
				} else {
					item.selected = true;
					selectedData.push(item);
					this.statusMapping[status].isSelected = true;
				}
			} else {
				this.toastService.error(`selectedData is not an array for status: ${status}`);
			}
		} else {
			this.toastService.error(`Invalid status: ${status}`);
		}
	}

	exportBulk(statusVal: string): void {
		try {
			this.spinnerService.start();
			let status = statusVal.replace(/-./g, (match) => match[1].toUpperCase());
			let selectedIds = [];
			this[this.statusMapping[status].selectedData].map((item) => {
				selectedIds.push(item.id);
			});
			const params = {
				status: statusVal,
				userIds: [...selectedIds],
			};

			this.dashboardService.getExportData(this.type, params, this.keyDetails.service).subscribe({
				next: (result) => {
					saveAs(result, `VerificationCheckDetails ${moment().format('DD-MM-YYYY hh:mm a')}`);
					this.spinnerService.stop();
				},
				error: (error) => {
					this.spinnerService.stop();
					this.toastService.error(error);
				},
			});
		} catch (error) {
			this.spinnerService.stop();
			this.toastService.error(error);
		}
	}

	onScroll(status: string): void {
		this.loadMore(status, { tatStatus: this.statusFilter });
	}

	viewCheckDetails(event: Event, employeeId) {
		event.stopPropagation();
		let empData = {};
		const modalRef = this.modalService.open(DashboardOperationVerificationDetailsViewComponent, {
			centered: true,
			size: 'sm',
			backdrop: 'static',
		});
		empData = { empId: employeeId, type: this.type, path: this.keyDetails.path };
		modalRef.componentInstance.modelData = empData;
		modalRef.result.then(
			(result) => {},
			(dismiss) => {}
		);
	}

	resetPage() {
		this.page.candidateOpen = this.page.opsOpen = this.page.vendorOpen = this.page.completed = 1;
	}

	clearFilter() {
		this.statusFilter = '';
		this.resetPage();
		this.getVerificationDetails({ tatStatus: this.statusFilter });
	}
	applyFilters() {
		this.resetPage();
		this.getVerificationDetails({ tatStatus: this.statusFilter });
	}
	navigatesToCheck(empId, empName): void {
		this.router.navigate([`/direct-verification/${empId}/${this.keyDetails.path}`], {
			queryParams: { id: empId, name: empName },
		});
	}

	stopPropagation($event: Event): void {
		$event.stopPropagation();
	}
}
