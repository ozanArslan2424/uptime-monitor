import { FLEX_FIX } from "@/design-system";

interface Props {
	label: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
}

export function SettingsSwitchRow(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	return (
		<view style={styles.row}>
			<text style={styles.label}>{props.label}</text>
			<switch value={props.value} onValueChange={props.onValueChange} />
		</view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	row: {
		...s.flex("flex-row", "items-center", "justify-between"),
		...FLEX_FIX,
		gap: s.spacing(3),
		minHeight: 48,
		paddingHorizontal: s.spacing(4),
		paddingVertical: s.spacing(2),
		borderBottomWidth: 0.5,
		borderBottomColor: s.color.border,
	},
	label: {
		...s.text.base,
		color: s.color.cardForeground,
		flexShrink: 1,
	},
}));
