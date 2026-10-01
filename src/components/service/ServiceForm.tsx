import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { FLEX_FIX } from "@/design-system";
import { useSettings } from "@/features/settings/store";
import { useForm } from "@/hooks/useForm";

export interface ServiceFormValues {
	name: string;
	url: string;
	method: "GET" | "HEAD";
	expectedStatus: string;
	keyword: string;
	timeoutMs: string;
	enabled: boolean;
}

const EMPTY_VALUES: ServiceFormValues = {
	name: "",
	url: "https://",
	method: "GET",
	expectedStatus: "200",
	keyword: "",
	timeoutMs: "10000",
	enabled: true,
};

const URL_PATTERN = /^https?:\/\/[^\s/?#]+([/?#]\S*)?$/i;

interface Props {
	defaultValues?: ServiceFormValues;
	onSubmit: (values: ServiceFormValues) => Promise<void>;
}

export function ServiceForm(props: Props) {
	const styles = styleSheet.useWithColorScheme();
	const settings = useSettings();

	const form = useForm<ServiceFormValues>({
		defaultValues: props.defaultValues ?? EMPTY_VALUES,
		onSubmit: props.onSubmit,
		validate(values, raiseError) {
			if (values.name.trim() === "") {
				raiseError("name", "Name is required");
			}

			// inside validate, after the URL_PATTERN check:
			if (!settings.allowHttp && values.url.trim().toLowerCase().startsWith("http://")) {
				raiseError("url", "HTTP addresses are disabled in Settings");
			}

			if (!URL_PATTERN.test(values.url.trim())) {
				raiseError("url", `Enter a valid http${settings.allowHttp ? "(s)" : ""} URL`);
			}

			const status = Number(values.expectedStatus);
			if (!Number.isInteger(status) || status < 100 || status > 599) {
				raiseError("expectedStatus", "Must be between 100 and 599");
			}

			const timeout = Number(values.timeoutMs);
			if (!Number.isInteger(timeout) || timeout < 1000) {
				raiseError("timeoutMs", "Must be at least 1000 ms");
			}
		},
	});

	return (
		<KeyboardAwareScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="handled"
			bottomOffset={24}
		>
			<scroll-view contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<view style={styles.field}>
					<text style={styles.label}>Name</text>
					<text-input
						style={[styles.input, form.errors.name && styles.inputError]}
						value={form.values.name}
						onChangeText={(value) => form.setValue("name", value)}
						placeholder="My API"
						placeholderTextColor={styles.placeholder.color}
					/>
					{form.errors.name && <text style={styles.error}>{form.errors.name}</text>}
				</view>

				<view style={styles.field}>
					<text style={styles.label}>URL</text>
					<text-input
						style={[styles.input, form.errors.url && styles.inputError]}
						value={form.values.url}
						onChangeText={(value) => form.setValue("url", value)}
						placeholder="https://example.com/health"
						placeholderTextColor={styles.placeholder.color}
						keyboardType="url"
						autoCapitalize="none"
						autoCorrect={false}
					/>
					{form.errors.url && <text style={styles.error}>{form.errors.url}</text>}
				</view>

				<view style={styles.field}>
					<text style={styles.label}>Method</text>
					<view style={styles.segmented}>
						<pressable
							style={[styles.segment, form.values.method === "GET" && styles.segmentActive]}
							onPress={() => form.setValue("method", "GET")}
						>
							<text
								style={[
									styles.segmentText,
									form.values.method === "GET" && styles.segmentTextActive,
								]}
							>
								GET
							</text>
						</pressable>
						<pressable
							style={[styles.segment, form.values.method === "HEAD" && styles.segmentActive]}
							onPress={() => form.setValue("method", "HEAD")}
						>
							<text
								style={[
									styles.segmentText,
									form.values.method === "HEAD" && styles.segmentTextActive,
								]}
							>
								HEAD
							</text>
						</pressable>
					</view>
				</view>

				<view style={styles.field}>
					<text style={styles.label}>Expected status</text>
					<text-input
						style={[styles.input, form.errors.expectedStatus && styles.inputError]}
						value={form.values.expectedStatus}
						onChangeText={(value) => form.setValue("expectedStatus", value)}
						keyboardType="number-pad"
					/>
					{form.errors.expectedStatus && (
						<text style={styles.error}>{form.errors.expectedStatus}</text>
					)}
				</view>

				<view style={styles.field}>
					<text style={styles.label}>Keyword (optional)</text>
					<text-input
						style={styles.input}
						value={form.values.keyword}
						onChangeText={(value) => form.setValue("keyword", value)}
						placeholder="Text the response must contain"
						placeholderTextColor={styles.placeholder.color}
						autoCapitalize="none"
						autoCorrect={false}
						editable={form.values.method === "GET"}
					/>
				</view>

				<view style={styles.field}>
					<text style={styles.label}>Timeout (ms)</text>
					<text-input
						style={[styles.input, form.errors.timeoutMs && styles.inputError]}
						value={form.values.timeoutMs}
						onChangeText={(value) => form.setValue("timeoutMs", value)}
						keyboardType="number-pad"
					/>
					{form.errors.timeoutMs && <text style={styles.error}>{form.errors.timeoutMs}</text>}
				</view>

				<view style={styles.switchRow}>
					<text style={styles.switchLabel}>Enabled</text>
					<switch
						value={form.values.enabled}
						onValueChange={(value) => form.setValue("enabled", value)}
					/>
				</view>

				{form.errors._root && <text style={styles.error}>{form.errors._root}</text>}

				<pressable
					style={[styles.button, form.isPending && styles.buttonDisabled]}
					onPress={form.submit}
					disabled={form.isPending}
				>
					<text style={styles.buttonText}>{form.isPending ? "Saving…" : "Submit"}</text>
				</pressable>
			</scroll-view>
		</KeyboardAwareScrollView>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	container: {
		flex: 1,
		backgroundColor: s.color.background,
	},
	content: {
		padding: s.spacing(4),
		gap: s.spacing(5),
	},
	field: {
		gap: s.spacing(2),
	},
	label: {
		...s.text.xs,
		fontWeight: "600",
		color: s.color.mutedForeground,
	},
	input: {
		fontSize: s.text.base.fontSize,
		height: 44,
		paddingHorizontal: s.spacing(3),
		paddingVertical: 0,
		borderWidth: 1,
		borderColor: s.color.input,
		borderRadius: s.radius.md,
		backgroundColor: s.color.card,
		color: s.color.foreground,
	},
	inputError: {
		borderColor: s.color.destructive,
	},
	placeholder: {
		color: s.color.mutedForeground,
	},
	error: {
		...s.text.xs,
		color: s.color.destructive,
	},
	segmented: {
		...s.flex("flex-row"),
		...FLEX_FIX,
		gap: s.spacing(2),
	},
	segment: {
		flex: 1,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: s.color.input,
		borderRadius: s.radius.md,
		backgroundColor: s.color.card,
	},
	segmentActive: {
		borderColor: s.color.primary,
		backgroundColor: s.color.accent,
	},
	segmentText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.mutedForeground,
	},
	segmentTextActive: {
		color: s.color.accentForeground,
	},
	switchRow: {
		...s.flex("flex-row", "items-center", "justify-between"),
		...FLEX_FIX,
	},
	switchLabel: {
		...s.text.base,
		color: s.color.foreground,
	},
	button: {
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: s.radius.lg,
		backgroundColor: s.color.primary,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		...s.text.base,
		fontWeight: "600",
		color: s.color.primaryForeground,
	},
}));
