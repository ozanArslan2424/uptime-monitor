import { SymbolView } from "expo-symbols";
import { useState } from "react";

import { License } from "@/lib/constants";
import { flex } from "@/lib/flex";

interface Props {
	license: License;
}

export function LicenseRow(props: Props) {
	const styles = styleSheet.useWithColorScheme();
	const s = Styles.useDesignSystem();
	const [expanded, setExpanded] = useState(false);

	return (
		<pressable style={styles.row} onPress={() => setExpanded((value) => !value)}>
			<view style={styles.header}>
				<view style={styles.info}>
					<text style={styles.name} numberOfLines={1}>
						{props.license.name}
					</text>
					<text style={styles.meta}>
						{props.license.version} · {props.license.license}
					</text>
				</view>
				<SymbolView
					name={
						expanded
							? { ios: "chevron.up", android: "expand_less", web: "expand_less" }
							: { ios: "chevron.down", android: "expand_more", web: "expand_more" }
					}
					tintColor={s.color.mutedForeground}
					size={14}
				/>
			</view>

			{expanded && (
				<view style={styles.body}>
					{props.license.repository && (
						<text style={styles.repository}>{props.license.repository}</text>
					)}
					<text style={styles.text} selectable>
						{props.license.text ??
							`Licensed under ${props.license.license}. No license file was included in the package.`}
					</text>
				</view>
			)}
		</pressable>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	row: {
		paddingHorizontal: s.spacing(4),
		paddingVertical: s.spacing(3),
		borderBottomWidth: 0.5,
		borderBottomColor: s.color.border,
		backgroundColor: s.color.card,
	},
	header: {
		...flex("flex-row", "items-center"),
		gap: s.spacing(3),
	},
	info: {
		flex: 1,
		gap: s.spacing(1),
	},
	name: {
		...s.text.sm,
		fontWeight: "600",
		color: s.color.cardForeground,
	},
	meta: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
	body: {
		gap: s.spacing(2),
		paddingTop: s.spacing(3),
	},
	repository: {
		...s.text.xs,
		color: s.color.primary,
	},
	text: {
		...s.text.xs,
		color: s.color.mutedForeground,
	},
}));
