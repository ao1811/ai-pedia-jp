import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const guides = await getCollection('guides');
  return rss({
    title: 'AIツール比較ランキング | ai-pedia',
    description:
      'ChatGPT・Claude・Gemini 等の主要AIツールを独自評価5軸で徹底比較。初心者の選び方から業務導入まで。',
    site: context.site?.toString() ?? 'https://ai-pedia.jp',
    items: guides
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((g) => ({
        title: g.data.title,
        description: g.data.description,
        link: `/guides/${g.id}`,
        pubDate: g.data.publishedAt,
        categories: g.data.tags,
      })),
    customData: `<language>ja-JP</language>`,
  });
}
