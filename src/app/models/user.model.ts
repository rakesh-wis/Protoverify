export interface User {
	id: number;
	email: string;
	name: string;
	countryCode: number;
	mobileNumber: number;
	firstName: string;
	lastName: string;
	token: string;
	createdAt: string;
	lastLoginAt: string;
	isEmailVerified: Boolean;
	isMobileNumberVerified: Boolean;
	status: string;
	role: string;
	profilePicture: string;
	accessManagement?: AccessManagement[];
	associateId: number;
}

interface AccessManagement {
	id: number;
	type: string;
	view: boolean;
	edit: boolean;
	delete: boolean;
	status: string;
	userId: number;
}

interface Media {
	id: number;
	fileName: string;
	fileType: string;
	filePath: string;
}

export interface UserList {
	data: User[];
	count: number;
}
