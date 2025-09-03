import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BankService } from 'src/app/core/services/bank.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { confirmMessages, kycStatus, OPTIONS, ROLES, verificationLevel, planFeatures } from 'src/app/helpers';
import { bankDetailsFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { UserService } from 'src/app/core';
import { ChangeStatusComponent } from '../change-status/change-status.component';

@Component({
	selector: 'app-bank-details',
	templateUrl: './bank-details.component.html',
	styleUrls: ['./bank-details.component.scss'],
})
export class BankDetailsComponent implements OnInit {
	userData: any = {};
	errorMessages = bankDetailsFieldForm;
	dataForm = new FormGroup({
		id: new FormControl(),
		accountName: new FormControl(''),
		accountNumber: new FormControl('', [Validators.required, Validators.pattern(OPTIONS.accountNumberPattern)]),
		ifscCode: new FormControl('', [Validators.required]),
		additionalDetails: new FormControl(),
		userId: new FormControl(),
		status: new FormControl(),
		remark: new FormControl(),
	});
	userId = null;
	bankDetails: any = null;
	kycStatus = kycStatus;
	roles = ROLES;
	currentUser: any;

	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	verificationLevel = verificationLevel;
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	constructor(
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private bankService: BankService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private router: Router,
		private verificationDetailsService: VerificationDetailsService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	get form() {
		return this.dataForm.controls;
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.form['userId'].setValue(this.userId);
			this.getData();
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	getData() {
		const payload = {
			userId: this.userId,
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/bank/${this.userId}` : `/bank`,
		};
		this.bankService.getData(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				if (result.data) {
					this.updateCardValidator(false);
					this.dataForm.patchValue(result.data);
					this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
					this.bankDetails = this.form['additionalDetails'].value;
				}
				if (
					![
						ROLES.PROTO_SUPER_ADMIN,
						ROLES.PROTO_ADMIN,
						ROLES.PROTO_USER,
						ROLES.PROTO_OPERATION,
						ROLES.EMPLOYEE,
					].includes(this.currentUser.role)
				) {
					this.updateCardValidator(false);
					this.dataForm.disable();
				}
				if (result.data) this.disableForm();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	disableForm() {
		if (this.form['id'].value) {
			this.form['accountNumber'].disable();
			this.form['accountName'].disable();
			this.form['ifscCode'].disable();
		}
	}
	updateCardValidator(shouldAdd: boolean) {
		if (shouldAdd) {
			this.form['accountNumber'].setValidators([
				Validators.required,
				Validators.pattern(OPTIONS.accountNumberPattern),
			]);
		} else {
			this.form['accountNumber'].clearValidators();
		}
		this.form['accountNumber'].updateValueAndValidity();
	}
	onSubmit(): void {
		this.form['remark'].clearValidators();
		this.form['remark'].updateValueAndValidity();
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		this.searchIFSC();
	}

	verifyBank() {
		let params = { ifscCode: this.form['ifscCode'].value, accountNumber: this.form['accountNumber'].value };
		this.bankService.verifyBank(params).subscribe({
			next: (result) => {
				this.form['accountName'].setValue(result.beneficiaryName);
				if (this.form['id'].value === null) this.create();
				else this.update();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	create(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/bank` : `/bank`;
		this.bankService.create(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.updateCardValidator(false);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.disableForm();
				this.verificationDetailsService.showCompleteModal('bank-details', 'pending', 1);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	update(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role)
			? `/admin/bank/${this.form['id'].value}`
			: `/bank/${this.form['id'].value}`;
		this.bankService.update(this.dataForm.getRawValue(), url).subscribe({
			next: (result) => {
				this.updateCardValidator(false);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.dataForm.patchValue(result.data);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.disableForm();
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	openConfirmDelete() {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.deleteTitle}?`;
		modalRef.componentInstance.description = `${confirmMessages.deleteDescription} this ? This will erase all the saved changes.`;
		modalRef.componentInstance.okText = 'Delete';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.componentInstance.iconName = 'ant-design:delete-outlined';
		modalRef.componentInstance.customClass = 'fs-1 text-danger';
		modalRef.result.then(
			(result) => {
				this.delete();
			},
			(dismiss) => {}
		);
	}
	delete(): void {
		const url = `/bank/${this.form['id'].value}`;
		this.bankService.delete(url).subscribe({
			next: (result) => {
				this.dataForm.enable();
				this.dataForm.reset();
				this.updateCardValidator(true);
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.verificationDetailsService.updateCheckList('bank-details', null);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	searchIFSC() {
		if (this.form['ifscCode'].value.length <= 0) {
			this.toastService.error('Enter IFSC code');
			return;
		}
		let params = { code: this.form['ifscCode'].value };
		this.bankService.searchIFSC(params).subscribe({
			next: (result) => {
				this.bankDetails = result.data;
				this.form['additionalDetails'].setValue(this.bankDetails);
				this.verifyBank();
			},
			error: (error) => {
				this.toastService.error(error);
			},
		});
	}
	openConfirmStatus(status) {
		if ([verificationLevel.CLEAR_REPORT, verificationLevel.MAJOR_DISCREPANCY].includes(status)) {
			const modalRef = this.modalService.open(AlertModalComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
			modalRef.componentInstance.description = `${
				confirmMessages.hideDescription
			} save status as ${verificationLevel.CLEAR_REPORT.replace(/_/g, ' ')} ? \n`;
			modalRef.componentInstance.okText = 'Yes';
			modalRef.componentInstance.cancelText = 'Cancel';
			modalRef.result.then(
				(result) => {
					let payload = {
						status,
						id: this.form['id'].value,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		} else {
			const modalRef = this.modalService.open(ChangeStatusComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.modelData = this.dataForm.getRawValue();
			modalRef.result.then(
				(result) => {
					let payload = {
						status: result.status,
						id: this.form['id'].value,
						remark: this.form['remark'].value,
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		}
	}
	patch(payload) {
		this.bankService.patch(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(result.data.status);
				this.form['additionalDetails'].setValue(JSON.parse(result.data.additionalDetails));
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('bank-details', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	goBack() {
		this.location.back();
	}
	goNext() {
		let path = this.router.url.includes('start') ? 'start' : 'direct';
		this.verificationDetailsService.navigateToNext(path, 'bank-details', this.userData);
	}
	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.BANK_ACCOUNT)
		);
	}
}
