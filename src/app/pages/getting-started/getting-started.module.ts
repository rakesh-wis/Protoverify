import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GettingStartedRoutingModule } from './getting-started-routing.module';
import { WelcomeOnboardComponent } from './welcome-onboard/welcome-onboard.component';
import { SetUpAccountComponent } from './set-up-account/set-up-account.component';
import { ExplorePlansComponent } from './explore-plans/explore-plans.component';
import { GettingStartedComponent } from './getting-started.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BusinessKycComponent } from './business-kyc/business-kyc.component';
import { BusinessDetailsComponent } from './business-details/business-details.component';
import { BusinessDocumentsComponent } from './business-documents/business-documents.component';
import { BusinessAddressComponent } from './business-address/business-address.component';
import { ClientRequestPlanListComponent } from './client-request-plan-list/client-request-plan-list.component';
import { ClientRequestPlanDetailsComponent } from './client-request-plan-details/client-request-plan-details.component';
import { PlanFeaturesComponent } from './plan-features/plan-features.component';
import { ClientBuyPlanComponent } from './client-buy-plan/client-buy-plan.component';
import { RazorPayPaymentModule } from '../razorPay-ppayment/razorPay-payment.module';
import { ExplorePlansViewComponent } from './explore-plans-view/explore-plans-view.component';
import { FavouritePlanListComponent } from './favourite-plan-list/favourite-plan-list.component';
import { FavouritePlanDetailsComponent } from './favourite-plan-details/favourite-plan-details.component';
import { FavouritePlanViewComponent } from './favourite-plan-view/favourite-plan-view.component';

@NgModule({
	declarations: [
		WelcomeOnboardComponent,
		SetUpAccountComponent,
		ExplorePlansComponent,
		GettingStartedComponent,
		BusinessKycComponent,
		BusinessDetailsComponent,
		BusinessDocumentsComponent,
		BusinessAddressComponent,
		ClientRequestPlanListComponent,
		ClientRequestPlanDetailsComponent,
		PlanFeaturesComponent,
		ClientBuyPlanComponent,
		ExplorePlansViewComponent,
		FavouritePlanListComponent,
		FavouritePlanDetailsComponent,
		FavouritePlanViewComponent,
	],
	imports: [CommonModule, GettingStartedRoutingModule, SharedModule, RazorPayPaymentModule],
	exports: [BusinessKycComponent, BusinessDetailsComponent, BusinessDocumentsComponent, BusinessAddressComponent],
})
export class GettingStartedModule {}
