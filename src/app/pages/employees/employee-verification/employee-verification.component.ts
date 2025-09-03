import { Component, Input, OnInit } from '@angular/core';
import { AddressService } from 'src/app/core/services/address.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { KycService } from 'src/app/core/services/kyc.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { educationalDocuments, kycStatus, planFeatures, selfVerificationDocument } from 'src/app/helpers';

@Component({
	selector: 'app-employee-verification',
	templateUrl: './employee-verification.component.html',
	styleUrls: ['./employee-verification.component.scss'],
})
export class EmployeeVerificationComponent implements OnInit {
	@Input() employeeId: number;
	basicDetails: any = {};
	address: any = {};
	aadharCard: any = {};
	panCard: any = {};
	drivingLicense: any = {};
	educationalDetails: any = {};
	selfVerification: any = {};
	advancedVerificationList = [
		{
			label: 'Police verification through Lawyer',
			value: planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
			data: {},
		},
		{
			label: 'Police verification through Police',
			value: planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
			data: {},
		},
		{
			label: 'Crime check',
			value: planFeatures.CRIME_CHECK,
			data: {},
		},
		{
			label: 'Court check',
			value: planFeatures.COURT_CHECK,
			data: {},
		},
		{
			label: 'Forensic verification',
			value: planFeatures.FORENSIC,
			data: {},
		},
	];

	selfVerificationList = [
		{
			label: 'Photo of front of house',
			mediaType: selfVerificationDocument.FRONT_HOUSE,
		},
		{
			label: 'Photo of inside of house',
			mediaType: selfVerificationDocument.INSIDE_HOUSE,
		},
	];
	kycStatus = kycStatus;
	businessDocuments = educationalDocuments;
	constructor(
		private employeeService: EmployeeService,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private addressService: AddressService,
		private kycService: KycService,
		private verificationDetailsService: VerificationDetailsService
	) {}

	ngOnInit(): void {
		if (this.employeeId) {
			this.getDataById();
			this.getAddress();
			this.getDocuments();
			this.getKycDetails();
		}
	}

	getDataById(): void {
		this.employeeService.getById(this.employeeId).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.basicDetails = result.data;
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	getAddress(): void {
		let params = {};
		if (this.employeeId) {
			params['userId'] = this.employeeId;
		}
		this.addressService.getData(params).subscribe({
			next: (result) => {
				this.address = result.data['count'] > 0 ? result.data['rows'][0] : {};
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	getDocuments(): void {
		let params = {};
		if (this.employeeId) {
			params['userId'] = this.employeeId;
		}
		this.spinnerService.start();
		this.verificationDetailsService.list(params).subscribe({
			next: (result) => {
				if (result.data) {
					let payload = result.data;
					this.advancedVerificationList[0].data = payload.find(
						(e) => e.type === planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER
					);
					this.advancedVerificationList[1].data = payload.find(
						(e) => e.type === planFeatures.POLICE_VERIFICATION_THROUGH_POLICE
					);
					this.advancedVerificationList[2].data = payload.find((e) => e.type === planFeatures.CRIME_CHECK);
					this.advancedVerificationList[3].data = payload.find((e) => e.type === planFeatures.COURT_CHECK);
					this.advancedVerificationList[4].data = payload.find((e) => e.type === planFeatures.FORENSIC);
					const educationalDetails = payload.find((e) => e.type === planFeatures.EDUCATIONAL);
					if (educationalDetails) {
						this.educationalDetails = {
							id: educationalDetails.id,
							status: educationalDetails.status,
							additionalDetails: null,
							type: planFeatures.EDUCATIONAL,
							verificationMedia: [],
						};
						this.businessDocuments.forEach((element, index) => {
							let item = educationalDetails.verificationMedia.find(
								(access) => access.mediaType === element.mediaType
							);
							if (item) {
								item.label = element.label;
								this.educationalDetails.verificationMedia.push(item);
							}
						});
					}

					const selfVerification = payload.find((e) => e.type === planFeatures.SELF_VERIFICATION);
					if (selfVerification) {
						this.selfVerification = {
							id: selfVerification.id,
							status: selfVerification.status,
							additionalDetails: null,
							type: planFeatures.SELF_VERIFICATION,
							verificationMedia: [],
						};

						this.selfVerificationList.forEach((element, index) => {
							let item = selfVerification.verificationMedia.find(
								(access) => access.mediaType === element.mediaType
							);
							if (item) {
								item.label = element.label;
								this.selfVerification.verificationMedia.push(item);
							}
						});
					}
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	getKycDetails(): void {
		let params = {};
		if (this.employeeId) {
			params['userId'] = this.employeeId;
		}
		this.spinnerService.start();
		this.kycService.list(params).subscribe({
			next: (result) => {
				if (result.data) {
					let payload = result.data;
					this.aadharCard = payload.find((element) => element.type === planFeatures.AADHAR_CARD);
					if (this.aadharCard) {
						this.aadharCard.additionalDetails = JSON.parse(this.aadharCard.additionalDetails);
					}
					this.panCard = payload.find((element) => element.type === planFeatures.PAN_CARD);
					this.drivingLicense = payload.find((element) => element.type === planFeatures.DRIVING_LICENSE);
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	downloadDocument(url: string) {
		window.open(url, '_blank');
	}
}
