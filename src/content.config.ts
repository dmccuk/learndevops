import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/** Unit ID for unit pages, e.g. "K2". Metadata comes from curriculum.yaml. */
				unit: z.string().optional(),
				/** Track ID for track pages, e.g. "K". */
				track: z.string().optional(),
				/** Path ID for path pages, e.g. "beginner". */
				path: z.string().optional(),
				/** Project ID for project pages, e.g. "project-1". */
				project: z.string().optional(),
				/** Date facts on the page were last checked against their sources (YYYY-MM-DD). */
				lastChecked: z.string().optional(),
			}),
		}),
	}),
};
