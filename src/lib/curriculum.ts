/**
 * Typed loader for src/data/curriculum.yaml, the single source of truth for
 * tracks, units, paths and projects.
 *
 * Validation runs once when this module is first imported during a build.
 * Any error throws, which fails the build (spec section 7.1).
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

export const STAGES = [
	'foundations',
	'code',
	'build-test',
	'package',
	'provision',
	'configure',
	'deploy',
	'operate',
	'observe',
	'security',
] as const;

export const ENVIRONMENTS = ['browser', 'codespaces', 'codespaces-4core', 'fleet', 'laptop', 'aws'] as const;
export const STATUSES = ['planned', 'draft', 'published'] as const;

const unitId = z.string().regex(/^[A-Z]{1,2}\d{1,2}$/, 'Unit IDs look like K2 or AI1');
const trackId = z.string().regex(/^[A-Z]{1,2}$/, 'Track IDs look like K or AI');

const TrackSchema = z.strictObject({
	id: trackId,
	name: z.string().min(1),
	stage: z.enum(STAGES),
	new: z.boolean(),
	intro: z.string().min(1),
});

const VideoSchema = z.strictObject({
	youtubeId: z.string().regex(/^[\w-]{11}$/),
	title: z.string().min(1),
	legacy: z.boolean(),
});

const UnitSchema = z.strictObject({
	id: unitId,
	title: z.string().min(1),
	outcome: z.string().min(1),
	track: trackId,
	stage: z.enum(STAGES),
	runsIn: z.enum(ENVIRONMENTS),
	alsoRunsIn: z.array(z.enum(ENVIRONMENTS)).default([]),
	minutes: z.number().int().min(30).max(60),
	prerequisites: z.array(unitId),
	status: z.enum(STATUSES),
	video: VideoSchema.optional(),
	costNote: z.boolean().default(false),
});

const PathSchema = z.strictObject({
	id: z.string().regex(/^[a-z][a-z0-9-]*$/),
	name: z.string().min(1),
	for: z.string().min(1),
	units: z.array(unitId),
	optional: z.array(unitId).default([]),
	endsWith: z.string().min(1),
});

const ProjectSchema = z.strictObject({
	id: z.string().regex(/^project-\d+$/),
	name: z.string().min(1),
	summary: z.string().min(1),
	draws: z.array(unitId).min(1),
	runsIn: z.enum(ENVIRONMENTS),
	costNote: z.boolean().default(false),
});

const UnattachedVideoSchema = z.strictObject({
	youtubeId: z.string().regex(/^[\w-]{11}$/),
	title: z.string().min(1),
	chapter: z.number().int(),
	note: z.string().min(1),
});

const CurriculumSchema = z.strictObject({
	tracks: z.array(TrackSchema).min(1),
	units: z.array(UnitSchema).min(1),
	paths: z.array(PathSchema).min(1),
	projects: z.array(ProjectSchema).min(1),
	unattachedVideos: z.array(UnattachedVideoSchema).default([]),
});

export type Stage = (typeof STAGES)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type Status = (typeof STATUSES)[number];
export type Track = z.infer<typeof TrackSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type LearningPath = z.infer<typeof PathSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Curriculum = z.infer<typeof CurriculumSchema>;

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'src/data/curriculum.yaml');
const DOCS_DIR = path.join(ROOT, 'src/content/docs');

/** Lower-case slug used in URLs and file names, e.g. `K2` → `k2`. */
export const slug = (id: string) => id.toLowerCase();

function mdxFilesIn(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	return fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
		.map((f) => f.replace(/\.mdx$/, ''));
}

function duplicates(ids: string[]): string[] {
	return ids.filter((id, i) => ids.indexOf(id) !== i);
}

/** Reads the `title` and `description` front matter values from an MDX file. */
function frontMatter(file: string): Record<string, string> {
	const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
	const match = /^---\n([\s\S]*?)\n---/.exec(text);
	if (!match) return {};
	const data = parse(match[1]) as Record<string, unknown>;
	return Object.fromEntries(
		Object.entries(data).filter(([, v]) => typeof v === 'string'),
	) as Record<string, string>;
}

export function validate(data: Curriculum): string[] {
	const errors: string[] = [];
	const trackIds = new Set(data.tracks.map((t) => t.id));
	const unitIds = new Set(data.units.map((u) => u.id));
	const ref = (where: string, id: string) => {
		if (!unitIds.has(id)) errors.push(`${where} refers to unit ${id}, which does not exist`);
	};

	for (const [kind, ids] of [
		['track', data.tracks.map((t) => t.id)],
		['unit', data.units.map((u) => u.id)],
		['path', data.paths.map((p) => p.id)],
		['project', data.projects.map((p) => p.id)],
	] as const) {
		for (const id of duplicates(ids)) errors.push(`Duplicate ${kind} ID: ${id}`);
	}

	for (const u of data.units) {
		if (!trackIds.has(u.track)) errors.push(`Unit ${u.id} is in track ${u.track}, which does not exist`);
		if (!u.id.startsWith(u.track) || !/^\d+$/.test(u.id.slice(u.track.length))) {
			errors.push(`Unit ${u.id} does not match its track ${u.track}`);
		}
		for (const p of u.prerequisites) ref(`Unit ${u.id} prerequisites`, p);
		if (u.prerequisites.includes(u.id)) errors.push(`Unit ${u.id} lists itself as a prerequisite`);
		if (u.alsoRunsIn.includes(u.runsIn)) errors.push(`Unit ${u.id} lists ${u.runsIn} in both runsIn and alsoRunsIn`);
		if (u.runsIn === 'aws' && u.id !== 'W1' && !u.prerequisites.length) {
			errors.push(`AWS unit ${u.id} must have prerequisites (W1 or a unit that needs it)`);
		}
	}
	for (const p of data.paths) {
		for (const id of [...p.units, ...p.optional]) ref(`Path ${p.id}`, id);
		for (const id of duplicates([...p.units, ...p.optional])) errors.push(`Path ${p.id} lists ${id} twice`);
	}
	for (const p of data.projects) {
		for (const id of p.draws) ref(`Project ${p.id}`, id);
	}

	// Every YAML entry needs an MDX page, and every MDX page needs a YAML entry.
	const pairs: [string, string, string[]][] = [
		['units', 'unit', data.units.map((u) => slug(u.id))],
		['paths', 'path', data.paths.map((p) => p.id)],
		['projects', 'project', data.projects.map((p) => p.id)],
	];
	for (const [dir, kind, ids] of pairs) {
		const pages = mdxFilesIn(path.join(DOCS_DIR, dir));
		for (const id of ids) {
			if (!pages.includes(id)) errors.push(`The ${kind} ${id} has no page at src/content/docs/${dir}/${id}.mdx`);
		}
		for (const page of pages) {
			if (!ids.includes(page)) errors.push(`src/content/docs/${dir}/${page}.mdx has no ${kind} entry in curriculum.yaml`);
		}
	}
	const trackDirs = fs.existsSync(path.join(DOCS_DIR, 'tracks'))
		? fs.readdirSync(path.join(DOCS_DIR, 'tracks'))
		: [];
	for (const t of data.tracks) {
		if (!trackDirs.includes(slug(t.id))) errors.push(`Track ${t.id} has no page at src/content/docs/tracks/${slug(t.id)}/index.mdx`);
	}
	for (const dir of trackDirs) {
		if (!trackIds.has(dir.toUpperCase())) errors.push(`src/content/docs/tracks/${dir}/ has no track entry in curriculum.yaml`);
	}

	// Page titles and descriptions come from YAML. Catch pages that have drifted.
	for (const u of data.units) {
		const file = path.join(DOCS_DIR, 'units', `${slug(u.id)}.mdx`);
		if (!fs.existsSync(file)) continue;
		const fm = frontMatter(file);
		if (fm.title !== unitTitle(u)) errors.push(`${slug(u.id)}.mdx title should be "${unitTitle(u)}" (run npm run sync)`);
		if (fm.description !== u.outcome) errors.push(`${slug(u.id)}.mdx description should match the unit outcome (run npm run sync)`);
	}

	return errors;
}

export function loadCurriculum(file = DATA_FILE): Curriculum {
	const raw = parse(fs.readFileSync(file, 'utf8'));
	const result = CurriculumSchema.safeParse(raw);
	if (!result.success) {
		const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
		throw new Error(`curriculum.yaml is invalid:\n${issues}`);
	}
	const errors = validate(result.data);
	if (errors.length) {
		throw new Error(`curriculum.yaml has ${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
	}
	return result.data;
}

export const curriculum = loadCurriculum();

/** Page title for a unit, e.g. "K2 Deploying an app". */
export function unitTitle(u: Pick<Unit, 'id' | 'title'>): string {
	return `${u.id} ${u.title}`;
}

export function getTrack(id: string): Track {
	const t = curriculum.tracks.find((x) => x.id === id.toUpperCase());
	if (!t) throw new Error(`Unknown track ${id}`);
	return t;
}

export function getUnit(id: string): Unit {
	const u = curriculum.units.find((x) => x.id === id.toUpperCase());
	if (!u) throw new Error(`Unknown unit ${id}`);
	return u;
}

export function getPath(id: string): LearningPath {
	const p = curriculum.paths.find((x) => x.id === id);
	if (!p) throw new Error(`Unknown path ${id}`);
	return p;
}

export function getProject(id: string): Project {
	const p = curriculum.projects.find((x) => x.id === id);
	if (!p) throw new Error(`Unknown project ${id}`);
	return p;
}

/** Units in a track, in ID order (L1, L2 … L10). */
export function unitsInTrack(trackIdValue: string): Unit[] {
	const n = (u: Unit) => Number(u.id.slice(u.track.length));
	return curriculum.units.filter((u) => u.track === trackIdValue).sort((a, b) => n(a) - n(b));
}

/** Units that list this unit as a prerequisite. */
export function dependents(id: string): Unit[] {
	return curriculum.units.filter((u) => u.prerequisites.includes(id));
}

/** Published units only count towards totals (spec section 7.1). */
export const publishedCount = (ids: string[]) =>
	ids.filter((id) => getUnit(id).status === 'published').length;

export const STAGE_LABELS: Record<Stage, string> = {
	foundations: 'Foundations',
	code: 'Code',
	'build-test': 'Build and test',
	package: 'Package',
	provision: 'Provision',
	configure: 'Configure',
	deploy: 'Deploy',
	operate: 'Run and operate',
	observe: 'Observe',
	security: 'Security',
};

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
	browser: 'Browser',
	codespaces: 'Codespaces',
	'codespaces-4core': 'Codespaces (4-core)',
	fleet: 'Multi-machine lab',
	laptop: 'Laptop',
	aws: 'AWS',
};
