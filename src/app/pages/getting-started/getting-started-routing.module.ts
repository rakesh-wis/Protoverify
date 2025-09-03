import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientBuyPlanComponent } from './client-buy-plan/client-buy-plan.component';
import { ExplorePlansComponent } from './explore-plans/explore-plans.component';
import { GettingStartedComponent } from './getting-started.component';
import { SetUpAccountComponent } from './set-up-account/set-up-account.component';
import { WelcomeOnboardComponent } from './welcome-onboard/welcome-onboard.component';
import { BusinessKycComponent } from './business-kyc/business-kyc.component';
import { FavouritePlanListComponent } from './favourite-plan-list/favourite-plan-list.component';

const routes: Routes = [
	{
		path: '',
		component: GettingStartedComponent,
		children: [
			{ path: '', redirectTo: 'on-board', pathMatch: 'full' },
			{
				path: 'on-board',
				component: WelcomeOnboardComponent,
				data: {
					breadcrumb: 'Welcome Onboard',
				},
			},
			{
				path: 'account-setup',
				component: SetUpAccountComponent,
				data: {
					breadcrumb: 'Set up your Account',
				},
			},
			{
				path: 'business-kyc',
				component: BusinessKycComponent,
				data: {
					breadcrumb: 'Business KYC',
				},
			},
			{
				path: 'favourite-plans',
				component: FavouritePlanListComponent,
				data: {
					breadcrumb: 'Favourite Plans',
				},
			},
			// {
			// 	path: 'explore-plans',
			// 	component: ExplorePlansComponent,
			// 	data: {
			// 		breadcrumb: 'Explore',
			// 	},
			// },
			// {
			// 	path: ':id/buy-plan',
			// 	component: ClientBuyPlanComponent,
			// 	data: {
			// 		breadcrumb: 'Explore',
			// 	},
			// },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class GettingStartedRoutingModule {}
