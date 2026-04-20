import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ai-pedia.jp',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
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
