export type Maybe<T> = T | null | undefined;

export type Present<T> = Exclude<T, null | undefined>;

export function isPresent<T>(input: T): input is Present<T> {
	return input !== undefined && input !== null;
}

export type Absent<T> = Extract<T, null | undefined>;

export function isAbsent<T>(input: T): input is Absent<T> {
	return !isPresent(input);
}
