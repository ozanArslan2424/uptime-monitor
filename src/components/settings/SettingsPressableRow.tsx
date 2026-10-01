import { SymbolView } from "expo-symbols";

import { FLEX_FIX } from "@/design-system";

interface Props {
	label: string;
	value?: string;
	destructive?: boolean;
	onPress?: () => void;
}

export function SettingsPressableRow(props: Props) {
	const styles = styleSheet.useWithColorScheme();
	const s = Styles.useDesignSystem();

	return (
		<pressable style={styles.row} onPress={props.onPress} disabled={!props.onPress}>
			<text style={props.destructive ? styles.destructiveLabel : styles.label}>{props.label}</text>
			<view style={styles.trailing}>
				{props.value && <text style={styles.value}>{props.value}</text>}
				{props.onPress && !props.destructive && (
					<SymbolView
						name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
						tintColor={s.color.mutedForeground}
						size={14}
					/>
				)}
			</view>
		</pressable>
	);
}

const label = Styles.defineStyle((s) => ({
	...s.text.base,
	flexShrink: 1,
}));

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
		...label,
		color: s.color.cardForeground,
	},
	destructiveLabel: {
		...label,
		color: s.color.destructive,
	},
	trailing: {
		...s.flex("flex-row", "items-center"),
		...FLEX_FIX,
		gap: s.spacing(2),
	},
	value: {
		...s.text.sm,
		fontVariant: ["tabular-nums"],
		color: s.color.mutedForeground,
	},
}));
