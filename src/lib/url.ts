/**
 * Builds an internal link that respects Astro's `base` (spec section 13.1).
 * Always use this in components instead of hard-coding "/…" paths.
 *
 *   url('/units/k2/')  →  '/learndevops/units/k2/'  (or '/units/k2/' at the root)
 */
export function url(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	if (!pathname.startsWith('/')) return pathname;
	return `${base}${pathname}`;
}

export const unitUrl = (id: string) => url(`/units/${id.toLowerCase()}/`);
export const trackUrl = (id: string) => url(`/tracks/${id.toLowerCase()}/`);
export const pathUrl = (id: string) => url(`/paths/${id}/`);
export const projectUrl = (id: string) => url(`/projects/${id}/`);

export const REPO_URL = 'https://github.com/dmccuk/learndevops';
export const YOUTUBE_URL = 'https://www.youtube.com/c/LondonIAC';
export const CODESPACES_URL = 'https://codespaces.new/dmccuk/learndevops';
