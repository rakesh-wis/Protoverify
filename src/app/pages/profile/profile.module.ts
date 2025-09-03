import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChangeMobileComponent } from './change-mobile/change-mobile.component';
import { ChangeEmailComponent } from './change-email/change-email.component';

@NgModule({
	declarations: [ProfileViewComponent, ChangeMobileComponent, ChangeEmailComponent],
	imports: [CommonModule, ProfileRoutingModule, SharedModule],
})
export class ProfileModule {}
