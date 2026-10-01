import { Check } from "@/features/check/entity";
import { Entity } from "@/lib/Entity";
import { Maybe } from "@/lib/maybe";

export class Service extends Entity(
	`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    method TEXT NOT NULL,
    expectedStatus INTEGER NOT NULL,
    keyword TEXT,
    timeoutMs INTEGER NOT NULL,
    enabled INTEGER NOT NULL,
    createdAt TEXT NOT NULL
);`,
	{
		enabled: {
			parse: (v: number) => v !== 0,
			serialize: (v: boolean) => (v ? 1 : 0),
		},
	},
) {
	declare method: "GET" | "HEAD";
	lastCheck: Maybe<Check>;

	getHost(): string {
		return this.url.replace(/^https?:\/\//, "").split("/")[0];
	}
}
