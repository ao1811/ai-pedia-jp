/**
 * SNS投稿用画像の自動生成スクリプト（新スタイル・2026-04-23 標準）。
 *
 * sns-carousel-data.mjs で定義した 5テーマ × 9スライドを、
 * sns-carousel-template.mjs で HTML に流し込み、Playwright で PNG 化。
 *
 * 使い方:
 *   node scripts/sns-images.mjs [フォルダ名]
 *   （フォルダ名省略時は OneDrive/sns/ 直下の最新 ai-pedia-contents-YYYY-MM-DD を自動選択）
 *
 * 出力先:
 *   C:\Users\naoki\OneDrive\sns\ai-pedia-contents-YYYY-MM-DD\theme-XX\images\
 *     instagram\slide-01.png 〜 slide-09.png  (1080×1350)
 *     tiktok\slide-01.png 〜 slide-09.png    (1080×1920)
 *
 * 旧 editorial スタイルの HTML (instagram_carousel.html 等) があっても無視し、
 * すべてコード側で新スタイルの HTML を生成して置き換える。
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { THEMES } from './sns-carousel-data.mjs';
import { buildCarouselHtml } from './sns-carousel-template.mjs';

const ONEDRIVE_BASE = 'C:/Users/naoki/OneDrive/sns';

const argFolder = process.argv[2];
const ROOT = argFolder
  ? path.join(ONEDRIVE_BASE, argFolder)
  : pickLatestContentFolder(ONEDRIVE_BASE);

function pickLatestContentFolder(base) {
  const entries = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('ai-pedia-contents-'))
    .map((d) => d.name)
    .sort()
    .reverse();
  if (entries.length === 0) {
    throw new Error(
      `${base} に ai-pedia-contents-YYYY-MM-DD フォルダが見つかりません`,
    );
  }
  return path.join(base, entries[0]);
}

const SIZES = [
  { name: 'instagram', width: 1080, height: 1350 },
  { name: 'tiktok',    width: 1080, height: 1920 },
];

async function renderTheme(browser, theme) {
  const themeDir = path.join(ROOT, theme.dir);
  fs.mkdirSync(themeDir, { recursive: true });

  for (const size of SIZES) {
    const html = buildCarouselHtml(theme, size);

    // source-of-truth の HTML も書き出し（後から編集・再生成しやすくするため）
    const htmlOut = path.join(
      themeDir,
      size.name === 'instagram' ? 'instagram_carousel.html' : 'tiktok_carousel.html',
    );
    fs.writeFileSync(htmlOut, html, 'utf-8');

    // Playwright で各 .slide を個別に PNG 化
    const outDir = path.join(themeDir, 'images', size.name);
    fs.mkdirSync(outDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);

    const slides = await page.$$('.slide');
    console.log(`  [${size.name}] slides detected: ${slides.length}`);
    for (let i = 0; i < slides.length; i++) {
      const out = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
      await slides[i].screenshot({ path: out, type: 'png' });
    }
    console.log(`  [${size.name}] saved ${slides.length} images → ${path.relative(ROOT, outDir)}`);
    await context.close();
  }
}

async function main() {
  console.log(`📂 対象フォルダ: ${ROOT}`);
  console.log(`🎨 新スタイル: ダークグラデ + ミニマル（2026-04-23 標準）`);
  console.log(`🎯 テーマ数: ${THEMES.length}`);

  const browser = await chromium.launch();
  try {
    for (const theme of THEMES) {
      console.log(`\n▶ ${theme.dir}`);
      await renderTheme(browser, theme);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n✅ 全 ${THEMES.length * SIZES.length * 9} 枚のスライド画像を再生成完了`);
  console.log(`   保存先: ${ROOT}\\theme-XX\\images\\{instagram|tiktok}\\slide-NN.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
