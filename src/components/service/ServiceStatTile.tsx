interface Props {
	label: string;
	value: string;
}

export function ServiceStatTile(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	return (
		<view style={styles.view}>
			<text style={styles.value}>{props.value}</text>
			<text style={styles.label}>{props.label}</text>
		</view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	view: {
		padding: s.spacing(4),
		borderRadius: s.radius.lg,
		borderWidth: 0.5,
		borderColor: s.color.border,
		backgroundColor: s.color.card,
		flex: 1,
		gap: s.spacing(1),
	},
	value: {
		...s.text.base,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
		color: s.color.cardForeground,
	},
	label: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
}));
