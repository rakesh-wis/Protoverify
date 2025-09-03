import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PanCardComponent } from './pan-card/pan-card.component';
import { AadharCardComponent } from './aadhar-card/aadhar-card.component';
import { DrivingLicenseComponent } from './driving-license/driving-license.component';
import { BankDetailsComponent } from './bank-details/bank-details.component';
import { SharedModule } from '../../shared/shared.module';
import { EducationalDetailsComponent } from './educational-details/educational-details.component';
import { PostalAddressComponent } from './postal-address/postal-address.component';
import { SelfComponent } from './self/self.component';
import { PoliceVerificationLawyerComponent } from './police-verification-lawyer/police-verification-lawyer.component';
import { PoliceVerificationPoliceComponent } from './police-verification-police/police-verification-police.component';
import { PhysicalAddressComponent } from './physical-address/physical-address.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserOrganizationComponent } from './user-organization/user-organization.component';
import { PastEmploymentCheckListComponent } from './past-employment-check-list/past-employment-check-list.component';
import { PastEmploymentCheckDetailsComponent } from './past-employment-check-details/past-employment-check-details.component';
import { CrimeCheckComponent } from './crime-check/crime-check.component';
import { CourtListComponent } from './court-list/court-list.component';
import { CourtDetailsComponent } from './court-details/court-details.component';
import { EducationListComponent } from './education-list/education-list.component';
import { PhysicalVerificationComponent } from './physical-verification/physical-verification.component';
import { ChangeStatusComponent } from './change-status/change-status.component';
import { VerificationStatusComponent } from './verification-status/verification-status.component';
import { OtpInputModule } from '../otp-input/otp-input.module';
import { NgOtpInputModule } from 'ng-otp-input';
import { ReferenceCheckListComponent } from './reference-check-list/reference-check-list.component';
import { ReferenceCheckDetailsComponent } from './reference-check-details/reference-check-details.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { GlobalDatabaseCheckComponent } from './global-database-check/global-database-check.component';
import { DualEmploymentCheckComponent } from './dual-employment-check/dual-employment-check.component';
import { CibilCheckComponent } from './cibil-check/cibil-check.component';
import { CompletionModalComponent } from './completion-modal/completion-modal.component';
import { DrugTestComponent } from './drug-test/drug-test.component';
import { DirectorshipTestComponent } from './directorship-test/directorship-test.component';
import { SocialMediaCheckComponent } from './social-media-check/social-media-check.component';
import { RcCheckComponent } from './rc-check/rc-check.component';
import { GapCheckComponent } from './gap-check/gap-check.component';
import { PassportCheckComponent } from './passport-check/passport-check.component';
import { AadharCardAddressComponent } from './aadhar-card-address/aadhar-card-address.component';
import { PermanentAddressComponent } from './permanent-address/permanent-address.component';
import { BankStatementComponent } from './bank-statement/bank-statement.component';
import { VoterIdComponent } from './voter-id/voter-id.component';
import { OfacCheckComponent } from './ofac-check/ofac-check.component';
import { UserBulkUploadComponent } from './user-bulk-upload/user-bulk-upload.component';
import { VerificationStatusPopoverComponent } from './verification-status-popover/verification-status-popover.component';

@NgModule({
	declarations: [
		PanCardComponent,
		AadharCardComponent,
		DrivingLicenseComponent,
		BankDetailsComponent,
		EducationalDetailsComponent,
		PostalAddressComponent,
		SelfComponent,
		PoliceVerificationLawyerComponent,
		PoliceVerificationPoliceComponent,
		PhysicalAddressComponent,
		UserDetailsComponent,
		UserOrganizationComponent,
		PastEmploymentCheckListComponent,
		PastEmploymentCheckDetailsComponent,
		CrimeCheckComponent,
		CourtListComponent,
		CourtDetailsComponent,
		EducationListComponent,
		PhysicalVerificationComponent,
		ChangeStatusComponent,
		VerificationStatusComponent,
		ReferenceCheckListComponent,
		ReferenceCheckDetailsComponent,
		StatusBarComponent,
		GlobalDatabaseCheckComponent,
		DualEmploymentCheckComponent,
		CibilCheckComponent,
		CompletionModalComponent,
		DirectorshipTestComponent,
		DrugTestComponent,
		SocialMediaCheckComponent,
		RcCheckComponent,
		GapCheckComponent,
		PassportCheckComponent,
		AadharCardAddressComponent,
		PermanentAddressComponent,
		BankStatementComponent,
		VoterIdComponent,
		OfacCheckComponent,
		UserBulkUploadComponent,
		VerificationStatusPopoverComponent
	],
	imports: [
		CommonModule, 
		SharedModule, 
		FormsModule,
    	ReactiveFormsModule,
		NgOtpInputModule
	],
	exports: [
		PanCardComponent,
		AadharCardComponent,
		DrivingLicenseComponent,
		BankDetailsComponent,
		PastEmploymentCheckDetailsComponent,
		VerificationStatusComponent,
		VerificationStatusPopoverComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VerificationModule {}
