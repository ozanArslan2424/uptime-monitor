import * as Notifications from "expo-notifications";

/** Asks for permission if it hasn't been decided yet. Returns whether notifications are allowed. */

export async function ensureNotificationPermission(): Promise<boolean> {
	const current = await Notifications.getPermissionsAsync();
	if (current.granted) return true;
	if (!current.canAskAgain) return false;

	const result = await Notifications.requestPermissionsAsync();
	return result.granted;
}
