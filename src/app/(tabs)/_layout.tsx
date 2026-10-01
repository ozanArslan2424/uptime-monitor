import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

export default function TabsLayout() {
	const s = Styles.useDesignSystem();

	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: s.color.background },
				headerTintColor: s.color.foreground,
				headerShadowVisible: false,
				sceneStyle: { backgroundColor: s.color.background },
				tabBarStyle: { backgroundColor: s.color.background, borderTopColor: s.color.border },
				tabBarActiveTintColor: s.color.primary,
				tabBarInactiveTintColor: s.color.mutedForeground,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: (icon) => (
						<SymbolView
							name={{ ios: "house", android: "home", web: "home" }}
							tintColor={icon.color}
							size={icon.size}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="new"
				options={{
					title: "New service",
					tabBarLabel: "Create",
					tabBarIcon: (icon) => (
						<SymbolView
							name={{ ios: "plus.circle", android: "add_circle", web: "add_circle" }}
							tintColor={icon.color}
							size={icon.size}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: (icon) => (
						<SymbolView
							name={{ ios: "gearshape", android: "settings", web: "settings" }}
							tintColor={icon.color}
							size={icon.size}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
