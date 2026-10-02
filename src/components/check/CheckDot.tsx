import { Check } from "@/features/check/entity";
import { flex } from "@/lib/flex";
import { isAbsent, Maybe } from "@/lib/maybe";

interface Props {
	check: Maybe<Check>;
	withStatusText?: boolean;
}

export function CheckDot(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	const dotStyle = (() => {
		if (isAbsent(props.check)) {
			return styles.dotUnknown;
		}
		if (props.check.ok) {
			return styles.dotUp;
		}
		return styles.dotDown;
	})();

	if (props.withStatusText) {
		const statusText = (() => {
			if (isAbsent(props.check)) {
				return "Not Checked";
			}
			if (props.check.ok) {
				return "Up";
			}
			return "Down";
		})();

		const statusTextStyle = (() => {
			if (isAbsent(props.check)) {
				return styles.statusUnknown;
			}
			if (props.check.ok) {
				return styles.statusUp;
			}
			return styles.statusDown;
		})();

		return (
			<view style={styles.statusRow}>
				<view style={dotStyle} />
				<text style={statusTextStyle}>{statusText}</text>
			</view>
		);
	}

	return <view style={dotStyle} />;
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
	statusRow: {
		...flex("flex-row", "items-center"),
		gap: s.spacing(2),
	},
	statusUp: {
		...s.text.lg,
		fontWeight: "700",
		color: s.color.serviceUp,
	},
	statusDown: {
		...s.text.lg,
		fontWeight: "700",
		color: s.color.serviceDown,
	},
	statusUnknown: {
		...s.text.lg,
		fontWeight: "700",
		color: s.color.mutedForeground,
	},
}));
