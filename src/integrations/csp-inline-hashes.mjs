// @ts-check
/**
 * Astro's `security.csp` hashes the scripts and styles Astro bundles, but not
 * `is:inline` scripts or inline <style> blocks that Starlight and Expressive
 * Code write straight into the page. Without their hashes, browsers block
 * them under the strict policy.
 *
 * After the build, this integration hashes every inline <script> (without a
 * src) and <style> in each HTML file and adds the hashes to that page's
 * Content-Security-Policy <meta> tag. No 'unsafe-inline' is needed.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string} dir @returns {Generator<string>} */
function* htmlFiles(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* htmlFiles(full);
		else if (entry.name.endsWith('.html')) yield full;
	}
}

/** @param {string} text */
const sha256 = (text) => `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;

/**
 * Adds hashes to one directive in a policy string, creating the directive if
 * it is missing.
 * @param {string} policy @param {string} directive @param {string[]} hashes
 */
function addHashes(policy, directive, hashes) {
	if (!hashes.length) return policy;
	const parts = policy.split(';').map((p) => p.trim());
	const i = parts.findIndex((p) => p === directive || p.startsWith(`${directive} `));
	if (i === -1) return `${policy}; ${directive} 'self' ${hashes.join(' ')}`;
	const existing = new Set(parts[i].split(/\s+/));
	parts[i] = [parts[i], ...hashes.filter((h) => !existing.has(h))].join(' ');
	return parts.join('; ');
}

/** @returns {import('astro').AstroIntegration} */
export default function cspInlineHashes() {
	return {
		name: 'learndevops:csp-inline-hashes',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				const root = fileURLToPath(dir);
				let pages = 0;
				for (const file of htmlFiles(root)) {
					const html = fs.readFileSync(file, 'utf8');
					const meta = /<meta http-equiv="content-security-policy" content="([^"]*)"\s*\/?>/i.exec(html);
					if (!meta) continue;
					const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
						.filter((m) => !/type="application\/(ld\+)?json"/i.test(m[0]))
						.map((m) => sha256(m[1]));
					const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => sha256(m[1]));
					let policy = meta[1];
					policy = addHashes(policy, 'script-src', [...new Set(scripts)]);
					policy = addHashes(policy, 'style-src', [...new Set(styles)]);
					if (policy !== meta[1]) {
						fs.writeFileSync(file, html.replace(meta[0], meta[0].replace(meta[1], policy)));
						pages++;
					}
				}
				logger.info(`Added inline script and style hashes to ${pages} page(s).`);
			},
		},
	};
}
