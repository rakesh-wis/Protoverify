import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SERVICES } from '../../../../helpers';
import { forkJoin } from 'rxjs';
import { planFeatures } from 'src/app/helpers';

@Component({
	selector: 'app-verification-tickets-by-checks',
	templateUrl: './verification-tickets-by-checks.component.html',
	styleUrls: ['./verification-tickets-by-checks.component.scss'],
})
export class VerificationTicketsByChecksComponent implements OnInit {
	planFeatures = planFeatures;
	apiBasedVerificationKeys = ['aadhar_card', 'driving_license', 'pan_card', 'bank_account', 'voter_id'];
	manualVerificationKeys = [
		'past_employment',
		'reference_check',
		'physical_verification',
		'self_verification',
		'permanent_address',
		'passport_check',
		'bank_statement',
		'postal_address',
	];
	vendorBasedVerificationKeys = [
		'court_check',
		'educational_verification',
		'police_verification_through_lawyer',
		'global_database_check',
		'dual_employment',
		'police_verification_through_police',
		'cibil',
		'directorship_test',
		'drug_test',
		'social_media_check',
		'gap_check',
		'rc_check',
		'ofac_check',
	];

	details = {
		aadhar_card: {
			name: 'Aadhaar Verification',
			icon: '/assets/images/kyc_aadhar.svg',
			type: this.planFeatures.AADHAR_CARD,
		},
		driving_license: {
			name: 'Driving License',
			icon: '/assets/images/kyc_driving.svg',
			type: this.planFeatures.DRIVING_LICENSE,
		},
		pan_card: {
			name: 'PAN Card Verification',
			icon: '/assets/images/kyc_pan.svg',
			type: this.planFeatures.PAN_CARD,
		},
		bank_account: {
			name: 'Bank Account Verification',
			icon: '/assets/images/kyc_bank.svg',
			type: this.planFeatures.BANK_ACCOUNT,
		},

		past_employment: {
			name: 'Past Employment Verification',
			icon: '/assets/images/kyc_past_employment.svg',
			type: this.planFeatures.PAST_EMPLOYMENT,
		},
		reference_check: {
			name: 'Reference Check',
			icon: '/assets/images/kyc_reference_check.svg',
			type: this.planFeatures.REFERENCE_CHECK,
		},
		physical_verification: {
			name: 'Current Address Physical Verification',
			icon: '/assets/images/kyc_physical_verification.svg',
			type: this.planFeatures.PHYSICAL_VERIFICATION,
		},
		self_verification: {
			name: 'Self Address Verification',
			icon: '/assets/images/kyc_self.svg',
			type: this.planFeatures.SELF_VERIFICATION,
		},
		permanent_address: {
			name: 'Permanent Address Physical Verification',
			icon: '/assets/images/permanent_address.svg',
			type: this.planFeatures.PERMANENT_ADDRESS,
		},
		passport_check: {
			name: 'Passport Check',
			icon: '/assets/images/kyc_passport.svg',
			type: this.planFeatures.PASSPORT_CHECK,
		},

		bank_statement: {
			name: 'Bank Statement Verification',
			icon: '/assets/images/bank-statement.png',
			type: this.planFeatures.BANK_STATEMENT,
		},

		postal_address: {
			name: 'Postal Address Verification',
			icon: '/assets/images/kyc_address.svg',
			type: this.planFeatures.POSTAL_ADDRESS,
		},

		court_check: {
			name: 'Crime Check',
			icon: '/assets/images/kyc_court_check.svg',
			type: this.planFeatures.COURT_CHECK,
		},
		educational_verification: {
			name: 'Education Verification',
			icon: '/assets/images/kyc_education.svg',
			type: this.planFeatures.EDUCATIONAL,
			//type: 'educationalVerification',
		},
		police_verification_through_lawyer: {
			name: 'Police Verification through Lawyer',
			icon: '/assets/images/kyc_police_lawyer.svg',
			type: this.planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
		},
		global_database_check: {
			name: 'Global Database Check',
			icon: '/assets/images/global-database-check.svg',
			type: this.planFeatures.GLOBAL_DATABASE_CHECK,
		},
		dual_employment: {
			name: 'Dual Employment Check',
			icon: '/assets/images/kyc_dual_employment.svg',
			type: this.planFeatures.DUAL_EMPLOYMENT,
		},
		police_verification_through_police: {
			name: 'Police Verification through Police',
			icon: '/assets/images/kyc_police.svg',
			type: this.planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
		},
		cibil: {
			name: 'Cibil Check',
			icon: '/assets/images/kyc_cibil.svg',
			type: this.planFeatures.CIBIL,
		},
		directorship_test: {
			name: 'Directorship Check',
			icon: '/assets/images/kyc_directorship.svg',
			type: this.planFeatures.DIRECTORSHIP_TEST,
		},
		drug_test: {
			name: 'Drug Test',
			icon: '/assets/images/kyc_drug.svg',
			type: this.planFeatures.DRUG_TEST,
		},
		social_media_check: {
			name: 'Social Media Check',
			icon: '/assets/images/kyc_social.svg',
			type: this.planFeatures.SOCIAL_MEDIA_CHECK,
		},
		gap_check: {
			name: 'Gap Check',
			icon: '/assets/images/kyc_gap.svg',
			type: this.planFeatures.GAP_CHECK,
		},
		rc_check: {
			name: 'RC Check',
			icon: '/assets/images/rc-check.svg',
			type: this.planFeatures.RC_CHECK,
		},
		ofac_check: {
			name: 'OFAC Check',
			icon: '/assets/images/kyc_ofac.svg',
			type: this.planFeatures.OFAC_CHECK,
		},
		voter_id: {
			name: 'Voter Id',
			icon: '/assets/images/kyc_voter_id.svg',
			type: this.planFeatures.VOTER_ID,
		},
	};

	apiBasedVerificationList = [];
	manualVerificationList = [];
	vendorBasedVerificationList = [];
	verificationList = {};

	constructor(
		private router: Router,
		private toastService: ToastService,
		private dashboardService: DashboardService
	) {}

	ngOnInit(): void {
		this.getVerificationStats();
	}

	getVerificationStats(filters = {}): void {
		try {
			const userServiceVerificationList = this.dashboardService.getOperationFlowVerificationStats(
				filters,
				SERVICES.USER
			);
			const verificationServiceVerificationList = this.dashboardService.getOperationFlowVerificationStats(
				filters,
				SERVICES.VERIFICATION
			);

			forkJoin([userServiceVerificationList, verificationServiceVerificationList]).subscribe({
				next: (response) => {
					try {
						this.verificationList = {
							...this.verificationList,
							...response[0].data,
							...response[1].data,
						};

						const verificationNames = Object.keys(this.verificationList);
						console.log(verificationNames);
						verificationNames.forEach((v_name) => {
							if (this.apiBasedVerificationKeys.includes(v_name)) {
								this.apiBasedVerificationList.push({
									name: this.details[v_name]?.name,
									icon: this.details[v_name]?.icon,
									type: this.details[v_name]?.type,
									count: this.verificationList?.[v_name]?.count,
									path: this.details[v_name]?.name?.replaceAll?.(' ', '-')?.toLowerCase?.(),
								});
							}
							if (this.manualVerificationKeys.includes(v_name)) {
								this.manualVerificationList.push({
									name: this.details[v_name]?.name,
									icon: this.details[v_name]?.icon,
									type: this.details[v_name]?.type,
									count: this.verificationList?.[v_name]?.count,
									path: this.details[v_name]?.name?.replaceAll?.(' ', '-')?.toLowerCase?.(),
								});
							}
							if (this.vendorBasedVerificationKeys.includes(v_name)) {
								this.vendorBasedVerificationList.push({
									name: this.details[v_name]?.name,
									icon: this.details[v_name]?.icon,
									type: this.details[v_name]?.type,
									count: this.verificationList?.[v_name]?.count,
									path: this.details[v_name]?.name?.replaceAll?.(' ', '-')?.toLowerCase?.(),
								});
							}
						});
					} catch (error) {
						console.error('Error processing verification data:', error);
						//this.toastService.error('Error processing verification data.');
						this.toastService.error(error);
					}
				},
				error: (error) => {
					console.error('Error fetching verification stats:', error);
					this.toastService.error('Error fetching verification stats.');
				},
			});
		} catch (error) {
			console.error('Unexpected error:', error);
			//this.toastService.error('Unexpected error occurred.');
			this.toastService.error(error);
		}
	}

	navigateTo(path) {
		this.router.navigateByUrl(path);
	}
}
