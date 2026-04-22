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
 * 絵文字（🤖 💰 🎨 等）を Twemoji SVG として読み込む。
 * 日本語フォントには絵文字が含まれないため、これで置換描画する。
 */
const emojiCache = new Map<string, string>();

function toCodePoint(emoji: string): string {
  // VS-16 (U+FE0F) は Twemoji ファイル名に含まれないことが多いので除外
  return [...emoji]
    .map((c) => c.codePointAt(0)?.toString(16))
    .filter((cp): cp is string => cp !== undefined && cp !== 'fe0f')
    .join('-');
}

async function loadEmojiSvg(emoji: string): Promise<string> {
  const cached = emojiCache.get(emoji);
  if (cached) return cached;

  const code = toCodePoint(emoji);
  // jdecked/twemoji（Twitter 退場後のコミュニティメンテ版）。X の公式絵文字セット。
  const urls = [
    `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg`,
    // fallback: そのまま fe0f 付きでも試す
    `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${[...emoji]
      .map((c) => c.codePointAt(0)?.toString(16))
      .join('-')}.svg`,
  ];

  for (const url of urls) {
    const res = await fetch(url);
    if (res.ok) {
      const svg = await res.text();
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      emojiCache.set(emoji, dataUrl);
      return dataUrl;
    }
  }
  // 見つからなければ空の透明SVGを返す（豆腐よりマシ）
  const fallback =
    'data:image/svg+xml;base64,' +
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="transparent"/></svg>',
    ).toString('base64');
  emojiCache.set(emoji, fallback);
  return fallback;
}

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
  /** 絵文字（タイトル横、省略時は ✨） */
  emoji?: string;
  /** サイズプリセット */
  size?: SizePreset;
};

/**
 * 文字列を「通常テキスト」と「絵文字」のセグメントに分割。
 * 絵文字部分は Twemoji SVG 画像に置換して描画する。
 */
function splitEmoji(
  input: string,
): Array<{ type: 'text' | 'emoji'; value: string }> {
  const emojiRegex =
    /(?:\p{Extended_Pictographic}(?:\u200d\p{Extended_Pictographic})*|[\u2600-\u27BF])[\uFE0F]?/gu;
  const result: Array<{ type: 'text' | 'emoji'; value: string }> = [];
  let lastIdx = 0;
  for (const match of input.matchAll(emojiRegex)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      result.push({ type: 'text', value: input.slice(lastIdx, idx) });
    }
    result.push({ type: 'emoji', value: match[0] });
    lastIdx = idx + match[0].length;
  }
  if (lastIdx < input.length) {
    result.push({ type: 'text', value: input.slice(lastIdx) });
  }
  return result;
}

/** 絵文字を含む文字列を、テキスト＋画像ノードの配列に変換（satori用） */
async function renderInline(input: string, emojiSize: number): Promise<any[]> {
  const segs = splitEmoji(input);
  const out: any[] = [];
  for (const seg of segs) {
    if (seg.type === 'text') {
      if (seg.value) out.push({ type: 'span', props: { children: seg.value } });
    } else {
      const src = await loadEmojiSvg(seg.value);
      out.push({
        type: 'img',
        props: {
          src,
          width: emojiSize,
          height: emojiSize,
          style: {
            margin: '0 8px',
          },
        },
      });
    }
  }
  return out;
}

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
    emoji = '✨',
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

  // 絵文字を含むテキストを画像化して埋め込む（Noto Sans JP に絵文字が含まれないため）
  const titleChildren = await renderInline(
    `${emoji} ${title}`,
    titleFontSize,
  );
  const subtitleChildren = await renderInline(subtitle, subtitleFontSize);

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
                      gap: 12,
                      fontSize: brandFontSize,
                      fontWeight: 700,
                      color: '#c4b5fd',
                    },
                    children: [
                      // ロゴ代わりに紫の正方形バッジ（フォントに依存しないので確実に表示される）
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: brandFontSize + 8,
                            height: brandFontSize + 8,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg,#a78bfa,#f472b6)',
                            color: '#fff',
                            fontSize: brandFontSize - 4,
                            fontWeight: 800,
                          },
                          children: 'A',
                        },
                      },
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
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    },
                    children: titleChildren,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: subtitleFontSize,
                      color: '#c7cbde',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      lineHeight: 1.5,
                    },
                    children: subtitleChildren,
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
