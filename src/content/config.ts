import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  // .md と .mdx の両方を許可。本文中に <SponsoredCTA /> 等のコンポーネントを
  // 差し込みたい記事だけ .mdx にリネームして使う（他の .md はそのまま動作）。
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
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
    /** TL;DR（AIO向け：記事冒頭に結論ブロック、Speakable schema対象） */
    tldr: z.string().optional(),
    /** FAQ（FAQPage schema 生成、リッチリザルト対応） */
    faq: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        }),
      )
      .default([]),
    /**
     * インデックス対象外フラグ。
     * 推測情報を含む記事・品質改善前の旧記事を noindex 化するために使用。
     * AdSense ポリシー対応で「有用性の低いコンテンツ」を Google 検索結果から外す。
     */
    noIndex: z.boolean().optional().default(false),
  }),
});

export const collections = { guides };
