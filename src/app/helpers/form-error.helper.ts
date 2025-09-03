export const authFieldsErrors = {
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	firstName: [
		{ type: 'required', message: 'Enter first name' },
		{ type: 'maxlength', message: 'Max 25 character are allowed' },
	],
	lastName: [
		{ type: 'required', message: 'Enter last name' },
		{ type: 'maxlength', message: 'Max 25 character are allowed' },
	],
	tempOtp: [{ type: 'required', message: 'Enter OTP' }],
	countryName: [{ type: 'required', message: 'Select country' }],
	state: [{ type: 'required', message: 'Select state' }],
	city: [{ type: 'required', message: 'Select city' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	organizationId: [{ type: 'required', message: 'Select business' }],
	type: [{ type: 'required', message: 'Select business type' }],
	industry: [{ type: 'required', message: 'Select industry' }],
	registeredName: [{ type: 'required', message: 'Enter business name' }],
	connectionType: [
		{
			type: 'required',
			message: 'Select payment type',
		},
	],
	panNumber: [
		{ type: 'required', message: 'Enter PAN number' },
		{ type: 'pattern', message: 'Please enter a valid PAN number' },
	],
	gstNumber: [
		{ type: 'required', message: 'Enter GST number' },
		{ type: 'pattern', message: 'Please enter a valid GST number' },
	],
};

export const regionFieldForm = {
	title: [{ type: 'required', message: 'Enter title' }],
	description: [{ type: 'required', message: 'Enter description' }],
};

export const educcationFieldForm = {
	board: [{ type: 'required', message: 'Enter board' }],
	qualification: [{ type: 'required', message: 'Enter qualification' }],
	registrationNumber: [{ type: 'required', message: 'Enter registration number' }],
	college: [{ type: 'required', message: 'Enter organization name' }],
	yearOfPassing: [{ type: 'required', message: 'Select year of passing' }],
	leavingDocument: [{ type: 'required', message: 'Upload document' }],
	certificateDocument: [{ type: 'required', message: 'Upload certificate' }],
	passingDocument: [{ type: 'required', message: 'Upload passing document' }],
	finalYearDocument: [{ type: 'required', message: 'Upload Final year marksheet' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	name: [{ type: 'required', message: 'Enter name' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	resultOfVerification: [{ type: 'required', message: 'Enter result of verification' }],
	supportingDocument: [{ type: 'required', message: 'Upload Supporting Document' }],
};

export const pastEmployeeFieldsForm = {
	organizationName: [{ type: 'required', message: 'Enter organization name' }],
	salary: [{ type: 'required', message: 'Enter salary' }],
	location: [{ type: 'required', message: 'Select location' }],
	fromDate: [{ type: 'required', message: 'Enter from date' }],
	toDate: [{ type: 'required', message: 'Enter to date' }],
	employeeId: [{ type: 'required', message: 'Enter employee Id' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	employmentType: [{ type: 'required', message: 'Enter employment type' }],
	hrDetails: {
		name: [{ type: 'required', message: 'Enter hr name' }],
		email: [
			{ type: 'required', message: 'Enter Email' },
			{ type: 'pattern', message: 'Please enter a valid email address' },
		],
		mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	},
	reportingManager: {
		name: [{ type: 'required', message: 'Enter reporting manager name' }],
		email: [
			{ type: 'required', message: 'Enter Email' },
			{ type: 'pattern', message: 'Please enter a valid email address' },
		],
		mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	},
	remark: [{ type: 'required', message: 'Enter remark' }],
	supportingDocument: [{ type: 'required', message: 'Upload Supporting Document' }],
	reasonOfDiscontinuance: [{ type: 'required', message: 'Enter reason' }],
	anyExitFormalitiesPending: [{ type: 'required', message: 'Select option' }],
	formalitiesFromWhom: [{ type: 'required', message: 'Select option' }],
};

export const referenceCheckFieldForms = {
	organizationName: [{ type: 'required', message: 'Enter organization name' }],
	name: [{ type: 'required', message: 'Enter hr name' }],
	email: [
		{ type: 'required', message: 'Enter Email' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	location: [{ type: 'required', message: 'Select location' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
};

export const pastEmployeeFieldsHrForm = {
	employeeNameCheck: [{ type: 'required', message: 'Enter here' }],
	organizationCheck: [{ type: 'required', message: 'Enter here' }],
	locationCheck: [{ type: 'required', message: 'Enter here' }],
	employeeIdCheck: [{ type: 'required', message: 'Enter here' }],
	employeeDateCheck: [{ type: 'required', message: 'Enter here' }],
	designationCheck: [{ type: 'required', message: 'Enter here' }],
	salaryCheck: [{ type: 'required', message: 'Enter here' }],
	reasonOfDiscontinuance: [{ type: 'required', message: 'Enter here' }],
	anyExitFormalitiesPending: [{ type: 'required', message: 'Enter here' }],
	formalitiesFromWhom: [{ type: 'required', message: 'Enter here' }],
	performanceAtWork: [{ type: 'required', message: 'Enter here' }],
	disciplinaryIssue: [{ type: 'required', message: 'Enter here' }],
	eligibilityForRehire: [{ type: 'required', message: 'Enter here' }],
	isSalarySlipCorrect: [{ type: 'required', message: 'Enter here' }],
	isOfferLetterCorrect: [{ type: 'required', message: 'Enter here' }],
	hrsName: [{ type: 'required', message: 'Enter here' }],
	hrsDesignation: [{ type: 'required', message: 'Enter here' }],
	hrsMobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
};
export const referenceCheckFieldsHrForm = {
	employeeNameCheck: [{ type: 'required', message: 'Enter here' }],
	organizationCheck: [{ type: 'required', message: 'Enter here' }],
	locationCheck: [{ type: 'required', message: 'Enter here' }],
	yearsOfKnown: [{ type: 'required', message: 'Enter here' }],
	capacityOfWorking: [{ type: 'required', message: 'Enter here' }],
	rolesAndResponsibility: [{ type: 'required', message: 'Enter here' }],
	professionalStrengths: [{ type: 'required', message: 'Enter here' }],
	areasOfImprovement: [{ type: 'required', message: 'Enter here' }],
	reasonOfLeaving: [{ type: 'required', message: 'Enter here' }],
	eligibilityForRehire: [{ type: 'required', message: 'Enter here' }],
	keyAttributes: [{ type: 'required', message: 'Enter here' }],
	comparisonWithOthers: [{ type: 'required', message: 'Enter here' }],
	personalQualities: [{ type: 'required', message: 'Enter here' }],
	motivationOfCandidate: [{ type: 'required', message: 'Enter here' }],
	verbalAndWriterRating: [{ type: 'required', message: 'Enter here' }],
	commitmentRating: [{ type: 'required', message: 'Enter here' }],
	passionRating: [{ type: 'required', message: 'Enter here' }],
	integrityRating: [{ type: 'required', message: 'Enter here' }],
};
export const siteFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	website: [
		{ type: 'required', message: 'Enter website url' },
		{ type: 'pattern', message: 'Please enter valid website url' },
	],
	description: [{ type: 'required', message: 'Enter description' }],
	contactName: [{ type: 'required', message: 'Enter contact name' }],
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	countryName: [{ type: 'required', message: 'Select country' }],
	state: [{ type: 'required', message: 'Select state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	addressLine1: [{ type: 'required', message: 'Enter address line 1' }],
	addressLine2: [{ type: 'required', message: 'Enter address line 2' }],
	latitude: [{ type: 'required', message: 'Select coordinates' }],
	longitude: [{ type: 'required', message: 'Select coordinates' }],
	geoFence: [{ type: 'required', message: 'Select geo Fence' }],
	regionId: [{ type: 'required', message: 'Select region' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
};

export const uploadFieldForm = {
	file: [{ type: 'required', message: 'Please upload the file' }],
	sitesId: [{ type: 'required', message: 'Enter sites id' }],
	regionId: [{ type: 'required', message: 'Enter region id' }],
};
export const verificationFieldForm = {
	courtCheck: [{ type: 'required', message: 'Please select court' }],
	noOfCases: [{ type: 'required', message: 'Enter number of cases' }],
	remark: [{ type: 'required', message: 'Enter remark' }],
	vendorId: [{ type: 'required', message: 'Select' }],
};
export const businessDetailsFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	type: [{ type: 'required', message: 'Select business type' }],
	industry: [{ type: 'required', message: 'Select industry' }],
	registeredName: [{ type: 'required', message: 'Enter company name' }],
	employeeCount: [{ type: 'required', message: 'Enter employee count' }],
	panNumber: [
		{ type: 'required', message: 'Enter PAN number' },
		{ type: 'pattern', message: 'Please enter a valid PAN number' },
	],
	gstNumber: [
		{ type: 'required', message: 'Enter GST number' },
		{ type: 'pattern', message: 'Please enter a valid GST number' },
	],
	cinNumber: [{ type: 'required', message: 'Enter CIN number' }],
	website: [
		{ type: 'required', message: 'Enter website' },
		{ type: 'pattern', message: 'Please enter valid website url' },
	],
	yearINC: [
		{ type: 'required', message: 'Enter year INC' },
		{ type: 'pattern', message: 'Please enter a valid year of INC' },
	],
	countryName: [{ type: 'required', message: 'Select country' }],
	state: [{ type: 'required', message: 'Select state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	addressLine1: [{ type: 'required', message: 'Enter address line 1' }],
	addressLine2: [{ type: 'required', message: 'Enter address line 2' }],
	latitude: [{ type: 'required', message: 'Select location' }],
	longitude: [{ type: 'required', message: 'Select location' }],
};

export const addressFieldForm = {
	countryName: [{ type: 'required', message: 'Select country' }],
	state: [{ type: 'required', message: 'Select state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	addressLine1: [{ type: 'required', message: 'Enter address line 1' }],
	addressLine2: [{ type: 'required', message: 'Enter address line 2' }],
	periodOfStay: [{ type: 'required', message: 'Enter period of stay' }],
	years: [
		{ type: 'required', message: 'Enter Number of Years' },
		{ type: 'max', message: 'Enter valid year' },
	],
	months: [{ type: 'required', message: 'Select Number of Months' }],
	accommodationType: [{ type: 'required', message: 'Select accommodation type' }],
	addressType: [{ type: 'required', message: 'Select address type' }],
	ownershipType: [{ type: 'required', message: 'Select owner ship type' }],
};

export const teamFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	role: [{ type: 'required', message: 'Select role' }],
	adminTeam: [{ type: 'required', message: 'Select client' }],
	designation: [{ type: 'required', message: 'Select designation' }],
};

export const clientTeamFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	description: [{ type: 'required', message: 'Enter description' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	regions: [{ type: 'required', message: 'Select region' }],
	sites: [{ type: 'required', message: 'Select sites' }],
};

export const employeeFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	role: [{ type: 'required', message: 'Enter role' }],
	sitesId: [{ type: 'required', message: 'Enter sites id' }],
	regionId: [{ type: 'required', message: 'Enter region id' }],
	associateId: [{ type: 'required', message: 'Enter company/organization' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	onboardingBase: [{ type: 'required', message: 'Select onboarding organization' }],
	reportingManagerId: [{ type: 'required', message: 'Enter report manger' }],
	onBoardingManagerId: [{ type: 'required', message: 'Enter onboarding manager' }],
	timeShiftId: [{ type: 'required', message: 'Select time shift' }],
	subscriptionId: [{ type: 'required', message: 'Select Plan' }],
	verificationChecks: [{ type: 'required', message: 'Select verification' }],
};
export const consentSignatureFieldsErrors = {
	signature: [{ type: 'required', message: 'Upload your signature' }],
};
export const changeOrganizationFieldForm = {
	fromDate: [{ type: 'required', message: 'Select from date' }],
	toDate: [{ type: 'required', message: 'Select from to date' }],
	associateId: [{ type: 'required', message: 'Select new organization' }],
};

export const vendorFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	email: [
		{ type: 'required', message: 'Enter email address' },
		{ type: 'pattern', message: 'Please enter a valid email address' },
	],
	countryCode: [{ type: 'required', message: 'Select country' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	panNumber: [
		{ type: 'required', message: 'Enter pan number' },
		{ type: 'pattern', message: 'Please enter a valid pan number' },
	],
	gstNumber: [{ type: 'required', message: 'Enter gst number' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	companyName: [{ type: 'required', message: 'Enter company name' }],
};

export const businessDocumentsFieldForm = {
	status: [{ type: 'required', message: 'Select status' }],
	filePath: [{ type: 'required', message: 'Select file' }],
	remark: [{ type: 'required', message: 'Enter remark' }],
	supportingDocument: [{ type: 'required', message: 'Upload Supporting Document' }],
	comment: [{ type: 'required', message: 'Enter comment' }],
	state: [{ type: 'required', message: 'Select state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	addressLine1: [{ type: 'required', message: 'Enter address line 1' }],
	addressLine2: [{ type: 'required', message: 'Enter address line 2' }],
	periodOfStay: [{ type: 'required', message: 'Enter period of stay' }],
	years: [
		{ type: 'required', message: 'Enter Number of Years' },
		{ type: 'max', message: 'Enter valid year' },
	],
	months: [{ type: 'required', message: 'Select Number of Months' }],
	accommodationType: [{ type: 'required', message: 'Select accommodation type' }],
	addressType: [{ type: 'required', message: 'Select address type' }],
	ownershipType: [{ type: 'required', message: 'Select owner ship type' }],
	policeStationDateOfVisit: [{ type: 'required', message: 'Enter date of visit' }],
	policeStationName: [{ type: 'required', message: 'Enter Police station name' }],
	policeStationNumber: [{ type: 'required', message: 'Enter Police station number' }],
	policeStationAuthorityName: [{ type: 'required', message: 'Enter Police station authority name' }],
	policeStationAuthorityDesignation: [{ type: 'required', message: 'Enter Police station authority designation' }],
	policeStationYearCovered: [{ type: 'required', message: 'Enter Police station year' }],
	policeStationVerificationResult: [{ type: 'required', message: 'Enter Police station verification result' }],
	physicalVerificationAddressId: [{ type: 'required', message: 'Select address' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	name: [{ type: 'required', message: 'Enter name' }],
	designation: [{ type: 'required', message: 'Enter designation' }],
	formattedAddress: [{ type: 'required', message: 'Enter address' }],
	latitude: [{ type: 'required', message: 'Select coordinates' }],
	longitude: [{ type: 'required', message: 'Select coordinates' }],
	vendorId: [{ type: 'required', message: 'Select' }],
};

export const groupFieldForm = {
	name: [{ type: 'required', message: 'Enter name' }],
	description: [{ type: 'required', message: 'Enter description' }],
};
export const helpCenterFieldForm = {
	title: [{ type: 'required', message: 'Enter title' }],
	description: [{ type: 'required', message: 'Enter description' }],
};
export const viewfaqFieldForm = {
	question: [{ type: 'required', message: 'Enter question', require: 'true' }],
	answer: [{ type: 'required', message: 'Enter answer', require: 'true' }],
};
export const managePlanFieldForm = {
	title: [{ type: 'required', message: 'Enter title' }],
	description: [{ type: 'required', message: 'Enter description' }],
	module: [{ type: 'required', message: 'Select module' }],
	amountPerVerification: [{ type: 'required', message: 'Enter amount' }],
	noOfVerification: [{ type: 'required', message: 'Enter no. of verification' }],
	planType: [{ type: 'required', message: 'Select plan type' }],
	planFeature: [{ type: 'required', message: 'Select plan features' }],
	userPlan: [{ type: 'required', message: 'Select client' }],
};

export const clientRequestPlanForm = {
	title: [{ type: 'required', message: 'Enter title' }],
	description: [{ type: 'required', message: 'Enter title' }],
	userPlanRequestFeature: [{ type: 'required', message: 'Select plan features' }],
	module: [{ type: 'required', message: 'Select module' }],
	amountPerVerification: [{ type: 'required', message: 'Enter amount' }],
	noOfVerification: [{ type: 'required', message: 'Enter no. of verification' }],
	planType: [{ type: 'required', message: 'Select plan type' }],
};
export const leaveManagementFieldForm = {
	yearly: [{ type: 'required', message: 'Enter yearly laves' }],
	monthly: [{ type: 'required', message: 'Enter monthly laves' }],
};

export const timeShiftFieldForm = {
	type: [{ type: 'required', message: 'Select shift' }],
	name: [{ type: 'required', message: 'Enter name' }],
	startTime: [{ type: 'required', message: 'Enter start time' }],
	endTime: [{ type: 'required', message: 'Enter end time' }],
	days: [{ type: 'required', message: 'Select days(s)' }],
};

export const holidayFieldForm = {
	holidayName: [{ type: 'required', message: 'Enter day name' }],
	holidayDate: [{ type: 'required', message: 'Select date' }],
};

export const checkinTimeFieldForm = {
	sitePermission: [{ type: 'required', message: 'Select site permission' }],
	cameraSelfis: [{ type: 'required', message: 'Select camera selfis' }],
};

export const kycFieldForm = {
	cardNumber: [
		{ type: 'required', message: 'Enter card number' },
		{ type: 'pattern', message: 'Please enter a valid card number' },
	],
	frontImage: [{ type: 'required', message: 'Select upload card photo' }],
	backImage: [{ type: 'required', message: 'Select upload card photo' }],
	dateOfBirth: [{ type: 'required', message: 'Select date of birth' }],
	dob: [{ type: 'required', message: 'Select date of birth' }],
	remark: [{ type: 'required', message: 'Enter remark' }],
	name: [{ type: 'required', message: 'Enter name' }],
	parentName: [{ type: 'required', message: `Enter father's name` }],
	inputAddress: [{ type: 'required', message: `Enter address` }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	state: [{ type: 'required', message: 'Enter state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	gender: [{ type: 'required', message: 'Enter gender' }],
	vendorId: [{ type: 'required', message: 'Select' }],
};
export const bankDetailsFieldForm = {
	ifscCode: [{ type: 'required', message: 'Enter IFSC code' }],
	accountNumber: [
		{ type: 'required', message: 'Enter account number' },
		{ type: 'pattern', message: 'Please enter valid account number' },
	],
	accountName: [{ type: 'required', message: 'Enter account name' }],
	remark: [{ type: 'required', message: 'Enter remark' }],
};
export const contactFieldForm = {
	address: [{ type: 'required', message: 'Enter Address' }],
	pincode: [
		{ type: 'required', message: 'Enter pincode' },
		{ type: 'pattern', message: 'Enter valid pincode' },
	],
	state: [{ type: 'required', message: 'Enter state' }],
	city: [{ type: 'required', message: 'Enter city' }],
	mobileNumber: [{ type: 'required', message: 'Enter mobile number' }],
	countryName: [{ type: 'required', message: 'Select country' }],
};

export const changeStatusFieldForm = {
	status: [{ type: 'required', message: 'Select status' }],
};
