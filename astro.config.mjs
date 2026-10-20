// @ts-check
import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { defineMdastPlugin } from 'satteri';
import { parse } from 'yaml';
import cspInlineHashes from './src/integrations/csp-inline-hashes.mjs';

// Site address. Switching to learndevops.co.uk is a two-variable change
// (see docs/custom-domain.md).
const SITE_URL = process.env.SITE_URL || 'https://dmccuk.github.io';
const BASE_PATH = process.env.BASE_PATH || '/learndevops';
const base = BASE_PATH === '/' ? '' : BASE_PATH.replace(/\/$/, '');

// The sidebar and sitemap are built from the curriculum file. Full validation
// happens in src/lib/curriculum.ts when pages are built.
const curriculum = parse(fs.readFileSync('./src/data/curriculum.yaml', 'utf8'));
const unitNumber = (/** @type {{id: string, track: string}} */ u) => Number(u.id.slice(u.track.length));

const trackGroups = curriculum.tracks.map((/** @type {any} */ t) => ({
	label: `${t.name} (${t.id})`,
	collapsed: true,
	items: [
		{ label: 'About this track', link: `/tracks/${t.id.toLowerCase()}/` },
		...curriculum.units
			.filter((/** @type {any} */ u) => u.track === t.id)
			.sort((/** @type {any} */ a, /** @type {any} */ b) => unitNumber(a) - unitNumber(b))
			.map((/** @type {any} */ u) => ({
				label: `${u.id} ${u.title}`,
				link: `/units/${u.id.toLowerCase()}/`,
				...(u.status === 'planned' && { badge: { text: 'Soon', variant: 'default' }, attrs: { class: 'ld-planned' } }),
				...(u.status === 'draft' && { badge: { text: 'Draft', variant: 'caution' } }),
			})),
	],
}));

const draftPages = new Set(
	curriculum.units
		.filter((/** @type {any} */ u) => u.status === 'draft')
		.map((/** @type {any} */ u) => `${SITE_URL}${base}/units/${u.id.toLowerCase()}/`),
);

/**
 * Prefixes root-relative Markdown links with the base path, so authors can
 * write [Start here](/start-here/) in MDX and it works under any base.
 */
const baseLinks = defineMdastPlugin({
	name: 'learndevops-base-links',
	link(node, ctx) {
		if (node.url.startsWith('/') && !node.url.startsWith('//') && !node.url.startsWith(`${base}/`)) {
			ctx.setProperty(node, 'url', `${base}${node.url}`);
		}
	},
	definition(node, ctx) {
		if (node.url.startsWith('/') && !node.url.startsWith('//') && !node.url.startsWith(`${base}/`)) {
			ctx.setProperty(node, 'url', `${base}${node.url}`);
		}
	},
});

export default defineConfig({
	site: SITE_URL,
	base: BASE_PATH,
	trailingSlash: 'always',
	markdown: {
		processor: satteri({ mdastPlugins: [baseLinks] }),
		// Expressive Code (via Starlight) highlights code blocks without inline
		// styles, so Astro's own highlighter is not needed.
		syntaxHighlight: false,
	},
	security: {
		// Astro adds a strict Content-Security-Policy <meta> tag with hashes for
		// every inline script and style it emits.
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				"frame-src https://www.youtube-nocookie.com",
				"font-src 'self'",
				"connect-src 'self'",
				// The in-browser VM (v86) starts helper workers from blob: URLs.
				"worker-src 'self' blob:",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
			// Starlight and Expressive Code set CSS custom properties in style
			// attributes. Allow those, but keep <style> elements hash-checked.
			styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
			// Pagefind search runs WebAssembly.
			scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
		},
	},
	integrations: [
		sitemap({
			filter: (page) => !draftPages.has(page) && !page.includes('/poc/'),
		}),
		starlight({
			title: 'Learn DevOps',
			description:
				'A free DevOps course in 66 short, hands-on units. Linux, Git, containers, Kubernetes, CI/CD, infrastructure as code, AWS and observability.',
			titleDelimiter: '—',
			favicon: '/favicon.svg',
			credits: false,
			routeMiddleware: './src/routeData.ts',
			lastUpdated: true,
			editLink: { baseUrl: 'https://github.com/dmccuk/learndevops/edit/main/' },
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/dmccuk/learndevops' },
				{ icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/c/LondonIAC' },
			],
			customCss: [
				'@fontsource/overpass/400.css',
				'@fontsource/overpass/400-italic.css',
				'@fontsource/overpass/600.css',
				'@fontsource/overpass/700.css',
				'@fontsource/overpass/800.css',
				'@fontsource/overpass-mono/400.css',
				'@fontsource/overpass-mono/600.css',
				'./src/styles/theme.css',
			],
			components: {
				Header: './src/components/starlight/Header.astro',
				SiteTitle: './src/components/starlight/SiteTitle.astro',
				ThemeProvider: './src/components/starlight/ThemeProvider.astro',
				Hero: './src/components/starlight/Hero.astro',
				Footer: './src/components/starlight/Footer.astro',
				ThemeSelect: './src/components/starlight/ThemeSelect.astro',
			},
			expressiveCode: {
				// Code blocks stay dark in both themes, like a terminal.
				themes: ['github-dark-default'],
				styleOverrides: { borderRadius: '6px' },
			},
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'How the course works', link: '/start-here/' },
						{ label: 'Your lab environments', link: '/start-here/environments/' },
						{ label: 'Costs and safety', link: '/start-here/costs-and-safety/' },
					],
				},
				{ label: 'Curriculum', link: '/curriculum/' },
				{ label: 'Tracks', items: trackGroups },
				{
					label: 'Paths',
					collapsed: true,
					items: [
						{ label: 'All paths', link: '/paths/' },
						...curriculum.paths.map((/** @type {any} */ p) => ({ label: p.name, link: `/paths/${p.id}/` })),
					],
				},
				{
					label: 'Projects',
					collapsed: true,
					items: [
						{ label: 'All projects', link: '/projects/' },
						...curriculum.projects.map((/** @type {any} */ p, /** @type {number} */ i) => ({
							label: `${i + 1}. ${p.name}`,
							link: `/projects/${p.id}/`,
						})),
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Glossary', link: '/reference/glossary/' },
						{ label: 'FAQ', link: '/reference/faq/' },
						{ label: 'Videos', link: '/reference/videos/' },
						{ label: 'About', link: '/about/' },
					],
				},
			],
		}),
		// Must run after Starlight so it sees the final HTML.
		cspInlineHashes(),
	],
});
