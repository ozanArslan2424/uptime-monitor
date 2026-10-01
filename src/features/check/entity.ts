import { Entity } from "@/lib/Entity";

export class Check extends Entity(
	`CREATE TABLE IF NOT EXISTS checks (
    serviceId INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    ok INTEGER NOT NULL,
    statusCode INTEGER,
    responseTimeMs INTEGER,
    error TEXT
);`,
	{
		ok: {
			parse: (v: number) => v !== 0,
			serialize: (v: boolean) => (v ? 1 : 0),
		},
	},
) {
	timeAgo(now: number): string {
		const seconds = Math.max(0, Math.round((now - this.timestamp) / 1000));
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.round(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.round(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.round(hours / 24)}d ago`;
	}
}
