import { useRouter } from "expo-router";
import { useState } from "react";

import { ServiceFormValues, ServiceForm } from "@/components/service/ServiceForm";
import { Service } from "@/features/service/entity";
import { getDatabase } from "@/lib/db";

export function ServiceCreateView() {
	const router = useRouter();
	const [formKey, setFormKey] = useState(0);

	async function handleSubmit(values: ServiceFormValues) {
		const db = await getDatabase();
		await db.repositories.service.insert(
			new Service({
				name: values.name.trim(),
				url: values.url,
				method: values.method,
				expectedStatus: Number(values.expectedStatus),
				keyword: values.keyword,
				timeoutMs: Number(values.timeoutMs),
				enabled: values.enabled,
				createdAt: new Date().toISOString(),
			}),
		);

		setFormKey((key) => key + 1);
		router.navigate("/");
	}

	return <ServiceForm key={formKey} onSubmit={handleSubmit} />;
}
