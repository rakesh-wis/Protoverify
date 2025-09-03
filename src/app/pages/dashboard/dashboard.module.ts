import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { DashboardStatsComponent } from './dashboard-stats/dashboard-stats.component';
import { GraphModule } from '../graph/graph.module';
import { DashboardClientCreditListComponent } from './dashboard-client-credit-list/dashboard-client-credit-list.component';
import { DashboardContentComponent } from './dashboard-content/dashboard-content.component';
import { DashboardClientVerificationListComponent } from './dashboard-client-verification-list/dashboard-client-verification-list.component';
import { DashboardApplicantStatusComponent } from './dashboard-applicant-status/dashboard-applicant-status.component';
import { DashboardRecentApplicationComponent } from './dashboard-recent-application/dashboard-recent-application.component';
import { DashboardTrackAnalyticsComponent } from './dashboard-track-analytics/dashboard-track-analytics.component';
import { DashboardApplicantRecordComponent } from './dashboard-applicant-record/dashboard-applicant-record.component';
import { DashboardRecentActivityComponent } from './dashboard-recent-activity/dashboard-recent-activity.component';
import { DashboardVerificationStatusComponent } from './dashboard-verification-status/dashboard-verification-status.component';
import { DashboardNegativeListComponent } from './dashboard-negative-list/dashboard-negative-list.component';
import { DashboardOperationVerificationListComponent } from './dashboard-operation-verification-list/dashboard-operation-verification-list.component';
import { DashboardOperationVerificationDetailsComponent } from './dashboard-operation-verification-details/dashboard-operation-verification-details.component';
import { VerificationTicketsByChecksComponent } from './dashboard-operation-verification-list/verification-tickets-by-checks/verification-tickets-by-checks.component';
import { AllVerificationsComponent } from './dashboard-operation-verification-list/all-verifications/all-verifications.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DashboardOperationVerificationDetailsViewComponent } from './dashboard-operation-verification-details-view/dashboard-operation-verification-details-view.component';

@NgModule({
	declarations: [
		DashboardComponent,
		DashboardStatsComponent,
		DashboardClientCreditListComponent,
		DashboardContentComponent,
		DashboardClientVerificationListComponent,
		DashboardApplicantStatusComponent,
		DashboardRecentApplicationComponent,
		DashboardTrackAnalyticsComponent,
		DashboardApplicantRecordComponent,
		DashboardRecentActivityComponent,
		DashboardVerificationStatusComponent,
		DashboardNegativeListComponent,
		DashboardOperationVerificationListComponent,
		DashboardOperationVerificationDetailsComponent,
		VerificationTicketsByChecksComponent,
		AllVerificationsComponent,
		DashboardOperationVerificationDetailsViewComponent,
	],
	imports: [CommonModule, DashboardRoutingModule, SharedModule, GraphModule, InfiniteScrollModule],
})
export class DashboardModule {}
