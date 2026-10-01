import { FlatList } from "react-native";

import { ServiceRow } from "@/components/service/ServiceRow";
import { Check } from "@/features/check/entity";
import { runServiceCheck } from "@/features/check/runServiceCheck";
import { useCheckingIds, useLatestChecks } from "@/features/check/store";
import { Service } from "@/features/service/entity";
import { useAsync } from "@/hooks/useAsync";
import { getDatabase } from "@/lib/db";
import { isAbsent, Maybe } from "@/lib/maybe";

function newest(a: Maybe<Check>, b: Maybe<Check>): Maybe<Check> {
	if (isAbsent(a)) return b;
	if (isAbsent(b)) return a;
	return a.timestamp >= b.timestamp ? a : b;
}

export function ServiceList() {
	const styles = styleSheet.useWithColorScheme();
	const checkingIds = useCheckingIds();
	const latestChecks = useLatestChecks();

	const services = useAsync(async () => {
		const db = await getDatabase();
		return await db.repositories.service.getEnabledWithLastCheck();
	});

	async function refresh() {
		await Promise.all((services.data ?? []).map(async (service) => await runServiceCheck(service)));
	}

	async function handleConfirmDelete(service: Service) {
		const db = await getDatabase();
		await db.repositories.service.delete(service.id);
		await services.reload();
	}

	if (services.isPending) {
		return (
			<view style={styles.pending}>
				<activity-indicator color={styles.tint.color} />
			</view>
		);
	}

	if (services.error) {
		return <text style={styles.empty}>{services.error.message}</text>;
	}

	return (
		<FlatList
			data={services.data}
			extraData={[checkingIds, latestChecks]}
			contentInsetAdjustmentBehavior="automatic"
			keyExtractor={(service) => String(service.id)}
			refreshControl={
				<refresh-control refreshing={false} onRefresh={refresh} tintColor={styles.tint.color} />
			}
			ListEmptyComponent={<text style={styles.empty}>No services yet. Tap + to add one.</text>}
			renderItem={(item) => (
				<ServiceRow
					service={item.item}
					lastCheck={newest(latestChecks.get(item.item.id), item.item.lastCheck)}
					isChecking={checkingIds.has(item.item.id)}
					onConfirmDelete={handleConfirmDelete}
				/>
			)}
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
