#!/usr/bin/env node
/**
 * Creates a stub MDX page for every unit, track, path and project in
 * src/data/curriculum.yaml that does not have one yet, and keeps each unit
 * page's title and description in step with the YAML.
 *
 *   npm run sync
 *
 * It never deletes pages. If you remove something from the YAML, delete its
 * page by hand; the build fails until you do.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const DOCS = path.join(ROOT, 'src/content/docs');
const data = parse(fs.readFileSync(path.join(ROOT, 'src/data/curriculum.yaml'), 'utf8'));
const q = (s) => JSON.stringify(s);
let created = 0;
let updated = 0;

function write(file, content) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

for (const u of data.units) {
	const file = path.join(DOCS, 'units', `${u.id.toLowerCase()}.mdx`);
	const title = `${u.id} ${u.title}`;
	if (!fs.existsSync(file)) {
		write(
			file,
			`---\ntitle: ${q(title)}\ndescription: ${q(u.outcome)}\nunit: ${u.id}\n---\n\nimport UnitStub from '~/components/pages/UnitStub.astro';\n\n<UnitStub id="${u.id}" />\n`,
		);
		created++;
		continue;
	}
	const text = fs.readFileSync(file, 'utf8');
	const next = text
		.replace(/^title: .*$/m, `title: ${q(title)}`)
		.replace(/^description: .*$/m, `description: ${q(u.outcome)}`);
	if (next !== text) {
		fs.writeFileSync(file, next);
		updated++;
	}
}

for (const t of data.tracks) {
	const file = path.join(DOCS, 'tracks', t.id.toLowerCase(), 'index.mdx');
	if (fs.existsSync(file)) continue;
	write(
		file,
		`---\ntitle: ${q(t.name)}\ndescription: ${q(t.intro)}\ntrack: ${t.id}\n---\n\nimport TrackPage from '~/components/pages/TrackPage.astro';\n\n<TrackPage id="${t.id}" />\n`,
	);
	created++;
}

for (const p of data.paths) {
	const file = path.join(DOCS, 'paths', `${p.id}.mdx`);
	if (fs.existsSync(file)) continue;
	write(
		file,
		`---\ntitle: ${q(`${p.name} path`)}\ndescription: ${q(`For: ${p.for}. Ends with: ${p.endsWith}.`)}\npath: ${p.id}\n---\n\nimport PathPage from '~/components/pages/PathPage.astro';\n\n<PathPage id="${p.id}" />\n`,
	);
	created++;
}

data.projects.forEach((p, i) => {
	const file = path.join(DOCS, 'projects', `${p.id}.mdx`);
	if (fs.existsSync(file)) return;
	write(
		file,
		`---\ntitle: ${q(`Project ${i + 1}: ${p.name}`)}\ndescription: ${q(p.summary)}\nproject: ${p.id}\n---\n\nimport ProjectPage from '~/components/pages/ProjectPage.astro';\n\n<ProjectPage id="${p.id}" />\n`,
	);
	created++;
});

console.log(`sync: ${created} page(s) created, ${updated} unit page(s) updated.`);
