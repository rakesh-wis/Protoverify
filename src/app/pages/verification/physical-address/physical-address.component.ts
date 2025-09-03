import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService, UserService } from 'src/app/core';
import { AddressService } from 'src/app/core/services/address.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import {
	kycStatus,
	employeeAddressType,
	OPTIONS,
	SERVICES,
	confirmMessages,
	verificationLevel,
	ROLES,
	accommodationType,
	addressTypeList,
	ownershipType,
	planFeatures,
} from 'src/app/helpers';
import { addressFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';
import { ChangeStatusComponent } from '../change-status/change-status.component';

@Component({
	selector: 'app-physical-address',
	templateUrl: './physical-address.component.html',
	styleUrls: ['./physical-address.component.scss'],
})
export class PhysicalAddressComponent implements OnInit {
	userData: any = {};
	errorMessages = addressFieldForm;
	dataForm = new FormGroup({
		addresses: new FormArray([]),
	});
	addresses!: FormArray;
	userId = null;
	kycStatus = kycStatus;
	roles = ROLES;
	currentUser: any;
	verifiedIcon = 'assets/icons/verified.svg';
	unVerifiedIcon = 'assets/icons/rejected.svg';
	verificationLevel = verificationLevel;
	// tempOtp: number;
	accommodationType = Object.values(accommodationType);
	addressType = Object.values(addressTypeList);
	ownershipType = Object.values(ownershipType);
	months = Array.from(Array(12).keys());
	assignedVerificationChecks: any = [];
	planFeatures = planFeatures;
	isFormDisabled: boolean = false;
	constructor(
		private formBuilder: FormBuilder,
		nodalConfig: NgbModalConfig,
		private modalService: NgbModal,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private addressService: AddressService,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private sharedService: SharedService,
		private uploadService: UploadService,
		private verificationDetailsService: VerificationDetailsService,
		private userService: UserService
	) {
		nodalConfig.backdrop = 'static';
		nodalConfig.keyboard = false;
		this.userService.verificationChecks$.subscribe((checks) => {
			this.assignedVerificationChecks = checks;
		});
	}

	ngOnInit(): void {
		this.currentUser = this.userService.getCurrentUser();
		this.activatedRoute.params.subscribe((params) => {
			this.userId = params['id'];
			this.userData = this.activatedRoute.snapshot.queryParams;
			this.addItems();
			this.getData();
		});
		if (this.areInputsDisabled()) {
			this.dataForm.disable();
			this.isFormDisabled = true;
		}
	}
	createItem(item: any): FormGroup {
		return this.formBuilder.group({
			id: new FormControl(null),
			type: new FormControl(item),
			addressLine1: new FormControl('', [Validators.required]),
			addressLine2: new FormControl(''),
			city: new FormControl('', [Validators.required]),
			state: new FormControl('', [Validators.required]),
			pincode: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]{1}[0-9]{2}[0-9]{3}$/)]),
			countryName: new FormControl('India', [Validators.required]),
			countryCode: new FormControl('IN'),
			status: new FormControl(verificationLevel.CLEAR_REPORT),
			isSameAsRegistered: new FormControl(false),
			verificationImage: new FormControl(),
			userId: new FormControl(this.userId),
			// tempOtp: new FormControl(),
			periodOfStay: new FormGroup({
				years: new FormControl(
					'',
					employeeAddressType.PHYSICAL_CURRENT_ADDRESS === item
						? [Validators.required, Validators.min(0), Validators.max(100)]
						: []
				),
				months: new FormControl(
					'',
					employeeAddressType.PHYSICAL_CURRENT_ADDRESS === item ? [Validators.required] : []
				),
			}),
			accommodationType: new FormControl(
				'',
				employeeAddressType.PHYSICAL_CURRENT_ADDRESS === item ? [Validators.required] : []
			),
			addressType: new FormControl(
				'',
				employeeAddressType.PHYSICAL_CURRENT_ADDRESS === item ? [Validators.required] : []
			),
			ownershipType: new FormControl(
				'',
				employeeAddressType.PHYSICAL_CURRENT_ADDRESS === item ? [Validators.required] : []
			),
		});
	}

	addItems(): void {
		this.addresses = this.dataForm.get('addresses') as FormArray;
		Object.values([
			employeeAddressType.PHYSICAL_PERMANENT_ADDRESS,
			employeeAddressType.PHYSICAL_CURRENT_ADDRESS,
		]).forEach((element) => {
			this.addresses.push(this.createItem(element));
		});
	}

	get form() {
		return this.dataForm.controls;
	}

	get checkAllStatusApproved(): boolean {
		return this.addresses.controls.every((e) => e.value['status'] === kycStatus.APPROVED);
	}
	get periodOfStayForm() {
		return this.dataForm.controls['addresses']['controls'][1]['controls']['periodOfStay']['controls'];
	}
	showFileName(value: string) {
		return value ? value.split('uploads/')[1] : '';
	}
	uploadFile(event, index) {
		let fileList: FileList = event.target.files;
		let file: File = fileList[0];
		if (this.uploadService.checkDocumentType(file) && this.uploadService.checkImageType(file)) {
			this.toastService.error(OPTIONS.documentFileType);
			return;
		}
		if (this.uploadService.checkFileSize(file)) {
			this.toastService.error(OPTIONS.sizeLimit);
			return;
		}
		let formData = new FormData();
		formData.append('file', file);
		const url = `/shared/upload`;
		this.uploadService.uploadFile(url, formData, SERVICES.USER).subscribe({
			next: (value) => {
				this.addresses.controls[index].get('verificationImage').setValue(value.cdn);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	clearFile() {
		this.addresses.controls[0].get('verificationImage').setValue('');
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	getData() {
		let params = {
			url: ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/address` : `/address`,
		};
		if (this.userId) {
			params['userId'] = this.userId;
		}
		this.addressService.getData(params).subscribe({
			next: (data) => {
				if (data.data.count != 0) {
					this.addresses.controls[0].patchValue(
						![ROLES.EMPLOYEE].includes(this.currentUser.role)
							? data.data['rows'].find(
									(element) => element.type === employeeAddressType.PHYSICAL_PERMANENT_ADDRESS
							  )
							: data.data.find(
									(element) => element.type === employeeAddressType.PHYSICAL_PERMANENT_ADDRESS
							  )
					);
					if (this.addresses.controls[0].get('id').value) {
						this.addresses.controls[0].disable();
					}

					if (![ROLES.EMPLOYEE].includes(this.currentUser.role)) {
						if (
							data.data['rows'].find(
								(element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS
							)
						) {
							this.addresses.controls[1].patchValue(
								data.data['rows'].find(
									(element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS
								)
							);
							if (this.addresses.controls[1].get('isSameAsRegistered').value) {
								this.addresses.controls[1].disable();
								this.addresses.controls[1].get('isSameAsRegistered').enable();
								this.addresses.controls[1].get('periodOfStay').enable();
								this.addresses.controls[1].get('accommodationType').enable();
								this.addresses.controls[1].get('addressType').enable();
								this.addresses.controls[1].get('ownershipType').enable();
							}
						}
					} else if ([ROLES.EMPLOYEE].includes(this.currentUser.role)) {
						const physicalCurrentAddress = data.data.find(
							(element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS
						);
						// console.log('physicalCurrentAddress', physicalCurrentAddress);
						if (physicalCurrentAddress) {
							this.addresses.controls[1].patchValue(physicalCurrentAddress);
							if (this.addresses.controls[1].get('isSameAsRegistered').value) {
								this.addresses.controls[1].disable();
								this.addresses.controls[1].get('isSameAsRegistered').enable();
							}
							// if (this.addresses.controls[1].get('tempOtp').value) {
							// 	this.addresses.controls[1].get('isSameAsRegistered').disable();
							// }
						}
					}
					if (
						![
							ROLES.PROTO_SUPER_ADMIN,
							ROLES.PROTO_ADMIN,
							ROLES.PROTO_USER,
							ROLES.EMPLOYEE,
							ROLES.PROTO_OPERATION,
						].includes(this.currentUser.role)
					) {
						this.dataForm.disable();
					}
					// console.log(this.addresses.controls);
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}
	searchPincode(index) {
		this.spinnerService.start();
		if (this.addresses.controls[index].get('pincode').value.toString().length < 6) {
			return;
		}
		this.sharedService.searchPincode(this.addresses.controls[index].get('pincode').value).subscribe(
			(result) => {
				if (result.PostOffice) {
					this.addresses.controls[index].get('city').setValue(result.PostOffice[0].District);
					this.addresses.controls[index].get('state').setValue(result.PostOffice[0].State);
				} else if (result.Status === 'Error') {
					this.toastService.error('Invalid pincode');
				}
				this.spinnerService.stop();
			},
			(error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			}
		);
	}
	onSubmit(): void {
		if (this.dataForm.invalid) {
			validateField(this.dataForm);
			return;
		}
		this.spinnerService.start();
		if (this.addresses.controls[0].value.id === null) this.create();
		else this.update();
	}

	update(): void {
		let url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/address` : `/address`;
		if (![ROLES.EMPLOYEE].includes(this.currentUser.role)) {
			this.addressService.update({ addresses: this.addresses.getRawValue() }, url).subscribe({
				next: (data) => {
					this.addresses.controls[0].patchValue(
						data.data.find((element) => element.type === employeeAddressType.PHYSICAL_PERMANENT_ADDRESS)
					);
					if (data.data.length > 1) {
						this.addresses.controls[1].patchValue(
							data.data.find((element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS)
						);
						if (this.addresses.controls[1].get('isSameAsRegistered').value) {
							this.addresses.controls[1].disable();
							this.addresses.controls[1].get('isSameAsRegistered').enable();
						}
					}
					this.toastService.success(data.message);
					this.spinnerService.stop();
				},
				error: (error) => {
					this.toastService.error(error);
					this.spinnerService.stop();
				},
			});
		} else {
			this.addresses.getRawValue().forEach((element, index) => {
				if (element.id) {
					this.addressService.update(element, `${url}/${element.id}`).subscribe({
						next: (data) => {
							if (index > 1) {
								this.addresses.controls[1].patchValue(
									data.data.find(
										(element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS
									)
								);
								if (this.addresses.controls[1].get('isSameAsRegistered').value) {
									this.addresses.controls[1].disable();
									this.addresses.controls[1].get('isSameAsRegistered').enable();
								}
							}
							this.toastService.success(data.message);
							this.spinnerService.stop();
						},
						error: (error) => {
							this.toastService.error(error);
							this.spinnerService.stop();
						},
					});
				} else {
					this.addressService.create({ addresses: this.addresses.getRawValue() }, url).subscribe({
						next: (data) => {
							if (index > 1) {
								this.addresses.controls[index].patchValue(
									data.data.find(
										(element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS
									)
								);
								if (this.addresses.controls[1].get('isSameAsRegistered').value) {
									this.addresses.controls[1].disable();
									this.addresses.controls[1].get('isSameAsRegistered').enable();
								}
							}
							this.toastService.success(data.message);
							this.spinnerService.stop();
						},
						error: (error) => {
							this.toastService.error(error);
							this.spinnerService.stop();
						},
					});
				}
			});
		}
	}

	create(): void {
		const url = ![ROLES.EMPLOYEE].includes(this.currentUser.role) ? `/admin/address` : `/address`;
		this.addressService.create({ addresses: this.addresses.getRawValue() }, url).subscribe({
			next: (data) => {
				this.addresses.controls[0].patchValue(
					data.data.find((element) => element.type === employeeAddressType.PHYSICAL_PERMANENT_ADDRESS)
				);
				if (data.data.length > 1) {
					this.addresses.controls[1].patchValue(
						data.data.find((element) => element.type === employeeAddressType.PHYSICAL_CURRENT_ADDRESS)
					);
					if (this.addresses.controls[1].get('isSameAsRegistered').value) {
						this.addresses.controls[1].disable();
						this.addresses.controls[1].get('isSameAsRegistered').enable();
					}
				}
				this.toastService.success(data.message);
				this.spinnerService.stop();
				this.verificationDetailsService.showCompleteModal('physical-address', 'pending', 1);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	generateOtp(index) {
		this.addressService.generateOtp(this.addresses.controls[index].get('id').value).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				// this.addresses.controls[index].get('tempOtp').setValue(result.data.tempOtp);
				// console.log(this.addresses.controls[index]);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
	patchOptionalAddress($event) {
		if ($event.target.checked) {
			this.addresses.controls[1]
				.get('addressLine1')
				.setValue(this.addresses.controls[0].get('addressLine1').value);
			this.addresses.controls[1]
				.get('addressLine2')
				.setValue(this.addresses.controls[0].get('addressLine2').value);
			this.addresses.controls[1].get('city').setValue(this.addresses.controls[0].get('city').value);
			this.addresses.controls[1].get('state').setValue(this.addresses.controls[0].get('state').value);
			this.addresses.controls[1].get('countryName').setValue(this.addresses.controls[0].get('countryName').value);
			this.addresses.controls[1].get('countryCode').setValue(this.addresses.controls[0].get('countryCode').value);
			this.addresses.controls[1].get('pincode').setValue(this.addresses.controls[0].get('pincode').value);
			this.addresses.controls[1].get('isSameAsRegistered').setValue(true);
			this.addresses.controls[1].disable();
			this.addresses.controls[1].get('isSameAsRegistered').enable();
			this.addresses.controls[1].get('id').enable();
			this.addresses.controls[1].get('status').enable();
			// this.addresses.controls[1].get('tempOtp').enable();

			this.addresses.controls[1].get('periodOfStay').enable();
			this.addresses.controls[1].get('accommodationType').enable();
			this.addresses.controls[1].get('addressType').enable();
			this.addresses.controls[1].get('ownershipType').enable();
		} else {
			this.addresses.controls[1].get('addressLine1').setValue(null);
			this.addresses.controls[1].get('addressLine2').setValue(null);
			this.addresses.controls[1].get('city').setValue(null);
			this.addresses.controls[1].get('state').setValue(null);
			this.addresses.controls[1].get('countryName').setValue(this.addresses.controls[0].get('countryName').value);
			this.addresses.controls[1].get('countryCode').setValue(this.addresses.controls[0].get('countryCode').value);
			this.addresses.controls[1].get('pincode').setValue(null);
			this.addresses.controls[1].enable();
		}
	}
	openConfirmStatus(status) {
		if (status === kycStatus.REJECTED) {
			const modalRef = this.modalService.open(AlertModalComponent, {
				centered: true,
				size: 'md',
				backdrop: 'static',
			});
			modalRef.componentInstance.title = `${confirmMessages.hideTitle}?`;
			modalRef.componentInstance.description = `${confirmMessages.hideDescription}${
				status === kycStatus.APPROVED ? 'approve' : 'reject'
			} ? \n`;
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
					};
					this.patch(payload);
				},
				(dismiss) => {}
			);
		}
	}
	patch(payload) {
		this.addressService.patchStatus(payload).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.form['status'].setValue(result.data.status);
				this.toastService.success(result.message);
				if (verificationLevel.CLEAR_REPORT === this.form['status'].value) {
					this.dataForm.disable();
				}
				this.verificationDetailsService.updateCheckList('physical-address', this.form['status'].value);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}

	verifyOtp() {
		if (!this.addresses.controls[1].value.verificationImage) {
			return this.toastService.error('Please upload post card image');
		}
		// else if (!this.tempOtp) {
		// 	return this.toastService.error('Please enter otp');
		// }
		this.addressService
			.verifyOtp({
				id: this.addresses.controls[1].value.id,
				// tempOtp: this.tempOtp,
				verificationImage: this.addresses.controls[1].value.verificationImage,
			})
			.subscribe({
				next: (result) => {
					this.spinnerService.stop();
					this.addresses.controls.forEach((e) => e.get('status').setValue(verificationLevel.CLEAR_REPORT));
					this.toastService.success(result.message);
					this.dataForm.disable();
					this.verificationDetailsService.updateCheckList('physical-address', this.form['status'].value);
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
		this.verificationDetailsService.navigateToNext(path, 'physical-address', this.userData);
	}
	downloadDocument(url: string) {
		window.open(url, '_blank');
	}

	areInputsDisabled(): boolean {
		return (
			[this.roles.PROTO_OPERATION].includes(this.currentUser?.role) &&
			!this.assignedVerificationChecks.includes(this.planFeatures.PHYSICAL_ADDRESS)
		);
	}
}
