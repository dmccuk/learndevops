#!/usr/bin/env node
/**
 * Fails if published copy uses words the style guide bans (spec section 11):
 * "simply", "just", "easy", "obviously". Also bans emoji.
 *
 *   npm run check:prose
 *
 * Checks MDX pages, Astro components and data files. Code blocks, inline code,
 * <script> and <style> are skipped. Proper names that contain a banned word
 * and copy fixed by the spec are allowed.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIRS = ['src/content/docs', 'src/components', 'src/data'];
const EXTENSIONS = ['.mdx', '.md', '.astro', '.yaml'];
const BANNED = /\b(simply|just|easy|obviously)\b/gi;
const EMOJI = /\p{Emoji_Presentation}|️/gu;
// Copy fixed by the spec (section 6 and 7.5).
const ALLOWED = [/Just one tool/g, /Pick a path, or just pick a unit/g];

function* walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else if (EXTENSIONS.includes(path.extname(entry.name))) yield full;
	}
}

/** Blank out text that is not prose, keeping line numbers intact. */
function proseOnly(text) {
	const blank = (m) => m.replace(/[^\n]/g, ' ');
	let out = text
		.replace(/```[\s\S]*?```/g, blank)
		.replace(/<script[\s\S]*?<\/script>/g, blank)
		.replace(/<style[\s\S]*?<\/style>/g, blank)
		.replace(/`[^`\n]*`/g, blank);
	for (const re of ALLOWED) out = out.replace(re, blank);
	return out;
}

let problems = 0;
for (const dir of DIRS) {
	for (const file of walk(path.join(ROOT, dir))) {
		const lines = proseOnly(fs.readFileSync(file, 'utf8')).split('\n');
		lines.forEach((line, i) => {
			for (const m of line.matchAll(BANNED)) {
				console.error(`${path.relative(ROOT, file)}:${i + 1}: avoid "${m[0]}"`);
				problems++;
			}
			for (const m of line.matchAll(EMOJI)) {
				console.error(`${path.relative(ROOT, file)}:${i + 1}: no emoji ("${m[0]}")`);
				problems++;
			}
		});
	}
}

if (problems) {
	console.error(`\n${problems} style problem(s). See docs/style-guide.md.`);
	process.exit(1);
}
console.log('Prose check passed.');
