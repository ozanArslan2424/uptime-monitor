type Trim<S extends string> = S extends
	| ` ${infer R}`
	| `\n${infer R}`
	| `\t${infer R}`
	| `\r${infer R}`
	? Trim<R>
	: S extends `${infer R} ` | `${infer R}\n` | `${infer R}\t` | `${infer R}\r`
		? Trim<R>
		: S;

type SqlToTs<T extends string> =
	Uppercase<T> extends `${"INTEGER" | "INT" | "REAL" | "FLOAT" | "DOUBLE" | "NUMERIC"}${string}`
		? number
		: Uppercase<T> extends `TEXT${string}`
			? string
			: Uppercase<T> extends `BLOB${string}`
				? Uint8Array
				: unknown;

// Walk chars tracking depth; stop at the ")" that closes the opening "(".
type BodyInner<
	S extends string,
	Depth extends unknown[] = [],
	Acc extends string = "",
> = S extends `${infer C}${infer R}`
	? C extends "("
		? BodyInner<R, [...Depth, unknown], `${Acc}${C}`>
		: C extends ")"
			? Depth extends [unknown, ...infer D]
				? BodyInner<R, D, `${Acc}${C}`>
				: Acc
			: BodyInner<R, Depth, `${Acc}${C}`>
	: Acc;

type Body<S extends string> = S extends `${string}(${infer R}` ? BodyInner<R> : never;

// Split on commas at depth 0 only.
type SplitCols<
	S extends string,
	Depth extends unknown[] = [],
	Cur extends string = "",
	Out extends string[] = [],
> = S extends `${infer C}${infer R}`
	? C extends "("
		? SplitCols<R, [...Depth, unknown], `${Cur}${C}`, Out>
		: C extends ")"
			? Depth extends [unknown, ...infer D]
				? SplitCols<R, D, `${Cur}${C}`, Out>
				: SplitCols<R, Depth, `${Cur}${C}`, Out>
			: C extends ","
				? Depth extends []
					? SplitCols<R, Depth, "", [...Out, Trim<Cur>]>
					: SplitCols<R, Depth, `${Cur}${C}`, Out>
				: SplitCols<R, Depth, `${Cur}${C}`, Out>
	: Trim<Cur> extends ""
		? Out
		: [...Out, Trim<Cur>];

type IsNotNull<C extends string> = Uppercase<C> extends `${string}NOT NULL${string}` ? true : false;

type IsPrimaryKey<C extends string> =
	Uppercase<C> extends `${string}PRIMARY KEY${string}` ? true : false;

type IsWithDefault<C extends string> =
	Uppercase<C> extends `${string}DEFAULT${string}` ? true : false;

type ParseCol<C extends string> =
	Trim<C> extends `${infer Name} ${infer Rest}`
		? {
				name: Name;
				type: SqlToTs<Trim<Rest>>;
				nullable: IsNotNull<Rest> extends true
					? false
					: IsPrimaryKey<Rest> extends true
						? false
						: true;
				optional: IsPrimaryKey<Rest> extends true
					? true
					: IsWithDefault<Rest> extends true
						? true
						: IsNotNull<Rest> extends true
							? false
							: true;
			}
		: never;

type Cols<S extends string> =
	SplitCols<Body<S>> extends infer L extends string[] ? { [K in keyof L]: ParseCol<L[K]> } : never;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type Resolver<From, To> = {
	parse: (value: From) => To;
	serialize: (value: To) => From;
};

type ColumnNames<S extends string> = Cols<S>[number]["name"];

type Resolvers<S extends string> = Partial<Record<ColumnNames<S>, Resolver<any, any>>>;

type ResolvedType<
	C extends { name: string; type: unknown },
	R extends Partial<Record<string, Resolver<any, any>>>,
> = C["name"] extends keyof R
	? R[C["name"]] extends Resolver<any, infer To>
		? To
		: C["type"]
	: C["type"];

// raw row shape — ignores resolvers entirely
type Row<S extends string> = Expand<{
	[C in Cols<S>[number] as C["name"]]: C["nullable"] extends true ? C["type"] | null : C["type"];
}>;

// resolved shape — used for the constructed instance
type Parsed<S extends string, R extends Resolvers<S> = {}> = Expand<{
	[C in Cols<S>[number] as C["name"]]: C["nullable"] extends true
		? ResolvedType<C, R> | null
		: ResolvedType<C, R>;
}>;

type ConstructorValues<S extends string, R extends Resolvers<S> = {}> = Expand<
	{
		[
			C in Cols<S>[number] as C["optional"] extends false ? C["name"] : never
		]: C["nullable"] extends true ? ResolvedType<C, R> | null : ResolvedType<C, R>;
	} & {
		[
			C in Cols<S>[number] as C["optional"] extends true ? C["name"] : never
		]?: C["nullable"] extends true ? ResolvedType<C, R> | null : ResolvedType<C, R>;
	}
>;

function splitTopLevel(s: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = "";
	for (const ch of s) {
		if (ch === "(") {
			depth++;
		}
		if (ch === ")") {
			depth--;
		}
		if (ch === "," && depth === 0) {
			out.push(cur);
			cur = "";
		} else {
			cur += ch;
		}
	}
	if (cur.trim()) {
		out.push(cur);
	}
	return out;
}

function parseDefault(raw: string, sqlType: string): unknown {
	const t = raw.trim();
	if (/^(INTEGER|INT|REAL|FLOAT|DOUBLE|NUMERIC)/i.test(sqlType)) {
		const n = Number(t);
		return Number.isNaN(n) ? t : n;
	}
	if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
		return t.slice(1, -1);
	}
	return t;
}

function parseColumns(schema: string) {
	const body = schema.slice(schema.indexOf("(") + 1, schema.lastIndexOf(")"));
	const cols: {
		name: string;
		notNull: boolean;
		primaryKey: boolean;
		hasDefault: boolean;
		defaultValue: unknown;
	}[] = [];

	for (const raw of splitTopLevel(body)) {
		const line = raw.trim();
		if (!line) {
			continue;
		}
		if (/^(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line)) {
			continue;
		} // table-level constraint
		const match = line.match(/^(\S+)\s+(\S+)/);
		if (!match) {
			continue;
		}
		const [, name, sqlType] = match as [string, string, string];
		const notNull = /NOT\s+NULL/i.test(line);
		const primaryKey = /PRIMARY\s+KEY/i.test(line);
		const defaultMatch = line.match(/DEFAULT\s+(\(.*\)|'[^']*'|"[^"]*"|\S+)/i) as [string, string];
		cols.push({
			name,
			notNull,
			primaryKey,
			hasDefault: !!defaultMatch,
			defaultValue: defaultMatch ? parseDefault(defaultMatch[1], sqlType) : undefined,
		});
	}
	return cols;
}

export type Entity<S extends string = string> = {
	readonly ROW: Row<S>;
	readonly SCHEMA: S;
	fromRow<T extends abstract new (...args: any) => any>(this: T, row: Row<S>): InstanceType<T>;
};

export function Entity<S extends string, R extends Resolvers<S> = {}>(schema: S, resolvers?: R) {
	const columns = parseColumns(schema);

	class Base {
		static readonly ROW: Row<S> = undefined as unknown as Row<S>; // type-only slot, never read at runtime
		static readonly SCHEMA: S = schema;

		static fromRow(row: Row<S>) {
			const values: Record<string, unknown> = {};
			for (const col of columns) {
				const raw = (row as Record<string, unknown>)[col.name];
				const resolver = resolvers?.[col.name as keyof R];
				values[col.name] = raw == null || !resolver ? raw : resolver.parse(raw);
			}
			return new this(values as ConstructorValues<S, R>);
		}

		toRow(): Row<S> {
			const row: Record<string, unknown> = {};
			for (const col of columns) {
				const value = (this as Record<string, unknown>)[col.name];
				const resolver = resolvers?.[col.name as keyof R];
				row[col.name] = value == null || !resolver ? value : resolver.serialize(value);
			}
			return row as Row<S>;
		}

		constructor(values: ConstructorValues<S, R>) {
			for (const col of columns) {
				let value = (values as Record<string, unknown>)[col.name];
				if (value === undefined) {
					if (col.hasDefault) {
						const resolver = resolvers?.[col.name as keyof R];
						value = resolver ? resolver.parse(col.defaultValue) : col.defaultValue;
					} else {
						value = col.notNull || col.primaryKey ? undefined : null;
					}
				}
				(this as Record<string, unknown>)[col.name] = value;
			}
		}
	}

	return Base as unknown as Entity<S> & {
		new (input: ConstructorValues<S, R>): Parsed<S, R> & { toRow(): Row<S> };
	};
}
