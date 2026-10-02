import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

import { CheckResponseTimeGraph } from "@/components/check/CheckResponseTimeGraph";
import { CheckRow } from "@/components/check/CheckRow";
import { ServiceLastCheckCard } from "@/components/service/ServiceLastCheckCard";
import { ServiceStatTile } from "@/components/service/ServiceStatTile";
import { runServiceCheck } from "@/features/check/runServiceCheck";
import { useIsChecking, useLatestCheck } from "@/features/check/store";
import { useAsync } from "@/hooks/useAsync";
import { getDatabase } from "@/lib/db";
import { flex } from "@/lib/flex";
import { isPresent } from "@/lib/maybe";

const RECENT_LIMIT = 50;

export function ServiceDetailView() {
	const params = useLocalSearchParams<{ id: string }>();
	const styles = styleSheet.useWithColorScheme();
	const designSystem = Styles.useDesignSystem();
	const router = useRouter();
	const serviceId = Number(params.id);
	const isChecking = useIsChecking(serviceId);
	const latestCheck = useLatestCheck(serviceId);

	const detail = useAsync(
		async (id: number, _latestTimestamp: number | undefined) => {
			const db = await getDatabase();
			const [service, checks] = await Promise.all([
				db.repositories.service.select(id),
				db.repositories.check.getRecent(id, RECENT_LIMIT),
			]);
			return { service, checks };
		},
		{ args: [serviceId, latestCheck?.timestamp] },
	);

	if (detail.isPending) {
		return (
			<view style={styles.centered}>
				<activity-indicator color={designSystem.color.primary} />
			</view>
		);
	}

	if (detail.error) {
		return (
			<view style={styles.centered}>
				<text style={styles.mutedText}>{detail.error.message}</text>
			</view>
		);
	}

	if (!detail.data.service) {
		return (
			<view style={styles.centered}>
				<text style={styles.mutedText}>Service not found.</text>
			</view>
		);
	}

	const service = detail.data.service;
	const checks = detail.data.checks;
	const lastCheck = checks[0];

	const okCount = checks.filter((check) => check.ok).length;
	const okTimes = checks.flatMap((check) =>
		check.ok && isPresent(check.responseTimeMs) ? [check.responseTimeMs] : [],
	);
	const uptimeText = checks.length > 0 ? `${((okCount / checks.length) * 100).toFixed(1)}%` : "—";
	const avgText =
		okTimes.length > 0
			? `${Math.round(okTimes.reduce((a, b) => a + b, 0) / okTimes.length)} ms`
			: "—";

	function handlePressCheckNow() {
		runServiceCheck(service);
	}

	function confirmDelete() {
		Alert.alert(`Delete ${service.name}?`, "The service and its check history will be removed.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					const db = await getDatabase();
					await db.repositories.service.delete(service.id);
					router.back();
				},
			},
		]);
	}

	return (
		<scroll-view contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
			<Stack.Screen options={{ title: service.name }} />

			<ServiceLastCheckCard lastCheck={lastCheck} service={service} />

			<view style={styles.statsRow}>
				<ServiceStatTile label="Uptime" value={uptimeText} />
				<ServiceStatTile label="Avg response" value={avgText} />
				<ServiceStatTile label="Checks" value={String(checks.length)} />
			</view>

			<CheckResponseTimeGraph checks={checks} />

			<view style={styles.actionsRow}>
				<pressable style={styles.secondaryButton} onPress={confirmDelete}>
					<text style={styles.deleteButtonText}>Delete</text>
				</pressable>

				<pressable
					style={styles.secondaryButton}
					onPress={() =>
						router.push({ pathname: "/service/[id]/edit", params: { id: service.id } })
					}
				>
					<text style={styles.secondaryButtonText}>Edit</text>
				</pressable>

				<pressable
					style={[styles.primaryButton, isChecking && styles.disabled]}
					onPress={handlePressCheckNow}
					disabled={isChecking}
				>
					<text style={styles.primaryButtonText}>{isChecking ? "Checking…" : "Check now"}</text>
				</pressable>
			</view>

			<view style={styles.listCard}>
				<text style={[styles.sectionLabel, styles.listLabel]}>Recent checks</text>
				{checks.length === 0 && (
					<text style={[styles.mutedText, styles.listEmpty]}>No checks yet.</text>
				)}
				{checks.map((check) => (
					<CheckRow key={check.timestamp} check={check} />
				))}
			</view>
		</scroll-view>
	);
}

const button = Styles.defineStyle((s) => ({
	height: 44,
	paddingHorizontal: s.spacing(4),
	alignItems: "center",
	justifyContent: "center",
	borderRadius: s.radius.md,
}));

const styleSheet = Styles.defineSheet((s) => ({
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		padding: s.spacing(4),
		gap: s.spacing(4),
	},
	listCard: {
		borderRadius: s.radius.lg,
		borderWidth: 0.5,
		borderColor: s.color.border,
		backgroundColor: s.color.card,
		paddingHorizontal: 0,
		paddingBottom: 0,
		gap: 0,
	},
	mutedText: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
	statsRow: {
		...flex("flex-row"),
		gap: s.spacing(3),
	},
	sectionLabel: {
		...s.text.xs,
		fontWeight: "600",
		color: s.color.mutedForeground,
	},
	actionsRow: {
		...flex("flex-row"),
		gap: s.spacing(2),
	},
	primaryButton: {
		...button,
		flex: 1,
		backgroundColor: s.color.primary,
	},
	primaryButtonText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.primaryForeground,
	},
	secondaryButton: {
		...button,
		backgroundColor: s.color.secondary,
	},
	secondaryButtonText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.secondaryForeground,
	},
	deleteButtonText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.destructive,
	},
	disabled: {
		opacity: 0.5,
	},
	listLabel: {
		paddingHorizontal: s.spacing(4),
		paddingBottom: s.spacing(2),
	},
	listEmpty: {
		paddingHorizontal: s.spacing(4),
		paddingBottom: s.spacing(4),
	},
}));
