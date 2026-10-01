import "@/ignore-warnings";
import "@/design-system";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
	const styles = styleSheet.useWithColorScheme();

	return (
		<GestureHandlerRootView style={styles.GestureHandlerRootView}>
			<KeyboardProvider>
				<Stack
					screenOptions={{
						headerStyle: styles.headerStyle,
						headerTintColor: styles.headerTintColor.color,
						contentStyle: styles.contentStyle,
						headerBackButtonDisplayMode: "minimal",
					}}
				>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="service/[id]/index" options={{ title: "Service" }} />
					<Stack.Screen
						name="service/[id]/edit"
						options={{ title: "Edit service", presentation: "modal" }}
					/>
					<Stack.Screen name="licenses" options={{ title: "Open-source licenses" }} />
				</Stack>
			</KeyboardProvider>
		</GestureHandlerRootView>
	);
}

const styleSheet = Styles.defineSheet((s) => ({
	GestureHandlerRootView: {
		flex: 1,
	},
	headerStyle: {
		backgroundColor: s.color.background,
	},
	headerTintColor: {
		color: s.color.foreground,
	},
	contentStyle: {
		backgroundColor: s.color.background,
	},
}));
