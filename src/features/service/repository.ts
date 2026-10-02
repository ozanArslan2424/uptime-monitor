import * as SQLite from "expo-sqlite";

import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";

export class ServiceRepository {
	constructor(private readonly db: SQLite.SQLiteDatabase) {}

	async getEnabled(): Promise<Service[]> {
		const rows = await this.db.getAllAsync<typeof Service.ROW>(
			`SELECT * FROM services WHERE enabled = 1`,
		);
		return rows.map((row) => Service.fromRow(row));
	}

	async getEnabledWithLastCheck() {
		const services = await this.getEnabled();

		return Promise.all(
			services.map(async (service) => {
				const row = await this.db.getFirstAsync<typeof Check.ROW>(
					"SELECT * FROM checks WHERE serviceId = ? ORDER BY timestamp DESC LIMIT 1",
					service.id,
				);

				if (row) {
					service.lastCheck = Check.fromRow(row);
				}

				return service;
			}),
		);
	}

	async select(id: Service["id"]): Promise<Service | undefined> {
		const row = await this.db.getFirstAsync<typeof Service.ROW>(
			`SELECT * FROM services WHERE id = ?`,
			id,
		);
		return row ? Service.fromRow(row) : undefined;
	}

	async insert(service: Service) {
		const row = service.toRow();
		await this.db.runAsync(
			`INSERT INTO services (name, url, method, expectedStatus, keyword, timeoutMs, enabled, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			row.name,
			row.url,
			row.method,
			row.expectedStatus,
			row.keyword ?? null,
			row.timeoutMs,
			row.enabled,
			row.createdAt,
		);
	}

	async update(service: Service) {
		const row = service.toRow();
		await this.db.runAsync(
			`UPDATE services SET name = ?, url = ?, method = ?, expectedStatus = ?, keyword = ?, timeoutMs = ?, enabled = ? WHERE id = ?`,
			row.name,
			row.url,
			row.method,
			row.expectedStatus,
			row.keyword ?? null,
			row.timeoutMs,
			row.enabled,
			row.id,
		);
	}

	async delete(id: Service["id"]) {
		await this.db.withTransactionAsync(async () => {
			await this.db.runAsync(`DELETE FROM checks WHERE serviceId = ?`, id);
			await this.db.runAsync(`DELETE FROM services WHERE id = ?`, id);
		});
	}

	async deleteAll() {
		await this.db.withTransactionAsync(async () => {
			await this.db.runAsync(`DELETE FROM checks`);
			await this.db.runAsync(`DELETE FROM services`);
		});
	}
}
