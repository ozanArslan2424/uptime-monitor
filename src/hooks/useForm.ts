import { useState, useTransition } from "react";

type ErrorKey<F> = keyof F | "_root";

type FormErrors<F> = Partial<Record<ErrorKey<F>, string>>;

function patchErrors<F>(
	prev: FormErrors<F>,
	key: ErrorKey<F>,
	error: string | null,
): FormErrors<F> {
	const next: FormErrors<F> = { ...prev };
	if (error === null) delete next[key];
	else next[key] = error;
	return next;
}

type Validator<F> = (values: F, raiseError: (key: ErrorKey<F>, error: string) => void) => void;

type OnSubmit<F> = (values: F) => void | Promise<void>;

interface Args<F> {
	defaultValues: F;
	validate?: Validator<F>;
	onSubmit: OnSubmit<F>;
}

function runValidator<F>(validate: Validator<F> | undefined, values: F): FormErrors<F> {
	const errors: FormErrors<F> = {};
	validate?.(values, (key, error) => {
		errors[key] = error;
	});
	return errors;
}

export function useForm<F extends object>(args: Args<F>) {
	const [values, setValues] = useState<F>(args.defaultValues);
	const [errors, setErrors] = useState<FormErrors<F>>({});
	const [isPending, startPending] = useTransition();

	function setValue<K extends keyof F>(key: K, value: F[K]) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	function setError(key: keyof F, error: string | null) {
		setErrors((prev) => patchErrors(prev, key, error));
	}

	function setRootError(error: string | null) {
		setErrors((prev) => patchErrors(prev, "_root", error));
	}

	function submit() {
		startPending(async () => {
			const nextErrors = runValidator(args.validate, values);
			setErrors(nextErrors);
			if (Object.keys(nextErrors).length > 0) return;

			try {
				await args.onSubmit(values);
			} catch (err) {
				setRootError(String(err));
			}
		});
	}

	function reset() {
		setErrors({});
		setValues(args.defaultValues);
	}

	return {
		isPending,
		values,
		errors,
		submit,
		reset,
		setValue,
		setValues,
		setError,
		setErrors,
		setRootError,
	};
}
