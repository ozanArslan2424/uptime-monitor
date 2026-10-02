import { Link, useRouter } from "expo-router";
import { Alert } from "react-native";
import ReanimatedSwipeable, {
	SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { CheckDot } from "@/components/check/CheckDot";
import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";
import { useIntervalNow } from "@/hooks/useIntervalNow";
import { flex } from "@/lib/flex";
import { Maybe } from "@/lib/maybe";

interface Props {
	service: Service;
	lastCheck: Maybe<Check>;
	isChecking: boolean;
	onConfirmDelete: (service: Service) => void;
}

export function ServiceRow(props: Props) {
	const styles = styleSheet.useWithColorScheme();
	const router = useRouter();
	const now = useIntervalNow(15_000);

	const check = props.lastCheck;
	const timeAgoText = props.isChecking ? "Checking…" : check ? check.timeAgo(now) : "Not checked";
	const responseTimeMsText = check?.ok ? `${check.responseTimeMs} ms` : "";

	function handlePressDelete(swipeable: SwipeableMethods) {
		swipeable.close();

		Alert.alert(
			`Delete service for ${props.service.name}?`,
			`Service and its check history will be removed.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						props.onConfirmDelete(props.service);
					},
				},
			],
		);
	}

	function handlePressEdit(swipeable: SwipeableMethods) {
		swipeable.close();
		router.push({ pathname: "/service/[id]/edit", params: { id: props.service.id } });
	}

	return (
		<ReanimatedSwipeable
			friction={2}
			leftThreshold={40}
			rightThreshold={40}
			overshootLeft={false}
			overshootRight={false}
			renderLeftActions={(_progress, _translation, swipeable) => (
				<pressable style={styles.editActionPressable} onPress={() => handlePressEdit(swipeable)}>
					<text style={styles.editActionText}>Edit</text>
				</pressable>
			)}
			renderRightActions={(_progress, _translation, swipeable) => (
				<pressable
					style={styles.deleteActionPressable}
					onPress={() => handlePressDelete(swipeable)}
				>
					<text style={styles.deleteActionText}>Delete</text>
				</pressable>
			)}
		>
			<Link href={{ pathname: "/service/[id]", params: { id: props.service.id } }} asChild>
				<pressable style={styles.card}>
					{props.isChecking ? <activity-indicator size="small" /> : <CheckDot check={check} />}

					<view style={styles.infoView}>
						<text style={styles.nameText} numberOfLines={1}>
							{props.service.name}
						</text>

						<text style={styles.hostText} numberOfLines={1}>
							{props.service.getHost()}
						</text>
					</view>

					<view style={styles.metaView}>
						{responseTimeMsText !== "" && (
							<text style={styles.responseTimeMsTest}>{responseTimeMsText}</text>
						)}

						{check?.ok === false && (
							<text style={styles.errorText} numberOfLines={1}>
								{check.error}
							</text>
						)}
						<text style={styles.timeAgoText}>{timeAgoText}</text>
					</view>
				</pressable>
			</Link>
		</ReanimatedSwipeable>
	);
}

const action = Styles.defineStyle({
	width: 80,
	alignItems: "center",
	justifyContent: "center",
});

const styleSheet = Styles.defineSheet((s) => ({
	card: {
		...flex("flex-row", "items-center"),
		gap: s.spacing(3),
		padding: s.spacing(4),
		borderBottomWidth: 0.5,
		borderBottomColor: s.color.border,
		backgroundColor: s.color.card,
	},
	editActionPressable: {
		...action,
		backgroundColor: s.color.secondary,
	},
	editActionText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.secondaryForeground,
	},
	deleteActionPressable: {
		...action,
		backgroundColor: s.color.destructive,
	},
	deleteActionText: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.destructiveForeground,
	},
	infoView: {
		flex: 1,
		gap: s.spacing(1),
	},
	nameText: {
		...s.text.base,
		fontWeight: "600",
		color: s.color.cardForeground,
	},
	hostText: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
	metaView: {
		alignItems: "flex-end",
		gap: s.spacing(1),
		maxWidth: "45%",
	},
	responseTimeMsTest: {
		...s.text.sm,
		fontVariant: ["tabular-nums"],
		color: s.color.cardForeground,
	},
	errorText: {
		...s.text.xs,
		color: s.color.serviceDown,
	},
	timeAgoText: {
		...s.text.xs,
		fontVariant: ["tabular-nums"],
		color: s.color.mutedForeground,
	},
}));
