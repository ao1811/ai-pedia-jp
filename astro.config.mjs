import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 記事frontmatter から tag → 記事数 を計算。
 * sitemap filter で「1記事しかないタグページ」を除外するため。
 * （Google Search Console の「送信されたURLに noindex タグ」エラー対策）
 */
function getThinTagPaths() {
  const dir = join(process.cwd(), 'src', 'content', 'guides');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const counts = new Map();
  for (const f of files) {
    const content = readFileSync(join(dir, f), 'utf-8');
    const m = content.match(/^---([\s\S]*?)---/);
    if (!m) continue;
    const tagsMatch = m[1].match(/tags:\s*\[([^\]]*)\]/);
    if (!tagsMatch) continue;
    const tags = tagsMatch[1]
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
    tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  }
  // 1記事しかないタグの URL path を生成
  return new Set(
    Array.from(counts.entries())
      .filter(([, n]) => n < 2)
      .map(([t]) => `/tags/${t}/`),
  );
}

/**
 * frontmatter に noIndex: true があるガイド記事の URL を抽出。
 * sitemap から除外して Google にクロールさせない。
 */
function getNoIndexGuidePaths() {
  const dir = join(process.cwd(), 'src', 'content', 'guides');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const noIndexSlugs = new Set();
  for (const f of files) {
    const content = readFileSync(join(dir, f), 'utf-8');
    const m = content.match(/^---([\s\S]*?)---/);
    if (!m) continue;
    if (/^noIndex:\s*true\s*$/m.test(m[1])) {
      const slug = f.replace(/\.(md|mdx)$/, '');
      noIndexSlugs.add(`/guides/${slug}/`);
    }
  }
  return noIndexSlugs;
}

/**
 * public/_redirects に定義された 301 リダイレクトの「リダイレクト元」パスを抽出。
 * タグ統合（例: /tags/料金/ → /tags/コスパ/）の旧URLは 301 を返すため、
 * sitemap に残すと Search Console で「リダイレクトを含むページ」エラーになる。
 */
function getRedirectSourcePaths() {
  const set = new Set();
  try {
    const txt = readFileSync(join(process.cwd(), 'public', '_redirects'), 'utf-8');
    for (const line of txt.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const src = trimmed.split(/\s+/)[0];
      if (!src || !src.startsWith('/')) continue;
      try {
        set.add(decodeURIComponent(src));
      } catch {
        set.add(src);
      }
    }
  } catch {}
  return set;
}

const THIN_TAG_PATHS = getThinTagPaths();
const NOINDEX_GUIDE_PATHS = getNoIndexGuidePaths();
const REDIRECT_SOURCE_PATHS = getRedirectSourcePaths();

export default defineConfig({
  site: 'https://ai-pedia.jp',
  // 全URL を trailing slash 付きで統一。
  // - 内部リンクが自動的に末尾スラッシュ付きに正規化される
  // - sitemap の URL も統一
  // - trailing slash なしの旧URL は _redirects で 301 リダイレクト
  trailingSlash: 'always',
  integrations: [
    // MDX 対応（記事内で <SponsoredCTA /> 等のコンポーネントを直接利用可能にする）
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // noindex ページを sitemap から除外。
      // これを送信すると Search Console に「送信されたURLに noindex タグがあります」
      // というエラーが出るため、admin・sns 系は最初から含めない。
      filter: (page) => {
        // noindex ページを sitemap から除外。
        if (page.includes('/admin/')) return false;
        if (page.includes('/sns/')) return false;
        if (page.endsWith('/404/')) return false;
        // frontmatter で noIndex: true を指定したガイド記事も除外。
        try {
          // URL.pathname は日本語タグを %E3%... とエンコードして返すため、
          // デコードしてから各セット（デコード済みパス）と突き合わせる。
          // ここを decode していなかったため、日本語タグの thin/redirect 除外が
          // 全く効かず、noindex タグや 301 タグが sitemap に大量混入していた。
          const pathOnly = decodeURIComponent(new URL(page).pathname);
          if (NOINDEX_GUIDE_PATHS.has(pathOnly)) return false;
          // 1記事しかないタグページも除外（thin content）。
          if (THIN_TAG_PATHS.has(pathOnly)) return false;
          // タグ統合などで 301 リダイレクトする旧URLも除外。
          if (REDIRECT_SOURCE_PATHS.has(pathOnly)) return false;
        } catch {}
        return true;
      },
      serialize(item) {
        // ページ種別に応じて priority と changefreq を最適化
        const url = item.url;
        if (url.endsWith('/') || url.endsWith('.jp/')) {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        if (url.includes('/guides/')) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        if (url.includes('/tools/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        if (url.includes('/category/')) {
          return { ...item, priority: 0.7, changefreq: 'weekly' };
        }
        if (url.includes('/tags/')) {
          return { ...item, priority: 0.5, changefreq: 'weekly' };
        }
        if (url.includes('/compare')) {
          return { ...item, priority: 0.6, changefreq: 'monthly' };
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
