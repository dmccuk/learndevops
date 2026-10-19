#!/usr/bin/env node
/**
 * Checks WCAG 2.2 AA contrast for the colour token pairs the site actually
 * uses together, in both themes (spec section 5.1). Exits 1 on any failure.
 *
 *   npm run check:contrast
 *
 * Tokens are read from src/styles/theme.css. When you use a new pair in a
 * component, add it to PAIRS below.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'src/styles/theme.css'), 'utf8');

/** Reads `--ld-*: #hex;` declarations from the first block matching `selector {`. */
function tokens(selector) {
	const start = css.indexOf(`${selector} {`);
	if (start === -1) throw new Error(`No "${selector}" block in theme.css`);
	const block = css.slice(start, css.indexOf('}', start));
	return Object.fromEntries(
		[...block.matchAll(/--ld-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]),
	);
}

const dark = tokens(':root');
const light = { ...dark, ...tokens(":root[data-theme='light']") };

// [foreground, background, minimum ratio]. 4.5 for body text, 3 for large
// text and non-text UI (borders of inputs and focus indicators).
const TEXT = 4.5;
const LARGE = 3;
const PAIRS = [
	['text', 'bg', TEXT],
	['text', 'bg-alt', TEXT],
	['text', 'surface', TEXT],
	['heading', 'bg', TEXT],
	['heading', 'bg-alt', TEXT],
	['heading', 'surface', TEXT],
	['muted', 'bg', TEXT],
	['muted', 'bg-alt', TEXT],
	['muted', 'surface', TEXT],
	['dim', 'bg', TEXT],
	['dim', 'bg-alt', TEXT],
	['dim', 'surface', TEXT],
	['accent', 'bg', TEXT],
	['accent', 'bg-alt', TEXT],
	['accent', 'surface', TEXT],
	['accent', 'accent-tint', TEXT],
	['on-accent', 'accent', TEXT],
	['ok', 'bg', TEXT],
	['ok', 'surface', TEXT],
	['warn', 'bg', TEXT],
	['warn', 'surface', TEXT],
	['warn', 'warn-tint', TEXT],
	['text', 'warn-tint', TEXT],
	['text', 'accent-tint', TEXT],
	['terminal-text', 'terminal', TEXT],
	['terminal-muted', 'terminal', TEXT],
	['terminal-prompt', 'terminal', TEXT],
	['terminal-ok', 'terminal', TEXT],
	['accent', 'bg', LARGE],
];

function luminance(hex) {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

let failures = 0;
for (const [name, theme] of [
	['dark', dark],
	['light', light],
]) {
	for (const [fg, bg, min] of PAIRS) {
		if (!theme[fg] || !theme[bg]) {
			console.error(`FAIL ${name}: missing token --ld-${!theme[fg] ? fg : bg}`);
			failures++;
			continue;
		}
		const r = ratio(theme[fg], theme[bg]);
		const ok = r >= min;
		if (!ok) failures++;
		console.log(
			`${ok ? 'PASS' : 'FAIL'} ${name.padEnd(5)} ${`--ld-${fg}`.padEnd(22)} on ${`--ld-${bg}`.padEnd(18)} ${r.toFixed(2)}:1 (needs ${min}:1)`,
		);
	}
}

if (failures) {
	console.error(`\n${failures} contrast check(s) failed.`);
	process.exit(1);
}
console.log('\nAll contrast checks passed.');
