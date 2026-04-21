/**
 * OG画像・SNS共有画像の共通レンダラ。
 *
 * satori + @resvg/resvg-js でテキストから PNG を生成。
 * 各 SNS プラットフォームのサイズに対応。
 */
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

// プラットフォーム別サイズプリセット
export const SIZES = {
  og: { width: 1200, height: 630 }, // Open Graph 標準（X/Facebook/LinkedIn）
  square: { width: 1080, height: 1080 }, // Instagram Feed
  story: { width: 1080, height: 1920 }, // Instagram Story / TikTok / Reels
} as const;

export type SizePreset = keyof typeof SIZES;

// フォントキャッシュ（ビルド中にリクエスト数を減らす）
let fontCache: ArrayBuffer | null = null;

/**
 * Noto Sans JP 700 を取得。
 *
 * satori は woff2 をサポートしないため、TTF または WOFF を取得する必要がある。
 * Google Fonts は User-Agent に応じて返す形式が変わるので、IE 風の古い UA を使って TTF を要求する。
 * それでも失敗した場合は @fontsource の CDN から woff を取得する。
 */
async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

  // 試行1: Google Fonts の css API（旧）＋ 古い User-Agent で TTF を取得
  try {
    const cssUrl =
      'https://fonts.googleapis.com/css?family=Noto+Sans+JP:700&display=swap';
    const css = await fetch(cssUrl, {
      headers: {
        // IE6 の User-Agent を送ると TTF URL を含む CSS が返される
        'User-Agent':
          'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
      },
    }).then((r) => r.text());

    const match =
      css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/) ??
      css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.otf)\)/) ??
      css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff)(?!2)\)/);

    if (match) {
      const buf = await fetch(match[1]).then((r) => r.arrayBuffer());
      fontCache = buf;
      return buf;
    }
  } catch {
    // fall through to fallback
  }

  // 試行2: @fontsource の CDN から WOFF を取得（satori は WOFF サポート）
  const fontsourceUrl =
    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@latest/files/noto-sans-jp-japanese-700-normal.woff';
  const buf = await fetch(fontsourceUrl).then((r) => {
    if (!r.ok) {
      throw new Error(
        `フォント取得に失敗: HTTP ${r.status} (${fontsourceUrl})`,
      );
    }
    return r.arrayBuffer();
  });
  fontCache = buf;
  return buf;
}

export type OgOptions = {
  /** 表示するメインタイトル */
  title: string;
  /** サブタイトル（省略時は AIpedia のタグライン） */
  subtitle?: string;
  /** カテゴリーラベル（右上、省略時は無し） */
  category?: string;
  /** 絵文字（タイトル横、省略時は ✦） */
  emoji?: string;
  /** サイズプリセット */
  size?: SizePreset;
};

/**
 * OG画像を生成し、PNGバイナリを返す。
 */
export async function renderOgImage(
  opts: OgOptions,
): Promise<Uint8Array> {
  const {
    title,
    subtitle = 'AIpedia｜AIツール比較ランキング',
    category,
    emoji = '✦',
    size = 'og',
  } = opts;
  const { width, height } = SIZES[size];

  const font = await loadFont();

  // サイズごとのスケーリング
  const isStory = size === 'story';
  const isSquare = size === 'square';
  const padding = isStory ? 64 : 72;
  const titleFontSize = isStory ? 68 : isSquare ? 72 : 64;
  const subtitleFontSize = isStory ? 28 : 24;
  const brandFontSize = isStory ? 32 : 28;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding,
          background:
            'linear-gradient(135deg, #0b0c12 0%, #1a1230 50%, #2a1140 100%)',
          color: '#fff',
          fontFamily: 'Noto Sans JP, sans-serif',
        },
        children: [
          // ヘッダー：ブランド + カテゴリ
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      fontSize: brandFontSize,
                      fontWeight: 700,
                      color: '#c4b5fd',
                    },
                    children: [
                      { type: 'span', props: { children: '✦' } },
                      { type: 'span', props: { children: 'AIpedia' } },
                    ],
                  },
                },
                category
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          padding: '8px 20px',
                          borderRadius: 999,
                          background: 'rgba(196, 181, 253, 0.15)',
                          border: '2px solid rgba(196, 181, 253, 0.3)',
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#c4b5fd',
                        },
                        children: category,
                      },
                    }
                  : { type: 'div', props: {} },
              ],
            },
          },

          // メインタイトル
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: titleFontSize,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em',
                      color: '#ffffff',
                      // Story の場合、長いタイトルを複数行に
                      display: 'flex',
                    },
                    children: `${emoji} ${title}`,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: subtitleFontSize,
                      color: '#c7cbde',
                      display: 'flex',
                    },
                    children: subtitle,
                  },
                },
              ],
            },
          },

          // フッター
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: isStory ? 22 : 18,
                color: '#8a90a8',
              },
              children: [
                { type: 'span', props: { children: 'ai-pedia.jp' } },
                { type: 'span', props: { children: '2026年最新版' } },
              ],
            },
          },
        ],
      },
    },
    {
      width,
      height,
      fonts: [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}
