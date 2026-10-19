#!/usr/bin/env node
/**
 * Checks every link in the built site (spec section 14.1).
 *
 *   npm run build && npm run check:links
 *   npm run check:links -- --internal-only   # skip external sites
 *
 * Serves dist/ under the configured base path (BASE_PATH, default
 * /learndevops), so links that ignore the base path fail. Broken internal
 * links and missing #fragments fail the check. Broken external links are
 * reported as warnings only.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { LinkChecker } from 'linkinator';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH || '/learndevops').replace(/\/$/, '');
const SITE = (process.env.SITE_URL || 'https://dmccuk.github.io').replace(/\/$/, '');
const INTERNAL_ONLY = process.argv.includes('--internal-only');

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
	'.wasm': 'application/wasm',
};

if (!fs.existsSync(DIST)) {
	console.error('dist/ not found. Run npm run build first.');
	process.exit(1);
}

// A tiny static server that behaves like GitHub Pages under a base path.
const server = http.createServer((req, res) => {
	const { pathname } = new URL(req.url ?? '/', 'http://localhost');
	const decoded = decodeURIComponent(pathname);
	if (!decoded.startsWith(`${BASE}/`) && decoded !== BASE) {
		res.writeHead(404).end('Outside base path');
		return;
	}
	let file = path.join(DIST, decoded.slice(BASE.length));
	if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
	if (!file.startsWith(DIST) || !fs.existsSync(file)) {
		res.writeHead(404, { 'content-type': TYPES['.html'] }).end(fs.readFileSync(path.join(DIST, '404.html')));
		return;
	}
	res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
	fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
const origin = `http://127.0.0.1:${port}`;
const start = `${origin}${BASE}/`;

const checker = new LinkChecker();
const result = await checker.check({
	path: start,
	recurse: true,
	checkFragments: true,
	concurrency: 50,
	timeout: 20_000,
	retryErrors: true,
	retryErrorsCount: 2,
	linksToSkip: async (link) => {
		if (link.startsWith('mailto:')) return true;
		// Canonical and sitemap URLs point at the live site, which is this same
		// build once deployed. The local copy is already checked.
		if (link.startsWith(`${SITE}${BASE}/`)) return true;
		// The edit links point at the repository's default branch, which does
		// not have new pages until they are merged.
		if (link.startsWith('https://github.com/dmccuk/learndevops/edit/')) return true;
		return INTERNAL_ONLY && !link.startsWith(origin);
	},
});
server.close();

const broken = result.links.filter((l) => l.state === 'BROKEN');
const internal = broken.filter((l) => l.url.startsWith(origin));
const external = broken.filter((l) => !l.url.startsWith(origin));
const show = (l) => `  ${l.status ?? '---'} ${l.url.replace(origin, '')}\n      on ${l.parent?.replace(origin, '') ?? '?'}`;

if (external.length) {
	console.warn(`WARN ${external.length} external link(s) could not be reached:\n${external.map(show).join('\n')}\n`);
}
const pages = new Set(result.links.filter((l) => l.url.startsWith(origin)).map((l) => l.url.split('#')[0])).size;
console.log(`Checked ${result.links.length} links across ${pages} internal URLs.`);
if (internal.length) {
	console.error(`FAIL ${internal.length} broken internal link(s):\n${internal.map(show).join('\n')}`);
	process.exit(1);
}
console.log('No broken internal links.');
