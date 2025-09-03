import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { planFeatures, verificationList } from 'src/app/helpers';

@Component({
	selector: 'app-verification-status-popover',
	standalone: true,
	imports: [CommonModule, NgbModule],
	templateUrl: './verification-status-popover.component.html',
	styleUrl: './verification-status-popover.component.scss',
})
export class VerificationStatusPopoverComponent {
	@Input() verificationCheck: any;
	planFeatures = planFeatures;

	getVerificationCheck(check) {
		const arr: any = Array.from({ length: check?.maxUploadNumber }, (_, i) => ({
			id: i + 1,
			status: 'Candidate Open',
		}));
		for (let i = 0; i < arr.length; i++) {
			const v = verificationList.find((e) => e.value === check.value);
			let status = check.values.length > 0 && check.values[i] ? check.values[i].status : null;
			let updatedAt = check.values.length > 0 && check.values[i] ? check.values[i].updatedAt : null;
			let badgeClass = 'badge rounded-pill border ';
			switch (status) {
				case 'pending':
					status = 'Ops Open';
					badgeClass += 'badge-primary border-primary';
					break;
				case null:
				case undefined: // handle undefined cases as well
					status = 'Candidate Open';
					badgeClass += 'badge-primary border-primary';
					break;
				default:
					status = 'Completed';
					badgeClass += 'badge-success border-success';
					break;
			}
			arr[i] = {
				...arr[i],
				title: [planFeatures.EDUCATIONAL, planFeatures.PAST_EMPLOYMENT, planFeatures.REFERENCE_CHECK].includes(
					check.value
				)
					? `${v?.title}-${i + 1}`
					: `${v?.title}`,
				status,
				badgeClass,
				updatedAt,
			};
		}
		// console.log('arr', arr)
		return arr;
	}
}
