import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpTokenInterceptor } from './interceptors';
import { ApiService, AuthGuard, UploadService, UserService, JwtService } from './services';
import { ReportService } from './services/report.service';
import { SharedService } from './services/shared.service';
import { PreventUnsavedChangesGuard } from '../shared/validators/prevent-unsaved-changes-guard.service';

@NgModule({
	imports: [CommonModule],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
		ApiService,
		AuthGuard,
		JwtService,
		UserService,
		UploadService,
		ReportService,
		SharedService,
		PreventUnsavedChangesGuard,
	],
	declarations: [],
})
export class CoreModule {}
