import * as SQLite from "expo-sqlite";

import { Check } from "@/features/check/entity";
import { CheckRepository } from "@/features/check/repository";
import { Service } from "@/features/service/entity";
import { ServiceRepository } from "@/features/service/repository";

type Database = SQLite.SQLiteDatabase & {
	repositories: {
		service: ServiceRepository;
		check: CheckRepository;
	};
};

let dbPromise: Promise<Database> | undefined;

const SCHEMA = `
		PRAGMA journal_mode = WAL;
        ${Service.SCHEMA}
        ${Check.SCHEMA}
		CREATE INDEX IF NOT EXISTS checks_service_time ON checks (serviceId, timestamp);
	` as const;

async function initDatabase(): Promise<Database> {
	const db = await SQLite.openDatabaseAsync("uptime.db");
	await db.execAsync(SCHEMA);
	Object.assign(db, {
		repositories: {
			service: new ServiceRepository(db),
			check: new CheckRepository(db),
		},
	});
	return db as Database;
}

export function getDatabase(): Promise<Database> {
	dbPromise ??= initDatabase();
	return dbPromise;
}
