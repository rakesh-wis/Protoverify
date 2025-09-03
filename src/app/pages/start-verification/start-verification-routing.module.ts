import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AadharCardComponent } from '../verification/aadhar-card/aadhar-card.component';
import { BankDetailsComponent } from '../verification/bank-details/bank-details.component';
import { DrivingLicenseComponent } from '../verification/driving-license/driving-license.component';
import { EducationListComponent } from '../verification/education-list/education-list.component';
import { PanCardComponent } from '../verification/pan-card/pan-card.component';
import { PastEmploymentCheckListComponent } from '../verification/past-employment-check-list/past-employment-check-list.component';
import { PhysicalAddressComponent } from '../verification/physical-address/physical-address.component';
import { PoliceVerificationLawyerComponent } from '../verification/police-verification-lawyer/police-verification-lawyer.component';
import { PoliceVerificationPoliceComponent } from '../verification/police-verification-police/police-verification-police.component';
import { PostalAddressComponent } from '../verification/postal-address/postal-address.component';
import { SelfComponent } from '../verification/self/self.component';
import { UserOrganizationComponent } from '../verification/user-organization/user-organization.component';
import { StartVerificationListComponent } from './start-verification-list/start-verification-list.component';
import { CrimeCheckComponent } from '../verification/crime-check/crime-check.component';
import { PhysicalVerificationComponent } from '../verification/physical-verification/physical-verification.component';
import { ReferenceCheckListComponent } from '../verification/reference-check-list/reference-check-list.component';
import { GlobalDatabaseCheckComponent } from '../verification/global-database-check/global-database-check.component';
import { DualEmploymentCheckComponent } from '../verification/dual-employment-check/dual-employment-check.component';
import { CibilCheckComponent } from '../verification/cibil-check/cibil-check.component';
import { DrugTestComponent } from '../verification/drug-test/drug-test.component';
import { DirectorshipTestComponent } from '../verification/directorship-test/directorship-test.component';
import { SocialMediaCheckComponent } from '../verification/social-media-check/social-media-check.component';
import { GapCheckComponent } from '../verification/gap-check/gap-check.component';
import { ROLES } from '../../helpers';
import { AuthGuard } from '../../core';
import { RcCheckComponent } from '../verification/rc-check/rc-check.component';
import { PassportCheckComponent } from '../verification/passport-check/passport-check.component';
import { PermanentAddressComponent } from '../verification/permanent-address/permanent-address.component';
import { BankStatementComponent } from '../verification/bank-statement/bank-statement.component';
import { VoterIdComponent } from '../verification/voter-id/voter-id.component';
import { OfacCheckComponent } from '../verification/ofac-check/ofac-check.component';

const routes: Routes = [
	{ path: '', redirectTo: 'list', pathMatch: 'full' },
	{
		path: 'list',
		component: StartVerificationListComponent,
		canActivate: [AuthGuard],
		data: {
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/organization-details',
		component: UserOrganizationComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Organization Name',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/aadhar-card',
		component: AadharCardComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Aadhaar Card',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/pan-card',
		component: PanCardComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'PAN Card',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/driving-license',
		component: DrivingLicenseComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Driving License',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
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
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Bank Account',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/voter-id',
		component: VoterIdComponent,
		data: {
			breadcrumb: 'Voter ID Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/self-verification',
		component: SelfComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Self Verification',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/physical-verification',
		component: PhysicalVerificationComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Current Address Physical Verification',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/educational-details',
		component: EducationListComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Educational Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/police-lawyer',
		component: PoliceVerificationLawyerComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Police Verification through Lawyer',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/police-verification',
		component: PoliceVerificationPoliceComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Police Verification through Police',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{ path: ':id/postal-address', component: PostalAddressComponent },
	{
		path: ':id/physical-address',
		component: PhysicalAddressComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Address Details',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/past-employment',
		component: PastEmploymentCheckListComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Past Employment Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/reference-check',
		component: ReferenceCheckListComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Reference Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/court-check',
		component: CrimeCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Court Check',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/global-database-check',
		component: GlobalDatabaseCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Global Database Check',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/dual-employment-check',
		component: DualEmploymentCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Dual Employment Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/cibil-check',
		component: CibilCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'CIBIL Check',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/directorship-test',
		component: DirectorshipTestComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'DIRECTORSHI Test',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/drug-test',
		component: DrugTestComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'DRUG Test',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/social-media-check',
		component: SocialMediaCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Social Media Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/gap-check',
		component: GapCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Gap Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/rc-check',
		component: RcCheckComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'RC Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/passport-check',
		component: PassportCheckComponent,
		data: {
			breadcrumb: 'Passport Check',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
	{
		path: ':id/ofac-check',
		component: OfacCheckComponent,
		data: {
			breadcrumb: 'OFAC Check',
			role: [...ROLES.getWebArray()],
		},
	},
	{
		path: ':id/permanent-address',
		component: PermanentAddressComponent,
		canActivate: [AuthGuard],
		data: {
			breadcrumb: 'Permanent Address Physical Verification',
			role: [...ROLES.getWebArray(), ROLES.EMPLOYEE],
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StartVerificationRoutingModule {}
