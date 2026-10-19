/**
 * Starlight route middleware.
 * Unit pages get Previous / Next links within their own track (spec section
 * 4.2), instead of following the whole sidebar.
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getUnit, unitTitle, unitsInTrack } from './lib/curriculum';
import { unitUrl } from './lib/url';

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const id = route.entry.data.unit;
	if (!id) return;

	const unit = getUnit(id);
	const units = unitsInTrack(unit.track);
	const i = units.findIndex((u) => u.id === unit.id);
	const link = (u: (typeof units)[number] | undefined) =>
		u && { label: unitTitle(u), href: unitUrl(u.id), isCurrent: false, type: 'link' as const, badge: undefined, attrs: {} };

	route.pagination.prev = link(units[i - 1]);
	route.pagination.next = link(units[i + 1]);
});
