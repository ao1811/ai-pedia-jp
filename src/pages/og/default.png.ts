import type { APIRoute } from 'astro';
import { renderOgImage } from '@/lib/og';

/**
 * サイト全体のデフォルト OG 画像。
 * `/og/default.png` で配信。
 */
export const GET: APIRoute = async () => {
  try {
    const png = await renderOgImage({
      title: 'AIツール比較ランキング 2026年版',
      subtitle: 'ChatGPT・Claude・Gemini・Cursor など主要AIツールを徹底比較',
      category: '総合',
      size: 'og',
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
