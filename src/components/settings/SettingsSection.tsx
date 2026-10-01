import type { ReactNode } from "react";

interface Props {
	title?: string;
	footer?: string;
	children: ReactNode;
}

export function SettingsSection(props: Props) {
	const styles = styleSheet.useWithColorScheme();

	return (
		<view style={styles.section}>
			{props.title && <text style={styles.title}>{props.title}</text>}
			<view style={styles.card}>{props.children}</view>
			{props.footer && <text style={styles.footer}>{props.footer}</text>}
		</view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	section: {
		gap: s.spacing(2),
	},
	title: {
		...s.text.xs,
		fontWeight: "600",
		color: s.color.mutedForeground,
		paddingHorizontal: s.spacing(4),
	},
	card: {
		borderRadius: s.radius.lg,
		borderWidth: 0.5,
		borderColor: s.color.border,
		backgroundColor: s.color.card,
		overflow: "hidden",
	},
	footer: {
		...s.text.xs,
		color: s.color.mutedForeground,
		paddingHorizontal: s.spacing(4),
	},
}));
