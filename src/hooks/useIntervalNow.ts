import { useSyncExternalStore } from "react";

let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
const snapshot = () => now;

function subscribe(intervalMs: number, listener: () => void) {
	listeners.add(listener);

	if (!timer) {
		now = Date.now();
		timer = setInterval(() => {
			now = Date.now();
			for (const notify of listeners) {
				notify();
			}
		}, intervalMs);
	}

	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) {
			clearInterval(timer);
			timer = undefined;
		}
	};
}

export function useIntervalNow(intervalMs: number): number {
	return useSyncExternalStore((listener) => subscribe(intervalMs, listener), snapshot);
}
