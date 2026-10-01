import * as Notifications from "expo-notifications";

import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";
import { NOTIFICATION_CHANNELS } from "@/lib/constants";

export async function notifyCheckStateChange(service: Service, check: Check): Promise<void> {
	await Notifications.scheduleNotificationAsync({
		content: check.ok
			? { title: `${service.name} is up`, body: service.url }
			: {
					title: `${service.name} is down`,
					body: `${service.url} (${check.error ?? "unknown error"})`,
				},
		trigger: { channelId: NOTIFICATION_CHANNELS.serviceStatus },
	});
}
