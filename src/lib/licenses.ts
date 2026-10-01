import data from "@/generated/licenses.json";

export interface License {
	name: string;
	version: string;
	license: string;
	repository?: string;
	text?: string;
}

export const LICENSES = data as License[];
