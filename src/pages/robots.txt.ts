import type { APIRoute } from 'astro';

// robots.txt with an absolute sitemap URL that follows SITE_URL and BASE_PATH.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
