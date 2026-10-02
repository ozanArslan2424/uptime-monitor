import Storage from "expo-sqlite/kv-store";
import { useSyncExternalStore } from "react";

import { ExternalStore } from "@/lib/ExternalStore";

export interface Settings {
	allowHttp: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
	allowHttp: false,
};

const STORAGE_KEY = "settings";

const store = new ExternalStore<Settings>(() => {
	const raw = Storage.getItemSync(STORAGE_KEY);
	if (raw === null) {
		return DEFAULT_SETTINGS;
	}
	try {
		return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
	} catch {
		return DEFAULT_SETTINGS;
	}
});

/** Current settings outside React (e.g. in checkService). */
export function getSettings(): Settings {
	return store.state;
}

export function updateSettings(patch: Partial<Settings>) {
	store.setState((prev) => ({
		...prev,
		...patch,
	}));
	Storage.setItemSync(STORAGE_KEY, JSON.stringify(store.state));
}

export function resetSettings() {
	store.setState(DEFAULT_SETTINGS);
	Storage.removeItemSync(STORAGE_KEY);
}

/** Current settings in React; re-renders when any setting changes. */
export function useSettings(): Settings {
	return useSyncExternalStore(store.subscribe, getSettings);
}
