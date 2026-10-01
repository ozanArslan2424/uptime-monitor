export type Result<T, E = Error> = [T, null] | [null, E];

export function toError(err: unknown): Error {
	return err instanceof Error ? err : new Error(String(err));
}

export async function tryCatch<T>(fn: () => T | Promise<T>): Promise<Result<T>> {
	try {
		return [await fn(), null];
	} catch (err) {
		return [null, toError(err)];
	}
}
