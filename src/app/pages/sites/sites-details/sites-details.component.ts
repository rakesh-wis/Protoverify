import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICountry, IState } from 'country-state-city/lib/interface';
import { RegionsService } from 'src/app/core/services/regions.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SitesService } from 'src/app/core/services/sites.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { OPTIONS } from 'src/app/helpers';
import { siteFieldForm } from 'src/app/helpers/form-error.helper';
import { validateField } from 'src/app/shared/validators/form.validator';
import { SitesLocationComponent } from '../sites-location/sites-location.component';

@Component({
	selector: 'app-sites-details',
	templateUrl: './sites-details.component.html',
	styleUrls: ['./sites-details.component.scss'],
})
export class SitesDetailsComponent implements OnInit {
	countryList: Array<ICountry> = [];
	states: Array<IState> = [];
	countryCode = 'IN';
	regionList: any = [];
	@Input() siteId: number;
	dataForm = new FormGroup({
		id: new FormControl(null),
		website: new FormControl('', [Validators.pattern(OPTIONS.websiteWithOutHttpPattern)]),
		name: new FormControl('', [Validators.required]),
		email: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.emailPattern)]),
		countryCode: new FormControl('91', [Validators.required]),
		mobileNumber: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		contactName: new FormControl('', [Validators.required]),
		addressLine1: new FormControl('', [Validators.required]),
		addressLine2: new FormControl(''),
		pincode: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{2}[0-9]{3}$/)]),
		countryName: new FormControl('India', [Validators.required]),
		state: new FormControl('', [Validators.required]),
		city: new FormControl('', [Validators.required]),
		regionId: new FormControl('', [Validators.required]),
		latitude: new FormControl('', [Validators.required]),
		longitude: new FormControl('', [Validators.required]),
		geoFence: new FormControl('', Validators.required),
	});
	errorMessages = siteFieldForm;
	isMobileNumberValid: boolean = false;
	constructor(
		private sharedService: SharedService,
		private sitesService: SitesService,
		private regionService: RegionsService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private modalService: NgbModal,
		public activeModal: NgbActiveModal
	) {}

	ngOnInit(): void {
		this.getRegions();
		this.countryList = this.sharedService.getCountries();
		this.states = this.sharedService.getStatesOfCountry(this.countryCode);
		if (this.siteId) {
			this.getDataById();
		}
	}

	get form() {
		return this.dataForm.controls;
	}
	/**
	 * close modal
	 */
	closeModal() {
		this.activeModal.close('close with cancel button');
	}
	/**
	 * dismiss modal
	 */
	dismissModal() {
		this.modalService.dismissAll('dismiss with cross click');
	}
	getRegions(): void {
		this.regionService.sharedList({}).subscribe({
			next: (result) => {
				this.regionList = result.data['rows'];
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}

	getDataById(): void {
		this.sitesService.getById(this.siteId).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.dataForm.patchValue(result.data);
				if (result.data.geometry) {
					this.form['latitude'].setValue(result.data.geometry.latitude);
					this.form['longitude'].setValue(result.data.geometry.longitude);
				}
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	receiveValidNumberEvent($event) {
		this.isMobileNumberValid = $event;
	}
	searchPincode() {
		if (this.dataForm.get('pincode').value.toString().length < 6) {
			return;
		}
		this.sharedService.searchPincode(this.dataForm.get('pincode').value).subscribe(
			(result) => {
				if (result.PostOffice) {
					this.dataForm.get('city').setValue(result.PostOffice[0].District);
					this.dataForm.get('state').setValue(result.PostOffice[0].State);
				} else if (result.Status === 'Error') {
					this.toastService.error('Invalid pincode');
				}
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
	onSubmit(): void {
		if (this.dataForm.invalid || !this.isMobileNumberValid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.form['id'].value === null) this.create();
		else this.update();
	}

	create(): void {
		this.sitesService.create(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	update(): void {
		this.sitesService.update(this.dataForm.getRawValue()).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.closeModal();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	goBack(): void {
		this.location.back();
	}
	addLocation() {
		const modalRef = this.modalService.open(SitesLocationComponent, {
			centered: true,
			size: 'lg',
			backdrop: 'static',
		});
		modalRef.componentInstance.modelData = {
			latitude: this.form['latitude'].value,
			longitude: this.form['longitude'].value,
			geoFence: this.form['geoFence'].value,
		};
		modalRef.result.then(
			(result) => {
				console.log(result);
				this.form['latitude'].setValue(result.latitude);
				this.form['longitude'].setValue(result.longitude);
				this.form['geoFence'].setValue(result.geoFence);
				this.toastService.success('Geo location is marked');
			},
			(dismiss) => {}
		);
	}
}
