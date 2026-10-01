import data from "@/generated/licenses.json";

export const LINKS = {
	privacyPolicy: "https://ozanArslan2424.github.io/uptime-monitor/privacy-policy",
	termsOfUse: "https://ozanArslan2424.github.io/uptime-monitor/terms-of-use",
	supportEmail: "ozanarslanodtu@gmail.com",
} as const;

export const NOTIFICATION_CHANNELS = {
	serviceStatus: "service-status",
} as const;

export interface License {
	name: string;
	version: string;
	license: string;
	repository?: string;
	text?: string;
}

export const LICENSES = data as License[];
