export interface SideBar {
	name: string;
	icon: string;
	path: string;
	value: string;
	list: SideBar[];
	role: Array<string>;
	accessManagement: Array<AccessManagement>;
}

export interface AccessManagement {
	type: string;
	view: boolean;
	edit: boolean;
	delete: boolean;
	userId: string;
}
