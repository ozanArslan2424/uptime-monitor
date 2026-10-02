import { Check } from "@/features/check/entity";
import { flex } from "@/lib/flex";
import { isPresent } from "@/lib/maybe";

const SPARKLINE_LIMIT = 30;

interface Props {
	checks: Check[];
}

export function CheckResponseTimeGraph(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	const sparkline = props.checks.slice(0, SPARKLINE_LIMIT).reverse();
	const sparklineMax = Math.max(
		1,
		...sparkline.flatMap((check) =>
			check.ok && isPresent(check.responseTimeMs) ? [check.responseTimeMs] : [],
		),
	);

	if (sparkline.length <= 0) {
		return null;
	}

	return (
		<view style={styles.card}>
			<text style={styles.sectionLabel}>Response time</text>
			<view style={styles.sparkline}>
				{sparkline.map((check) => (
					<view
						key={check.timestamp}
						style={[
							check.ok ? styles.barUp : styles.barDown,
							{
								height: check.ok
									? `${Math.max(8, Math.round(((check.responseTimeMs ?? 0) / sparklineMax) * 100))}%`
									: "100%",
							},
						]}
					/>
				))}
			</view>
			<text style={styles.mutedText}>
				Last {sparkline.length} checks · peak {sparklineMax} ms
			</text>
		</view>
	);
}

const bar = Styles.defineStyle({
	flex: 1,
	borderRadius: 2,
});

const styleSheet = Styles.defineSheet((s) => ({
	card: {
		padding: s.spacing(4),
		gap: s.spacing(2),
		borderRadius: s.radius.lg,
		borderWidth: 0.5,
		borderColor: s.color.border,
		backgroundColor: s.color.card,
	},
	mutedText: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
	sectionLabel: {
		...s.text.xs,
		fontWeight: "600",
		color: s.color.mutedForeground,
	},
	sparkline: {
		...flex("flex-row", "items-end"),
		height: 64,
		gap: 2,
	},
	barUp: {
		...bar,
		backgroundColor: s.color.primary,
	},
	barDown: {
		...bar,
		backgroundColor: s.color.serviceDown,
	},
}));
