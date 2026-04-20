/**
 * サイト全体で共有するメタデータ・スキーマ生成の情報源。
 * SEO + AIO（AI検索最適化）でも参照される中心データ。
 */

export const SITE = {
  name: 'AIツール比較ランキング | ai-pedia',
  shortName: 'ai-pedia',
  url: 'https://ai-pedia.jp',
  description:
    'ChatGPT・Claude・Gemini など主要AIツールを独自評価5軸（応答品質・日本語精度・コスパ・拡張性・トレンド）で徹底比較。初心者の選び方から業務導入まで、最適な1本を数字で示します。',
  locale: 'ja_JP',
  author: {
    name: 'ai-pedia 編集部',
    url: 'https://ai-pedia.jp/about',
  },
  social: {
    twitter: '',
    // youtube: '',
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
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE.url}/favicon.svg`,
    width: 512,
    height: 512,
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
