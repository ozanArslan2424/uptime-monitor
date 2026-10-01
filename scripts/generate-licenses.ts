import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	realpathSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

interface PackageJson {
	name: string;
	version: string;
	license?: string | { type: string };
	repository?: string | { url: string };
	dependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
}

interface License {
	name: string;
	version: string;
	license: string;
	repository?: string;
	text?: string;
}

const ROOT = process.cwd();
const OUTPUT = join(ROOT, "src/generated/licenses.json");

// Walks up node_modules like Node's resolver; realpath follows pnpm/bun symlinks.
function findPackageDir(name: string, fromDir: string): string | undefined {
	let dir = fromDir;
	while (true) {
		const candidate = join(dir, "node_modules", name, "package.json");
		if (existsSync(candidate)) return dirname(realpathSync(candidate));
		const parent = dirname(dir);
		if (parent === dir) return undefined;
		dir = parent;
	}
}

function readJson(path: string): PackageJson {
	return JSON.parse(readFileSync(path, "utf8"));
}

function readLicenseText(dir: string): string | undefined {
	const file = readdirSync(dir).find((name) => /^(licen[cs]e|copying)(\.|$)/i.test(name));
	return file ? readFileSync(join(dir, file), "utf8").trim() : undefined;
}

function getLicenseType(pkg: PackageJson): string {
	if (typeof pkg.license === "string") return pkg.license;
	if (pkg.license?.type) return pkg.license.type;
	return "Unknown";
}

function getRepository(pkg: PackageJson): string | undefined {
	const url = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
	return url?.replace(/^git\+/, "").replace(/\.git$/, "");
}

const seen = new Map<string, License>();

function visit(name: string, fromDir: string) {
	const dir = findPackageDir(name, fromDir);
	if (!dir) return; // optional dependency not installed on this platform

	const pkg = readJson(join(dir, "package.json"));
	const key = `${pkg.name}@${pkg.version}`;
	if (seen.has(key)) return;

	seen.set(key, {
		name: pkg.name,
		version: pkg.version,
		license: getLicenseType(pkg),
		repository: getRepository(pkg),
		text: readLicenseText(dir),
	});

	for (const dependency of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) {
		visit(dependency, dir);
	}
}

const rootPkg = readJson(join(ROOT, "package.json"));
for (const dependency of Object.keys(rootPkg.dependencies ?? {})) {
	visit(dependency, ROOT);
}

const licenses = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(licenses));

console.log(`Wrote ${licenses.length} licenses to ${OUTPUT}`);
