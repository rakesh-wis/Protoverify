import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from 'src/app/core/services/address.service';
import { BusinessDetailsService } from 'src/app/core/services/business-details.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { VerificationDetailsService } from 'src/app/core/services/verification-details.service';
import { VerificationMediaService } from 'src/app/core/services/verification-media.service';
import { businessType, industryType, verificationDetailsType } from 'src/app/helpers';

@Component({
	selector: 'app-clients-details',
	templateUrl: './clients-details.component.html',
	styleUrls: ['./clients-details.component.scss'],
})
export class ClientsDetailsComponent implements OnInit {
	businessType = businessType;
	industryType = industryType;

	businessDocuments = [
		{
			label: 'Certificate of Incorporation',
			mediaType: 'certificate_of_incorporation',
		},
		{
			label: 'GST certificate (optional)',
			mediaType: 'gst_certificate',
		},
		{
			label: 'Board resolution',
			mediaType: 'board_resolution',
		},
		{
			label: 'Business PAN',
			mediaType: 'business_pna',
		},
		{
			label: 'Memorandum of Association (MOA)',
			mediaType: 'memorandum_of_association',
		},
		{
			label: 'Article of Association',
			mediaType: 'article_of_association',
		},
	];
	dataForm = new FormGroup({
		verificationType: new FormControl(verificationDetailsType.BUSINESS_DOCUMENTS),
		addresses: new FormArray([]),
		verificationMedia: new FormArray([]),
	});
	addresses!: FormArray;
	verificationMedia = this.dataForm.get('verificationMedia') as FormArray;

	userId: number = null;

	constructor(private activatedRoute: ActivatedRoute) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			if (params.hasOwnProperty('id')) {
				this.userId = params['id'];
			}
		});
	}
}
