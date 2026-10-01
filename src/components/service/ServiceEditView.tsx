import { useLocalSearchParams, useRouter } from "expo-router";

import { ServiceForm, ServiceFormValues } from "@/components/service/ServiceForm";
import { Service } from "@/features/service/entity";
import { useAsync } from "@/hooks/useAsync";
import { getDatabase } from "@/lib/db";

export function ServiceEditView() {
	const styles = styleSheet.useWithColorScheme();
	const params = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const service = useAsync(
		async (id: number) => {
			const db = await getDatabase();
			const service = await db.repositories.service.select(id);
			// TODO: do something on not found
			if (!service) throw "TODO";
			return service;
		},
		{ args: [Number(params.id)] },
	);

	async function handleSubmit(values: ServiceFormValues) {
		const db = await getDatabase();
		await db.repositories.service.update(
			new Service({
				id: Number(params.id),
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
}));
