export class ExternalStore<T> {
	constructor(init: () => T) {
		this.state = init();
	}

	state: T;
	readonly listeners = new Set<() => void>();

	setState(action: T | ((prev: T) => T)) {
		this.state = typeof action === "function" ? (action as (prev: T) => T)(this.state) : action;
		this.notify();
	}

	notify() {
		for (const listener of this.listeners) listener();
	}

	// avoid losing this by using arrow
	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
}
