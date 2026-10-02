import { Check } from "@/features/check/entity";
import { flex } from "@/lib/flex";

function formatTimestamp(timestamp: number): string {
	return new Date(timestamp).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface Props {
	check: Check;
}

export function CheckRow(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	return (
		<view style={styles.checkRow}>
			<view style={styles.checkHeader}>
				<view style={props.check.ok ? styles.dotUp : styles.dotDown} />
				<text style={styles.checkTime}>{formatTimestamp(props.check.timestamp)}</text>
				{props.check.ok && (
					<text style={styles.checkValue}>
						{props.check.statusCode} · {props.check.responseTimeMs} ms
					</text>
				)}
			</view>
			{!props.check.ok && <text style={styles.checkError}>{props.check.error}</text>}
		</view>
	);
}

const dot = Styles.defineStyle({
	width: 10,
	height: 10,
	borderRadius: 5,
});

const styleSheet = Styles.defineSheet((s) => ({
	dotUp: {
		...dot,
		backgroundColor: s.color.serviceUp,
	},
	dotDown: {
		...dot,
		backgroundColor: s.color.serviceDown,
	},
	dotUnknown: {
		...dot,
		backgroundColor: s.color.mutedForeground,
	},
	checkRow: {
		gap: s.spacing(1),
		paddingHorizontal: s.spacing(4),
		paddingVertical: s.spacing(3),
		borderTopWidth: 0.5,
		borderTopColor: s.color.border,
	},
	checkHeader: {
		...flex("flex-row", "items-center"),
		gap: s.spacing(3),
	},
	checkError: {
		...s.text.xs,
		color: s.color.serviceDown,
		paddingLeft: 10 + s.spacing(3),
	},
	checkTime: {
		...s.text.xs,
		fontVariant: ["tabular-nums"],
		color: s.color.mutedForeground,
		flex: 1,
	},
	checkValue: {
		...s.text.xs,
		fontVariant: ["tabular-nums"],
		color: s.color.cardForeground,
	},
}));
