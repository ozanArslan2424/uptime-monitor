import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";
import { tryCatch } from "@/lib/tryCatch";

function describeError(err: Error, aborted: boolean, service: Service): string {
	if (aborted) return `Timed out after ${service.timeoutMs / 1000}s`;

	const message = err.message;
	if (/cleartext/i.test(message)) return "Plain HTTP is blocked by this device";
	if (
		/unknownhost|unable to resolve|could not be found|enotfound|no address associated/i.test(
			message,
		)
	) {
		return "Host not found";
	}
	if (/econnrefused|connection refused|failed to connect/i.test(message))
		return "Connection refused";
	if (/ssl|tls|certificate|handshake|trust anchor/i.test(message)) return "TLS/certificate error";
	if (/network request failed/i.test(message)) return "Network error: offline or host unreachable";
	return message;
}

/** Performs the HTTP request for a service and describes the result as a Check. */
export async function checkService(service: Service): Promise<Check> {
	const check = new Check({
		serviceId: service.id,
		timestamp: Date.now(),
		ok: false,
	});

	const controller = new AbortController();

	const timeout = setTimeout(() => {
		controller.abort();
	}, service.timeoutMs);

	try {
		const [res, err] = await tryCatch(() =>
			fetch(service.url, {
				method: service.method,
				signal: controller.signal,
			}),
		);

		if (err) {
			check.error = describeError(err, controller.signal.aborted, service);
			return check;
		}

		check.responseTimeMs = Date.now() - check.timestamp;
		check.statusCode = res.status;

		if (res.status !== service.expectedStatus) {
			check.error = `Status: ${res.status} ${res.statusText}`;
			return check;
		}

		if (service.keyword && service.method !== "HEAD") {
			const [body, bodyErr] = await tryCatch(() => res.text());

			if (bodyErr) {
				check.error = describeError(bodyErr, controller.signal.aborted, service);
				return check;
			}

			if (!body.includes(service.keyword)) {
				check.error = `Response doesn't contain "${service.keyword}"`;
				return check;
			}
		}

		check.ok = true;
		return check;
	} finally {
		clearTimeout(timeout);
	}
}
