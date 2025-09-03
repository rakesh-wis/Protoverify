import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddressService } from 'src/app/core/services/address.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { addressType, confirmMessages, verificationDetailsType } from 'src/app/helpers';
import { addressFieldForm } from 'src/app/helpers/form-error.helper';
import { AlertModalComponent } from 'src/app/shared/components/modals/alert-modal';
import { validateField } from 'src/app/shared/validators/form.validator';

@Component({
	selector: 'app-business-address',
	templateUrl: './business-address.component.html',
	styleUrls: ['./business-address.component.scss'],
})
export class BusinessAddressComponent implements OnInit {
	states = [];
	dataForm = new FormGroup({
		addresses: new FormArray([]),
	});
	addresses!: FormArray;
	errorMessages = addressFieldForm;
	@Output() changeAccordion = new EventEmitter<number>();
	@Input() userId: number = null;
	@Input() canEdit: boolean = true;
	@Input() canVerify: boolean = false;
	@Input() showCancel: boolean = true;
	constructor(
		private formBuilder: FormBuilder,
		private spinnerService: SpinnerService,
		private toastService: ToastService,
		private sharedService: SharedService,
		private addressService: AddressService,
		private modalService: NgbModal
	) {}

	ngOnInit(): void {
		this.addItems();
		this.getAddress();
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
			status: new FormControl(''),
			isSameAsRegistered: new FormControl(false),
		});
	}

	addItems(): void {
		this.addresses = this.dataForm.get('addresses') as FormArray;
		Object.values(addressType).forEach((element) => {
			this.addresses.push(this.createItem(element));
		});
	}
	numberOnly(event: any): boolean {
		const charCode = event.which ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}

	searchPincode(index) {
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

	getAddress(): void {
		let params = {
			url: `/admin/address`,
		};
		if (this.userId) {
			params['userId'] = this.userId;
		}
		this.addressService.getData(params).subscribe({
			next: (data) => {
				if (data.data.count != 0) {
					this.addresses.controls[0].patchValue(
						data.data['rows'].find((element) => element.type === addressType.REGISTERED_ADDRESS)
					);
					if (data.data.count > 1)
						this.addresses.controls[1].patchValue(
							data.data['rows'].find((element) => element.type === addressType.OPERATION_ADDRESS)
						);
				}
				if (!this.canEdit) {
					this.dataForm.disable();
				}
				this.spinnerService.stop();
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	update(): void {
		const url = `/admin/address`;
		this.addressService.update({ addresses: this.addresses.getRawValue() }, url).subscribe({
			next: (data) => {
				this.addresses.controls[0].patchValue(
					data.data.find((element) => element.type === addressType.REGISTERED_ADDRESS)
				);
				if (data.data.length > 1)
					this.addresses.controls[1].patchValue(
						data.data.find((element) => element.type === addressType.OPERATION_ADDRESS)
					);
				this.toastService.success(data.message);
				this.spinnerService.stop();
				this.changeAccordion.emit(3);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
			},
		});
	}

	create(): void {
		const url = `/admin/address`;
		this.addressService.create({ addresses: this.addresses.getRawValue() }, url).subscribe({
			next: (data) => {
				this.addresses.controls[0].patchValue(
					data.data.find((element) => element.type === addressType.REGISTERED_ADDRESS)
				);
				if (data.data.length > 1)
					this.addresses.controls[1].patchValue(
						data.data.find((element) => element.type === addressType.OPERATION_ADDRESS)
					);
				this.toastService.success(data.message);
				this.spinnerService.stop();
				this.changeAccordion.emit(3);
			},
			error: (error) => {
				this.toastService.error(error);
				this.spinnerService.stop();
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
		} else {
			this.addresses.controls[1].get('addressLine1').setValue(null);
			this.addresses.controls[1].get('addressLine2').setValue(null);
			this.addresses.controls[1].get('city').setValue(null);
			this.addresses.controls[1].get('state').setValue(null);
			this.addresses.controls[1].get('countryName').setValue(this.addresses.controls[0].get('countryName').value);
			this.addresses.controls[1].get('countryCode').setValue(this.addresses.controls[0].get('countryCode').value);
			this.addresses.controls[1].get('pincode').setValue(null);
		}
	}

	openConfirmStatus(item, index) {
		const modalRef = this.modalService.open(AlertModalComponent, {
			centered: true,
			size: 'md',
			backdrop: 'static',
		});
		modalRef.componentInstance.title = `${confirmMessages.requestTitle('Verification')}?`;
		modalRef.componentInstance.description = `${confirmMessages.hideDescription} verify ? \n`;
		modalRef.componentInstance.okText = 'Yes';
		modalRef.componentInstance.cancelText = 'Cancel';
		modalRef.result.then(
			(result) => {
				this.changeStatus(item, index);
			},
			(dismiss) => {}
		);
	}

	changeStatus(item: any, index: number) {
		this.spinnerService.start();
		this.addressService.patchStatus(item).subscribe({
			next: (result) => {
				this.spinnerService.stop();
				this.toastService.success(result.message);
				this.addresses.controls[index].patchValue(result.data);
			},
			error: (error) => {
				this.spinnerService.stop();
				this.toastService.error(error);
			},
		});
	}
}
