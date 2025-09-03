import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from './material.module';
import { IMaskModule } from 'angular-imask';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { WebcamModule } from 'ngx-webcam';

import { CapitalizePipe, TruncatePipe } from '../pipes';
import { VerificationAutoTabDirective } from '../directives/auto-focus.directive';
import { DragDropDirective } from '../directives/drag-drop.directive';
import { InputIntegerDirective } from '../directives/inputInteger.directive';
import { NgbdSortableHeader } from '../directives/sortable.directive';

import { LoadingComponent } from './components/common/loading/loading.component';
import { ToastComponent } from './components/common/toast/toast.component';
import { MobileNumberComponent } from './components/common/mobile-number/mobile-number.component';
import { PreventUnsavedMessageDialogComponent } from './components/modals/prevent-unsaved-message-dialog/prevent-unsaved-message-dialog.component';
import { AlertModalComponent } from './components/modals/alert-modal';
import { SafePipe } from '../pipes/safehtml.pipe';

import {
	MatSnackBarHorizontalPosition,
	MatSnackBarVerticalPosition,
	MAT_SNACK_BAR_DATA,
	MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';
import { DateAgoPipe } from '../pipes/date-ago.pipe';
import { BreadcrumbComponent } from './components/common/breadcrumb/breadcrumb.component';
import { ChecklistComponent } from './components/common/checklist/checklist.component';
import { YearMonthPickerComponent } from './components/common/year-month-picker/year-month-picker.component';
import { AadharCardDirective } from '../directives/aadharcard.directive';
import { TextEditorComponent } from './components/common/text-editor/text-editor.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CustomCircularProgressModule } from './components/common/custom-circular-progress/custom-circular-progress.module';
import { CustomProgressComponent } from './components/common/custom-progress/custom-progress.component';
import { IsGrantedDirective } from '../directives/is-granted.directive';
import { DebounceClickDirective } from '../directives/debounceClick.directive';
import { FileViewerComponent } from './components/common/file-viewer/file-viewer.component';
import { WebcamComponent } from './components/common/webcam/webcam.component';
import { DatePickerComponent } from './components/common/date-picker/date-picker.component';
import { EnterAttachTitleDirective } from '../directives/enter-attach-title.directive';
import { PaginationComponent } from './components/common/pagination/pagination.component';
import { SignaturePadComponent } from './components/common/signature-pad/signature-pad.component';
// import { VerificationStatusPopoverComponent } from '../pages/verification/verification-status-popover/verification-status-popover.component';
import { VerificationModule } from '../pages/verification/verification.module';

const horizontalPosition: MatSnackBarHorizontalPosition = 'center';
const verticalPosition: MatSnackBarVerticalPosition = 'top';

const DIRECTIVES = [
	DragDropDirective,
	InputIntegerDirective,
	VerificationAutoTabDirective,
	NgbdSortableHeader,
	AadharCardDirective,
	IsGrantedDirective,
	DebounceClickDirective,
	EnterAttachTitleDirective,
];

const PIPES = [TruncatePipe, CapitalizePipe, SafePipe, DateAgoPipe];

const COMPONENTS = [
	ToastComponent,
	AlertModalComponent,
	LoadingComponent,
	MobileNumberComponent,
	BreadcrumbComponent,
	ChecklistComponent,
	YearMonthPickerComponent,
	TextEditorComponent,
	FileViewerComponent,
	CustomProgressComponent,
	WebcamComponent,
	PreventUnsavedMessageDialogComponent,
	DatePickerComponent,
	PaginationComponent,
	SignaturePadComponent,
];

const MODULE = [
	CommonModule,
	NgbAccordionModule,
	NgbModule,
	NgSelectModule,
	MaterialModule,
	CKEditorModule,
	FormsModule,
	ReactiveFormsModule,
	CustomCircularProgressModule,
	GalleryModule,
	LightboxModule,
	WebcamModule,
	IMaskModule,
];

@NgModule({
  imports: [
    ...MODULE,               // only real NgModules here
    VerificationModule,   // include this if the popover stays there
  ],
  declarations: [
    ...PIPES,
    ...DIRECTIVES,
    ...COMPONENTS,
    // VerificationStatusPopoverComponent, // only if NOT declared in VerificationModule
  ],
  exports: [
    ...PIPES,
    ...DIRECTIVES,
    ...COMPONENTS,
    ...MODULE,
    VerificationModule,   // if you imported it above
    // VerificationStatusPopoverComponent, // only if declared here
  ],
})
export class SharedModule {}
