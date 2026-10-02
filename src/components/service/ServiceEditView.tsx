import { useLocalSearchParams, useRouter } from "expo-router";

import { ServiceForm, ServiceFormValues } from "@/components/service/ServiceForm";
import { Service } from "@/features/service/entity";
import { useAsync } from "@/hooks/useAsync";
import { getDatabase } from "@/lib/db";

export function ServiceEditView() {
	const styles = styleSheet.useWithColorScheme();
	const params = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const serviceId = Number(params.id);
	const service = useAsync(
		async (id: number) => {
			const db = await getDatabase();
			return await db.repositories.service.select(id);
		},
		{ args: [serviceId] },
	);

	if (service.isPending) {
		return (
			<view style={styles.pending}>
				<activity-indicator color={styles.tint.color} />
			</view>
		);
	}

	if (service.error) {
		return <text style={styles.empty}>{service.error.message}</text>;
	}

	if (!service.data) {
		return (
			<view style={styles.notFound}>
				<text style={styles.empty}>This service no longer exists.</text>
				<pressable style={styles.button} onPress={() => router.back()}>
					<text style={styles.buttonText}>Close</text>
				</pressable>
			</view>
		);
	}

	async function handleSubmit(values: ServiceFormValues) {
		const db = await getDatabase();
		await db.repositories.service.update(
			new Service({
				id: serviceId,
				name: values.name.trim(),
				url: values.url,
				method: values.method,
				expectedStatus: Number(values.expectedStatus),
				keyword: values.keyword,
				timeoutMs: Number(values.timeoutMs),
				enabled: values.enabled,
				createdAt: new Date().toISOString(),
			}),
		);
		router.back();
	}

	return (
		<ServiceForm
			defaultValues={{
				name: service.data.name,
				url: service.data.url,
				method: service.data.method,
				expectedStatus: service.data.expectedStatus.toString(),
				keyword: service.data.keyword ?? "",
				timeoutMs: service.data.timeoutMs.toString(),
				enabled: service.data.enabled,
			}}
			onSubmit={handleSubmit}
		/>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	pending: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	tint: {
		color: s.color.primary,
	},
	empty: {
		...s.text.sm,
		color: s.color.mutedForeground,
		textAlign: "center",
		marginTop: s.spacing(8),
	},
	notFound: {
		flex: 1,
		alignItems: "center",
		gap: s.spacing(4),
	},
	button: {
		height: 44,
		paddingHorizontal: s.spacing(6),
		alignItems: "center",
		justifyContent: "center",
		borderRadius: s.radius.md,
		backgroundColor: s.color.secondary,
	},
	buttonText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.secondaryForeground,
	},
}));
