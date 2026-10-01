import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { NOTIFICATION_CHANNELS } from "@/lib/constants";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

/** Creates the Android channel. Must run before requesting permission on Android 13+. */
if (Platform.OS === "android") {
	void Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.serviceStatus, {
		name: "Service status",
		importance: Notifications.AndroidImportance.DEFAULT,
	});
}
