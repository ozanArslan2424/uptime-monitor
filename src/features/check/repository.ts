import * as SQLite from "expo-sqlite";

import { Check } from "@/features/check/entity";
import { Service } from "@/features/service/entity";

const MAX_CHECKS_PER_SERVICE = 500;

export class CheckRepository {
	constructor(private readonly db: SQLite.SQLiteDatabase) {}

	/** `undefined` when the service has never been checked. */
	async getLastOk(serviceId: Service["id"]): Promise<boolean | undefined> {
		const row = await this.db.getFirstAsync<{ ok: number }>(
			`SELECT ok FROM checks WHERE serviceId = ? ORDER BY timestamp DESC LIMIT 1`,
			serviceId,
		);
		return row ? row.ok === 1 : undefined;
	}

	async insert(check: Check): Promise<void> {
		const row = check.toRow();
		await this.db.runAsync(
			`INSERT INTO checks (serviceId, timestamp, ok, statusCode, responseTimeMs, error) VALUES (?, ?, ?, ?, ?, ?)`,
			row.serviceId,
			row.timestamp,
			row.ok,
			row.statusCode,
			row.responseTimeMs,
			row.error,
		);
		await this.db.runAsync(
			`DELETE FROM checks WHERE serviceId = ? AND timestamp < (
			SELECT timestamp FROM checks WHERE serviceId = ? ORDER BY timestamp DESC LIMIT 1 OFFSET ?
		)`,
			row.serviceId,
			row.serviceId,
			MAX_CHECKS_PER_SERVICE - 1,
		);
	}

	async getRecent(serviceId: Service["id"], limit: number): Promise<Check[]> {
		const rows = await this.db.getAllAsync<typeof Check.ROW>(
			`SELECT * FROM checks WHERE serviceId = ? ORDER BY timestamp DESC LIMIT ?`,
			serviceId,
			limit,
		);
		return rows.map((row) => Check.fromRow(row));
	}

	async deleteAll() {
		await this.db.runAsync(`DELETE FROM checks`);
	}
}
