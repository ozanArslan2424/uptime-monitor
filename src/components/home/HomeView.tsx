import { Stack, useRouter } from "expo-router";

import { ServiceList } from "@/components/service/ServiceList";
import { useIcon } from "@/hooks/useIcon";
import { flex } from "@/lib/flex";

export function HomeView() {
	const styles = styleSheet.useWithColorScheme();
	const router = useRouter();
	const settingsIcon = useIcon({
		ios: "gearshape",
		android: "settings",
		size: 20,
		color: styles.headerAction.color,
	});
	const addIcon = useIcon({
		ios: "plus",
		android: "add",
		size: 20,
		color: styles.headerAction.color,
	});

	return (
		<view style={styles.container}>
			<Stack.Toolbar placement="right">
				{settingsIcon && (
					<Stack.Toolbar.Button
						icon={settingsIcon}
						separateBackground
						onPress={() => router.push("/settings")}
					/>
				)}
				{addIcon && (
					<Stack.Toolbar.Button
						icon={addIcon}
						separateBackground
						onPress={() => router.push("/service/new")}
					/>
				)}
			</Stack.Toolbar>

			<ServiceList />
		</view>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	container: {
		flex: 1,
	},
	headerActions: {
		...flex("flex-row"),
		gap: s.spacing(4),
	},
	headerAction: {
		...s.text.sm,
		color: s.color.primary,
	},
}));
