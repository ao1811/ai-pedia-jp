/**
 * SNS投稿用画像の自動生成スクリプト。
 *
 * Desktop 上の Instagram カルーセル HTML からスライド9枚ずつ画像化し、
 * TikTok 縦長版（1080×1920）も同時に生成。
 *
 * 使い方:
 *   node scripts/sns-images.mjs
 *
 * 出力先:
 *   C:\Users\naoki\Desktop\ai-pedia-contents-2026-04-22\theme-XX\images\
 *     instagram\slide-01.png 〜 slide-09.png  (1080×1350)
 *     tiktok\slide-01.png 〜 slide-09.png    (1080×1920)
 */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = 'C:/Users/naoki/Desktop/ai-pedia-contents-2026-04-22';

const themes = [
  { dir: 'theme-01-claude-design',      slug: 'claude-design-vs-figma-canva' },
  { dir: 'theme-02-ai-meeting-notes',   slug: 'ai-meeting-notes-2026-spring' },
  { dir: 'theme-03-ai-agents',          slug: 'ai-agents-for-non-engineers-2026' },
  { dir: 'theme-04-chat-ai-trio',       slug: 'chatgpt-claude-gemini-2026-04' },
  { dir: 'theme-05-gemini-for-home',    slug: 'gemini-for-home-japan-2026' },
];

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
