import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { tryCatch } from "@/lib/tryCatch";

type AsyncState<T> =
	| { isPending: true; data: undefined; error: undefined }
	| { isPending: false; data: T; error: undefined }
	| { isPending: false; data: undefined; error: Error };

const pending = () => ({ isPending: true, data: undefined, error: undefined }) as const;
const success = <T>(data: T) => ({ isPending: false, data, error: undefined }) as const;
const failure = (error: Error) => ({ isPending: false, data: undefined, error }) as const;

type Options<A extends unknown[]> = {
	reloadOnFocus?: boolean;
} & ([] extends A ? { args?: A } : { args: A });

const DEFAULT_OPTIONS = {
	args: [] as unknown[],
	reloadOnFocus: true,
};

export function useAsync<A extends unknown[], T>(
	fn: (...args: A) => Promise<T>,
	...rest: [] extends A ? [options?: Options<A>] : [options: Options<A>]
) {
	const options = { ...DEFAULT_OPTIONS, ...rest[0] } as Required<Options<A>>;
	const args = options.args as A;

	const fnRef = useRef(fn);
	const requestId = useRef(0);
	const [state, setState] = useState<AsyncState<T>>(pending());

	// Recreated when any arg changes; stale responses are dropped via requestId.
	const reload = useCallback(async () => {
		const id = ++requestId.current;
		setState((prev) => (prev.data ? success(prev.data) : pending()));

		const [data, error] = await tryCatch(() => fnRef.current(...args));
		if (id !== requestId.current) {
			return;
		}

		if (error) {
			if (__DEV__) {
				console.error(error);
			}
			setState(failure(error));
			return;
		}

		setState(success(data));
		// oxlint-disable-next-line react/use-memo react-hooks/exhaustive-deps
	}, args);

	// Runs after every render, before other effects, so reload always calls the latest fn.
	useLayoutEffect(() => {
		fnRef.current = fn;
	});

	// Without reloadOnFocus: loads on mount and again whenever args change.
	useEffect(() => {
		if (__DEV__) {
			console.log("[useAsync] useEffect", options.reloadOnFocus);
		}
		if (!options.reloadOnFocus) {
			reload();
		}
	}, [reload, options.reloadOnFocus]);

	// With reloadOnFocus: loads on first focus, every refocus, and on args change while focused.
	useFocusEffect(
		useCallback(() => {
			if (__DEV__) {
				console.log("[useAsync] useFocusEffect", options.reloadOnFocus);
			}
			if (options.reloadOnFocus) {
				reload();
			}
		}, [reload, options.reloadOnFocus]),
	);

	return { ...state, reload };
}
