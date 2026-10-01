import { CheckDot } from "@/components/check/CheckDot";
import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";
import { useIntervalNow } from "@/hooks/useIntervalNow";
import { Maybe } from "@/lib/maybe";

interface Props {
	lastCheck: Maybe<Check>;
	service: Service;
}

export function ServiceLastCheckCard(props: Props) {
	const styles = styleSheet.useWithColorScheme();
	const now = useIntervalNow(15_000);

	return (
		<view style={styles.card}>
			<CheckDot withStatusText check={props.lastCheck} />

			<text style={styles.hostText} numberOfLines={1}>
				{props.service.method} {props.service.getHost()}
			</text>
			<text style={styles.mutedText}>
				{props.lastCheck ? `Checked ${props.lastCheck.timeAgo(now)}` : "No checks yet"}
				{!props.service.enabled && " · Paused"}
			</text>
			{props.lastCheck?.ok === false && (
				<text style={styles.errorText}>{props.lastCheck.error}</text>
			)}
		</view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	card: {
		padding: s.spacing(4),
		gap: s.spacing(2),
		borderRadius: s.radius.lg,
		borderWidth: 0.5,
		borderColor: s.color.border,
		backgroundColor: s.color.card,
	},
	hostText: {
		...s.text.sm,
		color: s.color.cardForeground,
	},
	mutedText: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
	errorText: {
		...s.text.xs,
		color: s.color.serviceDown,
	},
}));
