export const OPTIONS = {
	emailPattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$',
	websitePattern: `^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$`,
	websiteWithOutHttpPattern: `^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$`,
	panCardPattern: `[A-Z]{5}[0-9]{4}[A-Z]{1}`,
	uanCardPattern: `[0-9]{12}`,
	aadharCardPattern: `[2-9]{1}[0-9]{3} [0-9]{4} [0-9]{4}`,
	drivingLicensePattern: '^(?[A-Z]{2})(?d{2})(?d{4})(?d{7})$',
	accountNumberPattern: '[0-9]{9,18}',
	gstInNumberPattern: `\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}`,
	maxLimit: 10,
	documentFileType: 'Please upload proper file format',
	imageType: 'Accepted file in jpeg, png,jpg format',
	sizeLimit: 'Please upload the file that is less then 5mb',
	noRecord: 'No records found',
	defaultNumber: '8766757655',
};

export const maskForInputFields = {
	alphabetsMask: {
		mask: /^[a-zA-Z]+$/,
		lazy: false,
	},
	integerMask: {
		mask: /^[0-9]+$/,
		lazy: false,
	},
};

export const yearsList = (forward, startYear = null) => {
	const year = startYear || new Date().getFullYear();
	return Array.from({ length: forward }, (v, i) => year - i);
};
export const yearsListForward = (forward, startYear = null) => {
	const year = startYear || new Date().getFullYear();
	return Array.from({ length: forward }, (v, i) => year + i);
};
export const courtStatus = [
	{
		label: 'No case found',
		value: 'no_case_found',
	},
	{
		label: 'Case found',
		value: 'case_found',
	},
];
export const SERVICES = {
	USER: 'USER',
	CMS: 'CMS',
	VERIFICATION: 'VERIFICATION',
	NOTIFICATION: 'NOTIFICATION',
	SUBSCRIPTION: 'SUBSCRIPTION',
	SOCIAL: 'SOCIAL',
};
export const confirmMessages = {
	deleteTitle: 'Delete data',
	deleteDescription: 'Are you sure you want delete ',
	hideTitle: 'Request status change',
	hideDescription: 'Are you sure you want to ',
	updateTitle: 'Request update',
	updateDescription: 'Are you sure you want to update ',
	requestTitle: (data: string) => {
		return `Request ${data}`;
	},
	requestDescription: (data: string) => {
		return `Are you sure you want to ${data}`;
	},
};

export const monthsName = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const defaultStatus = {
	ON_BOARDED: 'on_boarded',
	PENDING: 'pending',
	ACTIVE: 'active',
	BLOCKED: 'blocked',
	INACTIVE: 'inactive',
	DELETED: 'deleted',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	DISAPPROVED: 'disapproved',
	SUSPENDED: 'suspended',
	ABSCONDED: 'Absconded',
	TERMINATED: 'terminated',
	SITES_TERMINATED: 'terminated_sites_closed',
};
export const verificationStatus = {
	DID_NOT_VERIFY: 'did_not_verify',
	PARTIALLY_VERIFIED: 'partially_verified',
	PROTO_VERIFIED: 'proto_verified',
};
export const verificationLevel = {
	CLEAR_REPORT: 'clear_report',
	MINOR_DISCREPANCY: 'minor_discrepancy',
	IN_ACCESSIBLE_FOR_VERIFICATION: 'inaccessible_for_Verification',
	UNABLE_TO_VERIFY: 'unable_to_verify',
	ADDITIONAL_INPUTS_REQUIRED: 'additional_inputs_required',
	ADDITIONAL_DOCUMENTS_REQUIRED: 'additional_documents_required',
	MAJOR_DISCREPANCY: 'major_discrepancy',
};
export const employmentType = ['Contractual', 'On roll'];
export const accommodationType = { FLAT: 'flat', INDEPENDENT_HOUSE: 'independent_house' };
export const addressTypeList = { PERMANENT: 'permanent', CURRENT: 'current' };
export const ownershipType = { OWNER: 'owner', TENANT: 'tenant' };

export const verificationLevelList = [
	{ label: 'Clear report', name: verificationLevel.CLEAR_REPORT, color: '#12B76A' },
	{ label: 'Minor discrepancy', name: verificationLevel.MINOR_DISCREPANCY, color: '#EFDA1A' },
	{
		label: 'Inaccessible for verification',
		name: verificationLevel.IN_ACCESSIBLE_FOR_VERIFICATION,
		color: '#D05CE2',
	},
	{ label: 'Unable to verify', name: verificationLevel.UNABLE_TO_VERIFY, color: '#155EEF' },
	{ label: 'Additional inputs required', name: verificationLevel.ADDITIONAL_INPUTS_REQUIRED, color: '#7839EE' },
	{ label: 'Additional documents required', name: verificationLevel.ADDITIONAL_DOCUMENTS_REQUIRED, color: '#EAAA08' },
	{ label: 'Major discrepancy', name: verificationLevel.MAJOR_DISCREPANCY, color: '#dd2025' },
];
export const kycStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
};
export const planStatus = {
	UNPUBLISHED: 'unpublished',
	PUBLISHED: 'published',
	DELETED: 'deleted',
	EXPIRED: 'expired',
};

export const genderType = {
	M: 'male',
	F: 'Female',
};
export const Designation = [
	{ label: 'Onboarder', value: 'ON_BOARDER' },
	{ label: 'Operation', value: 'OPERATION' },
	{ label: 'Marketing', value: 'MARKETING' },
	{ label: 'Finance', value: 'FINANCE' },
	{ label: 'Hr', value: 'HR' },
	{ label: 'Ground Staff', value: 'GROUND_STAFF' },
];

export const ROLES = {
	PROTO_SUPER_ADMIN: 'PROTO_SUPER_ADMIN',
	PROTO_ADMIN: 'PROTO_ADMIN',
	PROTO_USER: 'PROTO_USER',
	PROTO_LAWYER: 'PROTO_LAWYER',
	PROTO_OPERATION: 'PROTO_OPERATION',
	EMPLOYEE: 'EMPLOYEE',
	ON_BOARDER: 'ON_BOARDER',
	CLIENT_SUPER_ADMIN: 'CLIENT_SUPER_ADMIN',
	CLIENT_ADMIN: 'CLIENT_ADMIN',
	CLIENT_USER: 'CLIENT_USER',
	CLIENT_USER_VIEW: 'CLIENT_USER_VIEW',
	VENDOR: 'VENDOR',
	AUTHOR: 'AUTHOR',

	getAllRolesAsArray: () => {
		return Object.keys(ROLES);
	},
	getClientArray: (isClientSuperAdmin: boolean): Array<string> => {
		if (isClientSuperAdmin) {
			return [
				ROLES.CLIENT_SUPER_ADMIN,
				ROLES.CLIENT_ADMIN,
				ROLES.CLIENT_USER,
				ROLES.CLIENT_USER_VIEW,
				ROLES.VENDOR,
			];
		}
		return [ROLES.CLIENT_ADMIN, ROLES.CLIENT_USER, ROLES.CLIENT_USER_VIEW, ROLES.VENDOR, ROLES.EMPLOYEE];
	},
	getWebArray: (): Array<string> => {
		return [
			ROLES.CLIENT_SUPER_ADMIN,
			ROLES.CLIENT_ADMIN,
			ROLES.CLIENT_USER,
			ROLES.CLIENT_USER_VIEW,
			ROLES.PROTO_SUPER_ADMIN,
			ROLES.PROTO_ADMIN,
			ROLES.PROTO_USER,
			ROLES.PROTO_OPERATION,
		];
	},
	getAdminArray: (): Array<string> => {
		return [
			ROLES.PROTO_SUPER_ADMIN,
			ROLES.PROTO_ADMIN,
			ROLES.PROTO_USER,
			ROLES.PROTO_LAWYER,
			ROLES.PROTO_OPERATION,
		];
	},
	getAdminList: () => [
		{ label: 'Super admin', value: ROLES.PROTO_SUPER_ADMIN },
		{ label: 'Admin', value: ROLES.PROTO_ADMIN },
		{ label: 'User', value: ROLES.PROTO_USER },
		{ label: 'Operation', value: ROLES.PROTO_OPERATION },
		{ label: 'Onboarder (Approver)', value: ROLES.ON_BOARDER },
		{ label: 'Lawyer', value: ROLES.PROTO_LAWYER },
	],
};

export const adminSideBarItems = [
	{
		name: 'Dashboard',
		icon: 'material-symbols:dashboard-outline',
		path: 'dashboard',
		value: null,
		list: [],
		role: ROLES.getWebArray(),
		accessManagement: [],
	},
	{
		name: 'Clients',
		icon: 'heroicons:user-group',
		path: 'clients',
		value: null,
		list: [],
		role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
		accessManagement: [],
	},
	// {
	// 	name: 'Plans',
	// 	icon: 'material-symbols:currency-rupee',
	// 	path: 'manage-plans',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getAdminArray().filter((e) => e != ROLES.PROTO_LAWYER),
	// 	accessManagement: [],
	// },
	// {
	// 	name: 'Employee',
	// 	icon: 'employees',
	// 	path: 'employee',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getWebArray(),
	// 	accessManagement: [],
	// },
	// {
	// 	name: 'Groups',
	// 	icon: 'groups',
	// 	path: 'groups',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getAdminArray(),
	// 	accessManagement: [],
	// },
	{
		name: 'Admins',
		icon: 'streamline:interface-share-user-human-person-share-signal-transmit-user',
		path: 'admins',
		value: null,
		list: [],
		role: ROLES.getAdminArray().filter((e) => ![ROLES.PROTO_LAWYER, ROLES.PROTO_OPERATION].includes(e)),
		accessManagement: [],
	},
	// {
	// 	name: 'Help Center',
	// 	icon: 'help-center',
	// 	path: 'help-center',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getWebArray(),
	// 	accessManagement: [],
	// },
	{
		name: 'Billing',
		icon: 'uil:file-check-alt',
		path: 'admin-billing',
		value: 'admin-billing',
		list: [],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},
	{
		name: 'Candidate Verification',
		icon: 'bi:send',
		path: 'direct-verification',
		value: 'verification',
		list: [],
		role: ROLES.getAdminArray(),
		accessManagement: [],
		inPlan: true,
	},
	{
		name: 'Vendors',
		icon: 'mi:user',
		path: 'vendors',
		value: 'vendors',
		list: [],
		role: ROLES.getAdminArray(),
		accessManagement: [],
	},
];

export const clientSideBarItems = [
	{
		name: 'Getting Started',
		icon: 'lucide:rocket',
		path: 'getting-started',
		value: null,
		list: [],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},
	{
		name: 'Wallet',
		icon: 'iconoir:wallet',
		path: 'wallet',
		value: null,
		list: [],
		role: ROLES.getWebArray(),
		accessManagement: [],
	},
	{
		name: 'Dashboard',
		icon: 'material-symbols:dashboard-outline',
		path: 'dashboard',
		value: null,
		list: [],
		role: ROLES.getWebArray(),
		accessManagement: [],
	},
	{
		name: 'Location',
		icon: 'bi:globe',
		path: 'locations',
		value: 'sites',
		list: [
			// 	{
			// 		name: 'Region',
			// 		icon: '',
			// 		path: 'regions',
			// 		value: null,
			// 		list: [],
			// 		role: [],
			// 		accessManagement: [],
			// 	},
			// 	{
			// 		name: 'Locations',
			// 		icon: '',
			// 		path: 'locations',
			// 		value: null,
			// 		list: [],
			// 		role: [],
			// 		accessManagement: [],
			// 	},
		],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},

	// {
	// 	name: 'Employee',
	// 	icon: 'employees',
	// 	path: 'employee',
	// 	value: 'employee',
	// 	list: [],
	// 	role: ROLES.getWebArray(),
	// 	accessManagement: [],
	// },
	{
		name: 'Teams',
		icon: 'lucide:users',
		path: 'client-teams',
		value: 'client_teams',
		list: [],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},

	{
		name: 'Billing',
		icon: 'uil:file-check-alt',
		path: 'billing',
		value: 'billing',
		list: [],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},
	// {
	// 	name: 'Regularization',
	// 	icon: 'regularization',
	// 	path: 'regularization',
	// 	value: 'regularization',
	// 	list: [],
	// 	role: ROLES.getClientArray(true),
	// 	accessManagement: [],
	// 	inPlan: true,
	// },
	// {
	// 	name: 'Configuration',
	// 	icon: 'configuration',
	// 	path: 'configuration',
	// 	value: 'configuration',
	// 	list: [],
	// 	role: ROLES.getClientArray(true),
	// 	accessManagement: [],
	// 	inPlan: true,
	// },
	// {
	// 	name: 'Subscriptions',
	// 	icon: 'bi:star',
	// 	path: 'subscriptions',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getClientArray(true),
	// 	accessManagement: [],
	// 	inPlan: true,
	// },
	// {
	// 	name: 'Help Center',
	// 	icon: 'help-center',
	// 	path: 'help-center',
	// 	value: null,
	// 	list: [],
	// 	role: ROLES.getWebArray(),
	// 	accessManagement: [],
	// },
	{
		name: 'Candidate Verification',
		icon: 'bi:send',
		path: 'start-verification',
		value: 'verification',
		list: [],
		role: ROLES.getClientArray(true),
		accessManagement: [],
	},

	// {
	// 	name: 'Leave Management',
	// 	icon: 'leave-management',
	// 	path: 'leave-management',
	// 	value: 'leave_validations',
	// 	list: [],
	// 	role: ROLES.getClientArray(true),
	// 	accessManagement: [],
	// 	inPlan: true,
	// },
];
export const addressType = {
	REGISTERED_ADDRESS: 'registered_address',
	OPERATION_ADDRESS: 'operational_address',
};
export const employeeAddressType = {
	POSTAL_PERMANENT_ADDRESS: 'postal_permanent_address',
	POSTAL_CURRENT_ADDRESS: 'postal_current_address',
	PHYSICAL_PERMANENT_ADDRESS: 'physical_permanent_address',
	PHYSICAL_CURRENT_ADDRESS: 'physical_current_address',
};

export const industryType = [
	'Agriculture',
	'Architect / Interiors',
	'Automobile / Repairs',
	'BPO',
	'Construction / Builders',
	'Consultancy',
	'Creative / Art',
	'Crowdfunding',
	'Dealer',
	'Distributors',
	'Drop Shipping',
	'E-Commerce',
	'Dealer',
	'Educational Institution',
	'Electronics / Hardware',
	'Engineering Services',
	'Entertainment',
	'Event Management',
	'Financial Services',
	'Food and Beverages',
	'Freelancer',
	'Gambling / Casino',
	'Health',
	'Hospitality',
	'IT / Software',
	'Import / Export',
	'Insurance',
	'Jewelry',
	'Live Stock',
	'Manpower / HR',
	'Marketing Agency',
	'Media / Advt',
	'Miscellaneous',
	'Mobile / Computer Accessories',
	'Multi Level Marketing',
	'NGO',
	'Online Services',
	'Pet Shop',
	'Photography / Studio',
	'Printing',
	'Provisional Store',
	'Retailer / Supplier',
	'Saloon / Lifestyle',
	'Tobacco',
	'Tours And Travels',
	'Trading',
	'Transportation / Logistics',
	'Unlicensed Finance Services',
	'Wholesaler',
	'Wine Shop',
];

export const businessType = [
	'Sole Proprietorship',
	'Partnership',
	'Public / Private Limited Company',
	'Trust / NGO / Societies',
	'LLP',
];

export const gettingStarted = [
	{
		checked: false,
		score: 0,
		title: 'Welcome OnBoard',
		path: 'getting-started/on-board',
	},
	{
		checked: false,
		score: 1,
		title: 'Set up Account',
		path: 'getting-started/account-setup',
	},
	{
		checked: false,
		score: 2,
		title: 'Explore Plans',
		path: 'getting-started/explore-plans',
	},
];

export const accessManagementTypes = {
	CLIENT_MANAGEMENT: 'client_management',
	PLAN_MANAGEMENT: 'plan_management',
	ADMIN_MANAGEMENT: 'admin_management',
	GROUP_MANAGEMENT: 'groups_management',
	EMPLOYEE_MANAGEMENT: 'employee_management',
	VERIFICATION_MANAGEMENT: 'verification_management',
	VENDOR_MANAGEMENT: 'vendor_management',
	CLIENT_UI_MANAGEMENT: 'client_ui_management',
};

export const verificationDetailsType = {
	PHYSICAL_VERIFICATION: 'physical_verification',
	ADDRESS_VERIFICATION: 'address_verification',
	BUSINESS_DOCUMENTS: 'business_documents',
	BANK_VERIFICATION: 'bank_verification',
	PERMANENT_ADDRESS: 'permanent_address',
};

export const selfVerificationDocument = {
	FRONT_HOUSE: 'front_house',
	INSIDE_HOUSE: 'inside_house',
};

export const planFeatures = {
	SELF_VERIFICATION: 'self_verification',
	PHYSICAL_VERIFICATION: 'physical_verification',
	// USER_BASED_ONBOARDER: 'user_based_onboarder',
	SELFIE: 'selfie',
	AADHAR_CARD: 'aadhar_card',
	PAN_CARD: 'pan_card',
	DRIVING_LICENSE: 'driving_license',
	BANK_ACCOUNT: 'bank_account',
	BANK_STATEMENT: 'bank_statement',
	EDUCATIONAL: 'educational',
	POSTAL_ADDRESS: 'postal_address',
	PHYSICAL_ADDRESS: 'physical_address',
	POLICE_VERIFICATION_THROUGH_LAWYER: 'police_verification_through_lawyer',
	POLICE_VERIFICATION_THROUGH_POLICE: 'police_verification_through_police',
	COURT_CHECK: 'court_check',
	CRIME_CHECK: 'crime_check',
	PAST_EMPLOYMENT: 'past_employment',
	REFERENCE_CHECK: 'reference_check',
	PERSON_REFERENCES: 'person_references',
	DRUG_TEST: 'drug_test',
	FORENSIC: 'forensic',
	PUNCH_IN_OUT: 'punch_in_out',
	MULTIPLE_PUNCH_IN_OUT: 'multiple_punch_in_out',
	UPLOAD_ATTENDANCE: 'upload_attendance',
	REGULARIZATION: 'regularization',
	HOLIDAY_CONFIGURATION: 'holiday_configuration',
	LEAVE_CONFIGURATION: 'leave_configuration',
	COMPLIANCE_BASED_VALIDATIONS: 'compliance_based_validations',
	AUTOMATED_REGISTER_CREATION: 'automated_register_creation',
	AUTOMATED_PAYROLL_PROCESSING: 'automated_payroll_processing',
	DAILY_PAYMENTS: 'daily_payments',
	WEEKLY_PAYMENTS: 'Weekly_payments',
	BIWEEKLY_PAYMENTS: 'biweekly_payments',
	MONTHLY_PAYMENTS: 'monthly_payments',
	GLOBAL_STATE_COMPLIANCE: 'global_state_compliance',
	AREA_ZONE_WISE_COMPLIANCE: 'area_zone_wise_compliance',
	MINIMUM_WAGE_VALIDATIONS: 'minimum_wage_validations',
	LEAVE_VALIDATIONS: 'leave_validations',
	GLOBAL_DATABASE_CHECK: 'global_database_check',
	DUAL_EMPLOYMENT: 'dual_employment',
	CIBIL: 'cibil',
	DIRECTORSHIP_TEST: 'directorship_test',
	SOCIAL_MEDIA_CHECK: 'social_media_check',
	GAP_CHECK: 'gap_check',
	RC_CHECK: 'rc_check',
	PASSPORT_CHECK: 'passport_check',
	PERMANENT_ADDRESS: 'permanent_address',
	VOTER_ID: 'voter_id',
	OFAC_CHECK: 'ofac_check',
};
export const connectionType = {
	PRE_PAID: 'prepaid',
	POST_PAID: 'postpaid',
};
export const educationalDocuments = [
	{
		label: '10th Standard Certificate',
		mediaType: '10_certificate',
	},
	{
		label: '12th standard certificate',
		mediaType: '12_certificate',
	},
	{
		label: 'Graduation certificate',
		mediaType: 'graduation_certificate',
	},
	{
		label: 'Post graduate certificate ',
		mediaType: 'post_graduation_certificate',
	},
	{
		label: 'Optional certificate',
		mediaType: 'optional_certificate',
	},
];

export const planTypes = {
	MONTHLY: 'MONTHLY',
	YEARLY: 'YEARLY',
};
export const leaveManagementType = [
	{
		label: 'Casual Leaves',
		value: 'casual',
		showCheckBox: false,
	},
	{
		label: 'Sick leaves',
		value: 'sick',
		showCheckBox: false,
	},
	{
		label: 'Compensatory leaves',
		value: 'compensatory',
		showCheckBox: false,
	},
	{
		label: 'Sandwich leaves',
		value: 'sandwich',
		showCheckBox: true,
	},
];

export const timeShift = [
	{
		label: 'Day shift',
		value: 'day_shift',
	},
	{
		label: 'General Shift',
		value: 'general_shift',
	},
	{
		label: 'Afternoon Shift',
		value: 'afternoon_shift',
	},
	{
		label: 'Night shift',
		value: 'night_shift',
	},
];

export const planModules = [
	{
		label: 'Proto Verify',
		value: 'proto_verify',
	},
	{
		label: 'Proto Payroll',
		value: 'proto_payroll',
	},
	{
		label: 'Proto Compliance',
		value: 'proto_compliance',
	},
	{
		label: 'E-Library',
		value: 'e_library',
	},
];
// list to render in verification module
export const verificationList = [
	{
		checked: false,
		score: 0,
		title: 'Organization name',
		path: 'organization',
	},
	{
		checked: false,
		score: 1,
		title: 'Aadhaar card',
		path: 'aadhar-card',
		value: planFeatures.AADHAR_CARD,
	},
	{
		checked: false,
		score: 2,
		title: 'PAN card',
		path: 'pan-card',
		value: planFeatures.PAN_CARD,
	},
	{
		checked: false,
		score: 3,
		title: 'Bank Statement',
		path: 'bank-statement',
		value: planFeatures.BANK_STATEMENT,
	},
	{
		checked: false,
		score: 3,
		title: 'Bank Account',
		path: 'bank-details',
		value: planFeatures.BANK_ACCOUNT,
	},
	{
		checked: false,
		score: 4,
		title: 'Driving license',
		path: 'driving-license',
		value: planFeatures.DRIVING_LICENSE,
	},
	{
		checked: false,
		score: 5,
		title: 'Court check',
		path: null,
		value: planFeatures.COURT_CHECK,
	},
	{
		checked: false,
		score: 6,
		title: 'Self-Address Verification',
		path: 'self-verification',
		value: planFeatures.SELF_VERIFICATION,
	},
	{
		checked: false,
		score: 7,
		label: 'Past employment Details',
		title: 'Past employment Details',
		path: null,
		value: planFeatures.PAST_EMPLOYMENT,
	},
	{
		checked: false,
		score: 7,
		label: 'Reference Check',
		title: 'Reference Check',
		path: 'reference-check',
		value: planFeatures.REFERENCE_CHECK,
	},
	{
		checked: false,
		score: 8,
		label: 'Education checks',
		title: 'Education checks',
		path: 'educational-details',
		value: planFeatures.EDUCATIONAL,
	},
	{
		checked: false,
		score: 9,
		title: 'Address Details',
		path: 'physical-address',
		value: planFeatures.PHYSICAL_ADDRESS,
	},
	// {
	// 	checked: false,
	// 	score: 10,
	// 	title: 'Physical address verification',
	// 	path: 'physical-address',
	// 	value: planFeatures.PHYSICAL_ADDRESS,
	// },
	{
		checked: false,
		score: 11,
		label: 'Police verification by lawyer',
		title: 'Police verification by lawyer',
		path: 'police-lawyer',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
	},
	{
		checked: false,
		score: 12,
		label: 'Police verification by Police',
		title: 'Police verification by Police',
		path: 'police-verification',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
	},
	// {
	// 	checked: false,
	// 	score: 13,
	// 	title: 'Forensic Check',
	// 	path: null,
	// 	value: planFeatures.FORENSIC,
	// },
	{
		checked: false,
		score: 14,
		label: 'Court check',
		title: 'Court check',
		path: 'court-check',
		value: planFeatures.COURT_CHECK,
	},
	{
		checked: false,
		score: 16,
		label: 'Dual Employment Check',
		title: 'Dual Employment Check',
		path: 'dual-employment-check',
		value: planFeatures.DUAL_EMPLOYMENT,
	},
	{
		checked: false,
		score: 17,
		label: 'CIBIL Check',
		title: 'CIBIL Check',
		path: 'cibil-check',
		value: planFeatures.CIBIL,
	},
	{
		checked: false,
		score: 18,
		label: 'Passport Check',
		title: 'Passport Check',
		path: 'passport-check',
		value: planFeatures.PASSPORT_CHECK,
	},
	{
		checked: false,
		score: 19,
		label: 'OFAC Check',
		title: 'OFAC Check',
		value: planFeatures.OFAC_CHECK,
		path: 'ofac-check',
	},
];

export const planModulesFeatures = [
	// {
	// 	checked: false,
	// 	label: 'Selfie',
	// 	title: 'Selfie',
	// 	value: planFeatures.SELFIE,
	// 	module: planModules[0].value,
	// },
	{
		checked: false,
		label: 'Aadhaar Card',
		title: 'Aadhaar Card',
		value: planFeatures.AADHAR_CARD,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Address Details',
		title: 'Address Details',
		value: planFeatures.PHYSICAL_ADDRESS,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Self Address Verification',
		title: 'Self Address Verification',
		value: planFeatures.SELF_VERIFICATION,
		module: planModules[0].value,
	},
	// {
	// 	checked: false,
	// 	label: 'Physical Address Verification',
	// 	title: 'Physical Address Verification',
	// 	value: planFeatures.PHYSICAL_VERIFICATION,
	// 	module: planModules[0].value,
	// },
	{
		checked: false,
		label: 'Current Address Physical Verification',
		title: 'Current Address Physical Verification',
		value: planFeatures.PHYSICAL_VERIFICATION,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'PAN Card',
		title: 'PAN Card',
		value: planFeatures.PAN_CARD,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Education',
		title: 'Education',
		value: planFeatures.EDUCATIONAL,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Driving License',
		title: 'Driving License',
		value: planFeatures.DRIVING_LICENSE,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Bank Statement',
		title: 'Bank Statement',
		value: planFeatures.BANK_STATEMENT,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Bank Account',
		title: 'Bank Account',
		value: planFeatures.BANK_ACCOUNT,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Voter Id Check',
		title: 'Voter Id Check',
		value: planFeatures.VOTER_ID,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Police verification through lawyer',
		title: 'Police verification through lawyer',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Police verification through police',
		title: 'Police verification through police',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Crime Check',
		title: 'Crime Check',
		value: planFeatures.COURT_CHECK,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Past Employments Details',
		title: 'Past Employments Details',
		value: planFeatures.PAST_EMPLOYMENT,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Reference Check',
		title: 'Reference Check',
		value: planFeatures.REFERENCE_CHECK,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Global Database Check',
		title: 'Global Database Check',
		value: planFeatures.GLOBAL_DATABASE_CHECK,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Dual Employment Check',
		title: 'Dual Employment Check',
		value: planFeatures.DUAL_EMPLOYMENT,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'CIBIL Check',
		title: 'CIBIL Check',
		value: planFeatures.CIBIL,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'DIRECTORSHIP Test',
		title: 'DIRECTORSHIP Test',
		value: planFeatures.DIRECTORSHIP_TEST,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'DRUG Test',
		title: 'DRUG Test',
		value: planFeatures.DRUG_TEST,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'Social Media  Check',
		title: 'Social Media  Check',
		value: planFeatures.SOCIAL_MEDIA_CHECK,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'Gap Check',
		title: 'Gap Check',
		value: planFeatures.GAP_CHECK,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'RC Check',
		title: 'RC Check',
		value: planFeatures.RC_CHECK,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'OFAC Check',
		title: 'OFAC Check',
		value: planFeatures.OFAC_CHECK,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'Passport Check',
		title: 'Passport Check',
		value: planFeatures.PASSPORT_CHECK,
		module: planModules[0].value,
		price: null,
	},
	{
		checked: false,
		label: 'Permanent Address Physical Verification',
		title: 'Permanent Address Physical Verification',
		value: planFeatures.PERMANENT_ADDRESS,
		module: planModules[0].value,
	},
	{
		checked: false,
		label: 'Postal Address Physical Verification',
		title: 'Postal Address Physical Verification',
		value: planFeatures.POSTAL_ADDRESS,
		module: planModules[0].value,
	},
	// 	module: planModules[1].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Compliance based validations',
	// 	title: 'Compliance based validations',
	// 	value: planFeatures.COMPLIANCE_BASED_VALIDATIONS,
	// 	module: planModules[1].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Automated register creation',
	// 	title: 'Automated register creation',

	// 	value: planFeatures.AUTOMATED_REGISTER_CREATION,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Automated Payroll Processing',
	// 	title: 'Automated Payroll Processing',
	// 	value: planFeatures.AUTOMATED_PAYROLL_PROCESSING,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Daily, Weekly, Bi-weekly, Monthly Payment',
	// 	title: 'Daily Payment',
	// 	value: planFeatures.DAILY_PAYMENTS,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Global state compliance',
	// 	title: 'Global state compliance',
	// 	value: planFeatures.GLOBAL_STATE_COMPLIANCE,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Area zone wise compliance',
	// 	title: 'Area zone wise compliance',
	// 	value: planFeatures.AREA_ZONE_WISE_COMPLIANCE,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Minimum wage validations',
	// 	title: 'Minimum wage validations',
	// 	value: planFeatures.MINIMUM_WAGE_VALIDATIONS,
	// 	module: planModules[2].value,
	// },
	// {
	// 	checked: false,
	// 	label: 'Leave validation',
	// 	title: 'Leave validation',
	// 	value: planFeatures.LEAVE_VALIDATIONS,
	// 	module: planModules[2].value,
	// },
];

export const planTitles = [
	{
		label: 'Basic',
		value: 'basic',
	},
	{
		label: 'Essentials',
		value: 'essentials',
	},
	{
		label: 'Enterprise',
		value: 'enterprise',
	},
];

export const monthNames = [
	{ id: 0, name: 'January' },
	{ id: 1, name: 'February' },
	{ id: 2, name: 'March' },
	{ id: 3, name: 'April' },
	{ id: 4, name: 'May' },
	{ id: 5, name: 'June' },
	{ id: 6, name: 'July' },
	{ id: 7, name: 'August' },
	{ id: 8, name: 'September' },
	{ id: 9, name: 'October' },
	{ id: 10, name: 'November' },
	{ id: 11, name: 'December' },
];

export const yearDropdown = [
	{
		label: '1 Year',
		value: '1 year',
	},
	{
		label: '2 Year',
		value: '2 year',
	},
	{
		label: '3 Year',
		value: '3 year',
	},
	{
		label: '4 Year',
		value: '4 year',
	},
	{
		label: '5 Year',
		value: '5 year',
	},
];

export const monthDropdown = [
	{
		label: '1 Month',
		value: '1 month',
	},
	{
		label: '2 Month',
		value: '2 month',
	},
	{
		label: '3 Month',
		value: '3 month',
	},
	{
		label: '4 Month',
		value: '4 month',
	},
	{
		label: '5 Month',
		value: '5 month',
	},
	{
		label: '6 Month',
		value: '6 month',
	},
	{
		label: '7 Month',
		value: '7 month',
	},
	{
		label: '8 Month',
		value: '8 month',
	},
	{
		label: '9 Month',
		value: '9 month',
	},
	{
		label: '10 Month',
		value: '10 month',
	},
	{
		label: '11 Month',
		value: '11 month',
	},
];

export enum PermissionType {
	VIEW = 'VIEW',
	ADD = 'ADD',
	EDIT = 'EDIT',
	DELETE = 'DELETE',
}

export const dashboardKeyBasedVerificationList = [
	{
		name: 'Aadhaar Card',
		value: planFeatures.AADHAR_CARD,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_aadhar.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'aadhar-card',
	},
	{
		name: 'Driving License',
		value: planFeatures.DRIVING_LICENSE,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_driving.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'driving-license',
	},
	{
		name: 'PAN Card',
		value: planFeatures.PAN_CARD,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_pan.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'pan-card',
	},
	{
		name: 'Bank Account Verification',
		value: planFeatures.BANK_ACCOUNT, // needed for data fetch for ticket by checks details page(need to send as type)
		// value: 'bankVerification',  // needed for data fetch for ticket by checks tab(coming as key)
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_bank.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'bank-details',
	},
	{
		name: 'Past Employment Verification',
		//value: 'pastEmployment',
		//type: 'past_employment',
		//value: 'past_employment',
		value: planFeatures.PAST_EMPLOYMENT,
		service: SERVICES.USER,
		icon: '/assets/images/kyc_past_employment.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'past-employment',
	},
	{
		name: 'Reference Check',
		// value: 'reference',
		//type: 'reference_check',
		//value: 'reference_check',
		value: planFeatures.REFERENCE_CHECK,
		service: SERVICES.USER,
		icon: '/assets/images/kyc_reference_check.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'reference-check',
	},
	{
		name: 'Current Address Physical Verification',
		value: planFeatures.PHYSICAL_VERIFICATION,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_physical_verification.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'physical-verification',
	},
	{
		name: 'Self Address Verification',
		value: planFeatures.SELF_VERIFICATION,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_self.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'self-verification',
	},
	{
		name: 'Postal Address Verification',
		value: planFeatures.POSTAL_ADDRESS,
		service: SERVICES.USER,
		icon: '/assets/images/kyc_address.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'postal-address',
	},
	{
		name: 'Permanent Address Physical Verification',
		value: planFeatures.PERMANENT_ADDRESS,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/permanent_address.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'permanent-address',
	},
	{
		name: 'Passport Check',
		value: planFeatures.PASSPORT_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_passport.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'passport-check',
	},
	{
		name: 'Crime Check',
		value: planFeatures.COURT_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_court_check.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'court-check',
	},
	{
		name: 'Education Verification',
		//value: 'educationalVerification',
		value: planFeatures.EDUCATIONAL,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_education.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'educational-details',
	},
	{
		name: 'Police verification through lawyer',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_LAWYER,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_police_lawyer.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'police-lawyer',
	},
	{
		name: 'Global Database Check',
		value: planFeatures.GLOBAL_DATABASE_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/global-database-check.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'global-database-check',
	},
	{
		name: 'Dual Employment Check',
		value: planFeatures.DUAL_EMPLOYMENT,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_dual_employment.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'dual-employment-check',
	},
	{
		name: 'Police verification through police',
		value: planFeatures.POLICE_VERIFICATION_THROUGH_POLICE,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_police.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'police-verification',
	},

	{
		name: 'Cibil Check',
		value: planFeatures.CIBIL,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_cibil.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'cibil-check',
	},
	{
		name: 'Directorship Test',
		value: planFeatures.DIRECTORSHIP_TEST,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_directorship.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'directorship-test',
	},
	{
		name: 'Drug Test',
		value: planFeatures.DRUG_TEST,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_drug.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'drug-test',
	},
	{
		name: 'Social Media Check',
		value: planFeatures.SOCIAL_MEDIA_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_social.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'social-media-check',
	},
	{
		name: 'Gap Check',
		value: planFeatures.GAP_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_gap.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'gap-check',
	},
	{
		name: 'RC Check',
		value: planFeatures.RC_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/rc-check.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'rc-check',
	},
	{
		name: 'Bank Statement',
		value: planFeatures.BANK_STATEMENT,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/bank-statement.png',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'bank-statement',
	},
	{
		name: 'Voter Id',
		value: planFeatures.VOTER_ID,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_voter_id.svg',
		category: ['Candidate Open', 'Ops Open', 'Completed'],
		path: 'voter-id',
	},
	{
		name: 'OFAC Check',
		value: planFeatures.OFAC_CHECK,
		service: SERVICES.VERIFICATION,
		icon: '/assets/images/kyc_ofac.svg',
		category: ['Candidate Open', 'Ops Open', 'Vendor Open', 'Completed'],
		path: 'ofac-check',
	},
];
