/**
 * SNS投稿用画像の自動生成スクリプト。
 *
 * OneDrive\sns\ 配下の Instagram カルーセル HTML からスライド9枚ずつ画像化し、
 * TikTok 縦長版（1080×1920）も同時に生成。
 * OneDriveに保存することで全端末から編集可能、バックアップも自動。
 *
 * 使い方:
 *   node scripts/sns-images.mjs [フォルダ名]
 *   （フォルダ名省略時は ROOT 直下の最新 ai-pedia-contents-YYYY-MM-DD を自動選択）
 *
 * 出力先:
 *   C:\Users\naoki\OneDrive\sns\ai-pedia-contents-YYYY-MM-DD\theme-XX\images\
 *     instagram\slide-01.png 〜 slide-09.png  (1080×1350)
 *     tiktok\slide-01.png 〜 slide-09.png    (1080×1920)
 */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ONEDRIVE_BASE = 'C:/Users/naoki/OneDrive/sns';

// CLI 引数でフォルダ名指定可、なければ最新の ai-pedia-contents-* を自動選択
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

console.log(`📂 対象フォルダ: ${ROOT}`);

// ROOT 直下の theme-XX-*/ フォルダを自動検出
const themes = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^theme-\d+/.test(d.name))
  .map((d) => ({ dir: d.name }))
  .sort((a, b) => a.dir.localeCompare(b.dir));
console.log(`🎯 テーマ数: ${themes.length}`);

/** フォント読み込みを待機するため一定時間待つ */
async function waitForFonts(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
}

async function captureSlides(browser, htmlPath, outDir, viewport) {
  fs.mkdirSync(outDir, { recursive: true });
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const url = pathToFileURL(htmlPath).href;
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForFonts(page);

  const slides = await page.$$('.slide');
  console.log(`  → ${slides.length} slides detected in ${path.basename(htmlPath)}`);
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: out, type: 'png' });
    console.log(`    saved ${path.basename(out)}`);
  }
  await context.close();
}

async function generateTikTokHtml(srcHtmlPath, destHtmlPath) {
  // Instagram版HTMLを読み込み、.slideのサイズを縦長に書き換える
  const srcHtml = fs.readFileSync(srcHtmlPath, 'utf-8');
  const tiktokHtml = srcHtml
    // スライドサイズを 1080x1920 に
    .replace(
      /\.slide\s*\{\s*width:1080px;\s*height:1350px;/,
      '.slide { width:1080px; height:1920px;',
    )
    // ブランドフッターの @ai_pedia.jp をTikTok版に置換
    .replace(/AI-PEDIA\.JP/g, '@AI_PEDIA_JP · TIKTOK')
    // タイトル（head）にTikTokを追記
    .replace(/<title>([^<]*)<\/title>/, '<title>[TikTok縦長版] $1</title>');

  fs.writeFileSync(destHtmlPath, tiktokHtml, 'utf-8');
  console.log(`  TikTok HTML saved: ${path.basename(destHtmlPath)}`);
}

async function main() {
  console.log('▶ Launching headless Chromium...');
  const browser = await chromium.launch();

  try {
    for (const theme of themes) {
      console.log(`\n📂 ${theme.dir}`);
      const themeDir = path.join(ROOT, theme.dir);
      const instagramHtml = path.join(themeDir, 'instagram_carousel.html');
      if (!fs.existsSync(instagramHtml)) {
        console.log(`  ✗ skip (HTML not found)`);
        continue;
      }

      // Instagram版（1080x1350）
      const igOut = path.join(themeDir, 'images', 'instagram');
      await captureSlides(browser, instagramHtml, igOut, { width: 1080, height: 1350 });

      // TikTok版（1080x1920）
      const tiktokHtml = path.join(themeDir, 'tiktok_carousel.html');
      await generateTikTokHtml(instagramHtml, tiktokHtml);
      const ttOut = path.join(themeDir, 'images', 'tiktok');
      await captureSlides(browser, tiktokHtml, ttOut, { width: 1080, height: 1920 });
    }
  } finally {
    await browser.close();
  }

  console.log('\n✅ All SNS images generated!');
  console.log(`   Location: ${ROOT}\\theme-XX\\images\\{instagram|tiktok}\\`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
