import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AadharCardComponent } from '../verification/aadhar-card/aadhar-card.component';
import { BankDetailsComponent } from '../verification/bank-details/bank-details.component';
import { DrivingLicenseComponent } from '../verification/driving-license/driving-license.component';
import { EducationListComponent } from '../verification/education-list/education-list.component';
import { PanCardComponent } from '../verification/pan-card/pan-card.component';
import { PhysicalAddressComponent } from '../verification/physical-address/physical-address.component';
import { PoliceVerificationLawyerComponent } from '../verification/police-verification-lawyer/police-verification-lawyer.component';
import { PoliceVerificationPoliceComponent } from '../verification/police-verification-police/police-verification-police.component';
import { PostalAddressComponent } from '../verification/postal-address/postal-address.component';
import { SelfComponent } from '../verification/self/self.component';
import { UserOrganizationComponent } from '../verification/user-organization/user-organization.component';
import { DirectVerificationListComponent } from './direct-verification-list/direct-verification-list.component';
import { PastEmploymentCheckListComponent } from '../verification/past-employment-check-list/past-employment-check-list.component';
import { CrimeCheckComponent } from '../verification/crime-check/crime-check.component';
import { PhysicalVerificationComponent } from '../verification/physical-verification/physical-verification.component';
import { PreventUnsavedChangesSegmentDeactivateGuard } from '../../core/services/prevent-unsaved-changes-segment-deactivate-guard.service';
import { ReferenceCheckListComponent } from '../verification/reference-check-list/reference-check-list.component';
import { GlobalDatabaseCheckComponent } from '../verification/global-database-check/global-database-check.component';
import { DualEmploymentCheckComponent } from '../verification/dual-employment-check/dual-employment-check.component';
import { CibilCheckComponent } from '../verification/cibil-check/cibil-check.component';
import { DrugTestComponent } from '../verification/drug-test/drug-test.component';
import { DirectorshipTestComponent } from '../verification/directorship-test/directorship-test.component';
import { SocialMediaCheckComponent } from '../verification/social-media-check/social-media-check.component';
import { RcCheckComponent } from '../verification/rc-check/rc-check.component';
import { GapCheckComponent } from '../verification/gap-check/gap-check.component';
import { PassportCheckComponent } from '../verification/passport-check/passport-check.component';
import { PermanentAddressComponent } from '../verification/permanent-address/permanent-address.component';
import { BankStatementComponent } from '../verification/bank-statement/bank-statement.component';
import { VoterIdComponent } from '../verification/voter-id/voter-id.component';
import { OfacCheckComponent } from '../verification/ofac-check/ofac-check.component';

const routes: Routes = [
	{ path: '', redirectTo: 'list', pathMatch: 'full' },
	{ path: 'list', component: DirectVerificationListComponent },
	{
		path: ':id/organization-details',
		component: UserOrganizationComponent,
		data: {
			breadcrumb: 'Organization Name',
		},
	},
	{
		path: ':id/aadhar-card',
		component: AadharCardComponent,
		canDeactivate: [PreventUnsavedChangesSegmentDeactivateGuard],
		data: {
			breadcrumb: 'Aadhaar Card',
		},
	},
	{
		path: ':id/pan-card',
		component: PanCardComponent,
		data: {
			breadcrumb: 'PAN Card',
		},
	},
	{
		path: ':id/driving-license',
		component: DrivingLicenseComponent,
		data: {
			breadcrumb: 'Driving License',
		},
	},
	{
		path: ':id/bank-statement',
		component: BankStatementComponent,
		data: {
			breadcrumb: 'Bank Statement',
		},
	},
	{
		path: ':id/bank-details',
		component: BankDetailsComponent,
		data: {
			breadcrumb: 'Bank Account',
		},
	},
	{
		path: ':id/voter-id',
		component: VoterIdComponent,
		data: {
			breadcrumb: 'Voter ID Check',
		},
	},
	{
		path: ':id/self-verification',
		component: SelfComponent,
		data: {
			breadcrumb: 'Self Verification',
		},
	},
	{
		path: ':id/physical-verification',
		component: PhysicalVerificationComponent,
		data: {
			breadcrumb: 'Current Address Physical Verification',
		},
	},
	{
		path: ':id/educational-details',
		component: EducationListComponent,
		data: {
			breadcrumb: 'Educational Check',
		},
	},
	{
		path: ':id/police-lawyer',
		component: PoliceVerificationLawyerComponent,
		data: {
			breadcrumb: 'Police Verification through Lawyer',
		},
	},
	{
		path: ':id/police-verification',
		component: PoliceVerificationPoliceComponent,
		data: {
			breadcrumb: 'Police Verification through Police',
		},
	},
	{ path: ':id/postal-address', component: PostalAddressComponent },
	{
		path: ':id/physical-address',
		component: PhysicalAddressComponent,
		data: {
			breadcrumb: 'Address Details',
		},
	},
	{
		path: ':id/past-employment',
		component: PastEmploymentCheckListComponent,
		data: {
			breadcrumb: 'Past Employment Check',
		},
	},
	{
		path: ':id/reference-check',
		component: ReferenceCheckListComponent,
		data: {
			breadcrumb: 'Reference Check',
		},
	},
	{
		path: ':id/court-check',
		component: CrimeCheckComponent,
		data: {
			breadcrumb: 'Court Check',
		},
	},
	{
		path: ':id/global-database-check',
		component: GlobalDatabaseCheckComponent,
		data: {
			breadcrumb: 'Global Database Check',
		},
	},
	{
		path: ':id/dual-employment-check',
		component: DualEmploymentCheckComponent,
		data: {
			breadcrumb: 'Dual Employment Check',
		},
	},
	{
		path: ':id/cibil-check',
		component: CibilCheckComponent,
		data: {
			breadcrumb: 'CIBIL Check',
		},
	},
	{
		path: ':id/directorship-test',
		component: DirectorshipTestComponent,
		data: {
			breadcrumb: 'DIRECTORSHIP Test',
		},
	},
	{
		path: ':id/drug-test',
		component: DrugTestComponent,
		data: {
			breadcrumb: 'DRUG Test',
		},
	},
	{
		path: ':id/social-media-check',
		component: SocialMediaCheckComponent,
		data: {
			breadcrumb: 'Social Media Check',
		},
	},
	{
		path: ':id/gap-check',
		component: GapCheckComponent,
		data: {
			breadcrumb: 'Gap Check',
		},
	},
	{
		path: ':id/rc-check',
		component: RcCheckComponent,
		data: {
			breadcrumb: 'RC Check',
		},
	},
	{
		path: ':id/passport-check',
		component: PassportCheckComponent,
		data: {
			breadcrumb: 'Passport Check',
		},
	},
	{
		path: ':id/ofac-check',
		component: OfacCheckComponent,
		data: {
			breadcrumb: 'OFAC Check',
		},
	},
	{
		path: ':id/permanent-address',
		component: PermanentAddressComponent,
		data: {
			breadcrumb: 'Permanent Address Physical Verification',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class DirectVerificationRoutingModule {}
