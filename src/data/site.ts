/**
 * サイト全体で共有するメタデータ・スキーマ生成の情報源。
 * SEO + AIO（AI検索最適化）でも参照される中心データ。
 */

export const SITE = {
  /** メインタイトル */
  name: 'AIpedia',
  /** サブタイトル（サイト説明として併記） */
  tagline: 'AIツール比較ランキング',
  shortName: 'AIpedia',
  url: 'https://ai-pedia.jp',
  description:
    'ChatGPT・Claude・Gemini など主要AIツールを独自評価5軸（応答品質・日本語精度・コスパ・拡張性・トレンド）で徹底比較。初心者の選び方から業務導入まで、最適な1本を数字で示します。',
  locale: 'ja_JP',
  author: {
    name: 'AIpedia 編集部',
    url: 'https://ai-pedia.jp/about',
  },
  social: {
    x: '@aipediajp',          // X（旧Twitter）
    instagram: '@ai_pedia.jp', // Instagram
    tiktok: '@ai_pedia_jp',    // TikTok
  },
  keywords: [
    'AIツール比較',
    'ChatGPT',
    'Claude',
    'Gemini',
    'AIランキング',
    '生成AI',
    'AIライティング',
    'AI画像生成',
    'AIコーディング',
    'Midjourney',
    'Cursor',
    'Notion AI',
    'Perplexity',
  ],
} as const;

/**
 * Organization スキーマ（全ページで参照される entity）。
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: [SITE.tagline, 'ai-pedia'],
  url: SITE.url,
  // Google Rich Results は PNG/JPG の logo を推奨（SVG は警告が出る場合あり）。
  // /og/default.png を代用（1200x630、サイト全体のブランディング画像）。
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/og/default.png`,
    width: 1200,
    height: 630,
  },
  description: SITE.description,
  foundingDate: '2026-04',
  areaServed: 'JP',
  knowsAbout: SITE.keywords,
};

/**
 * WebSite スキーマ（サイト検索の hinting を含む）。
 */
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: 'ja-JP',
  // AIエージェントや検索エンジンが「サイト内検索」を知るための標準
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE.url}/tags/{search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
