import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBillingComponent } from './admin-billing.component';

const routes: Routes = [{ path: '', component: AdminBillingComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdminBillingRoutingModule {}
