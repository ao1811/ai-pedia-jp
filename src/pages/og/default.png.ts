import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { APIRoute } from 'astro';

const WIDTH = 1200;
const HEIGHT = 630;

// satori にはフォントが必要。Noto Sans JP をCDN経由で取得する代わりに、
// システムフォントがない環境ではビルド時に問題が出るため、最小の英数字フォントをバンドル可能にしておく。
// 実装簡易化のため、ここではフォント未指定モード（文字化けする可能性あり）を避けるため、
// フォント埋め込みのヘルパを用意する。
let fontData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  // Google Fonts CSS から Noto Sans JP 700 の woff2 URLを抽出し、fetchで取得
  const cssUrl =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap';
  const css = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  }).then((r) => r.text());
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2?)\)/);
  if (!match) throw new Error('font url not found');
  const buf = await fetch(match[1]).then((r) => r.arrayBuffer());
  fontData = buf;
  return buf;
}

export async function renderOgImage({
  title,
  subtitle = 'AIpedia｜AIツール比較ランキング',
  emoji = '✦',
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
}): Promise<Uint8Array> {
  const font = await loadFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background:
            'linear-gradient(135deg, #0b0c12 0%, #1a1230 50%, #2a1140 100%)',
          color: '#fff',
          fontFamily: 'Noto Sans JP, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 28,
                fontWeight: 700,
                color: '#c4b5fd',
              },
              children: [
                { type: 'span', props: { children: '✦' } },
                { type: 'span', props: { children: 'AIpedia' } },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 64,
                      fontWeight: 700,
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      color: '#ffffff',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 24,
                      color: '#c7cbde',
                    },
                    children: subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 18,
                color: '#8a90a8',
              },
              children: [
                { type: 'span', props: { children: 'ai-pedia.jp' } },
                { type: 'span', props: { children: '2026年4月最新版' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } });
  return resvg.render().asPng();
}

export const GET: APIRoute = async () => {
  try {
    const png = await renderOgImage({
      title: 'AIツール比較ランキング 2026年4月版',
      subtitle: 'ChatGPT・Claude・Gemini・Cursor など主要AIツールを徹底比較',
    });
    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response('og image generation failed: ' + String(err), { status: 500 });
  }
};
