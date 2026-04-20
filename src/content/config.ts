import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('編集部'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['comparison', 'howto', 'guide', 'review', 'trend']),
    heroEmoji: z.string().default('📘'),
    heroGradient: z.string().default('from-violet-500 to-fuchsia-500'),
    featured: z.boolean().default(false),
    relatedTools: z.array(z.string()).default([]),
    amazonProducts: z.array(z.string()).default([]),
    readTimeMin: z.number().default(5),
  }),
});

export const collections = { guides };
