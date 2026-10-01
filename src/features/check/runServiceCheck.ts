import { checkService } from "@/features/check/api";
import { Check } from "@/features/check/entity";
import { notifyCheckStateChange } from "@/features/check/notifications";
import { isChecking, startChecking, setLatestCheck, finishChecking } from "@/features/check/store";
import { Service } from "@/features/service/entity";
import { getSettings } from "@/features/settings/store";
import { getDatabase } from "@/lib/db";

function isBlockedHttp(service: Service): boolean {
	return !getSettings().allowHttp && service.url.trim().toLowerCase().startsWith("http://");
}

/** Runs, saves and publishes a check. Returns undefined if this service is already being checked. */
export async function runServiceCheck(service: Service): Promise<Check | undefined> {
	if (isChecking(service.id)) return undefined;

	startChecking(service.id);

	try {
		const db = await getDatabase();
		const previousOk = await db.repositories.check.getLastOk(service.id);

		const check = isBlockedHttp(service)
			? new Check({
					serviceId: service.id,
					timestamp: Date.now(),
					ok: false,
					error: "HTTP addresses are disabled in Settings",
				})
			: await checkService(service);

		await db.repositories.check.insert(check);
		setLatestCheck(check);

		if (previousOk !== undefined && previousOk !== check.ok) {
			await notifyCheckStateChange(service, check);
		}

		return check;
	} finally {
		finishChecking(service.id);
	}
}
