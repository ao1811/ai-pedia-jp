import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, SIZES, type SizePreset } from '@/lib/og';

/**
 * ガイド記事ごとの OG / SNS 共有画像。
 *
 * パス：
 *  - `/og/og/guides/{slug}.png`     → 1200x630（OG標準 / X / Facebook / LinkedIn）
 *  - `/og/square/guides/{slug}.png` → 1080x1080（Instagram Feed）
 *  - `/og/story/guides/{slug}.png`  → 1080x1920（Instagram Story / TikTok / Reels）
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const guides = await getCollection('guides');
  const sizes: SizePreset[] = ['og', 'square', 'story'];
  const paths = [];
  for (const size of sizes) {
    for (const g of guides) {
      paths.push({
        params: { size, slug: g.id.replace(/\.md$/, '') },
      });
    }
  }
  return paths;
};

const categoryLabel: Record<string, string> = {
  comparison: '比較',
  howto: 'ハウツー',
  guide: 'ガイド',
  review: 'レビュー',
  trend: 'トレンド',
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const slug = params.slug;
    const sizeParam = params.size as SizePreset;
    if (!slug || !sizeParam || !(sizeParam in SIZES)) {
      return new Response('invalid params', { status: 400 });
    }

    const guides = await getCollection('guides');
    const guide = guides.find((g) => g.id.replace(/\.md$/, '') === slug);
    if (!guide) return new Response('guide not found', { status: 404 });

    const png = await renderOgImage({
      title: guide.data.title,
      subtitle: guide.data.tldr ?? guide.data.description,
      category: categoryLabel[guide.data.category] ?? '特集',
      emoji: guide.data.heroEmoji,
      size: sizeParam,
    });

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response('og image generation failed: ' + String(err), {
      status: 500,
    });
  }
};
