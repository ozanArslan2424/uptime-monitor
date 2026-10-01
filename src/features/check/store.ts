import { useSyncExternalStore } from "react";

import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";
import { ExternalStore } from "@/lib/ExternalStore";

interface CheckState {
	checking: ReadonlySet<Service["id"]>;
	latest: ReadonlyMap<Service["id"], Check>;
}

const store = new ExternalStore<CheckState>(() => ({
	checking: new Set(),
	latest: new Map(),
}));

export function isChecking(serviceId: Service["id"]): boolean {
	return store.state.checking.has(serviceId);
}

export function startChecking(serviceId: Service["id"]) {
	store.setState((prev) => ({ ...prev, checking: new Set(prev.checking).add(serviceId) }));
}

export function finishChecking(serviceId: Service["id"]) {
	store.setState((prev) => {
		const checking = new Set(prev.checking);
		checking.delete(serviceId);
		return { ...prev, checking };
	});
}

export function setLatestCheck(check: Check) {
	store.setState((prev) => ({ ...prev, latest: new Map(prev.latest).set(check.serviceId, check) }));
}

export function useIsChecking(serviceId: Service["id"]): boolean {
	return useSyncExternalStore(store.subscribe, () => store.state.checking.has(serviceId));
}

export function useLatestCheck(serviceId: Service["id"]): Check | undefined {
	return useSyncExternalStore(store.subscribe, () => store.state.latest.get(serviceId));
}

export function useLatestChecks(): ReadonlyMap<Service["id"], Check> {
	return useSyncExternalStore(store.subscribe, () => store.state.latest);
}

export function useCheckingIds(): ReadonlySet<Service["id"]> {
	return useSyncExternalStore(store.subscribe, () => store.state.checking);
}
