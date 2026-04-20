#!/usr/bin/env node
/**
 * SNS投稿テンプレートを一括PNG書き出しするスクリプト。
 *
 * 使い方:
 *   # ターミナル1
 *   npm run dev
 *   # ターミナル2（デフォルトは http://localhost:4322）
 *   npm run sns:export
 *
 *   # 別ポートを使う場合
 *   SNS_BASE_URL=http://localhost:4321 npm run sns:export
 *
 * 出力先: sns-exports/
 */

import { chromium } from 'playwright';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'sns-exports');

const BASE_URL = process.env.SNS_BASE_URL ?? 'http://localhost:4322';

// guides フォルダから slug を列挙
function listGuideSlugs() {
  const guidesDir = resolve(rootDir, 'src/content/guides');
  return readdirSync(guidesDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

function buildTargets() {
  const fixed = [
    { url: '/sns/icon', name: 'icon-512x512' },
    { url: '/sns/intro', name: 'intro-1080x1080' },
    { url: '/sns/ranking', name: 'ranking-1080x1080' },
    { url: '/sns/story', name: 'story-1080x1920' },
  ];
  const guides = listGuideSlugs().map((slug) => ({
    url: `/sns/guide/${slug}`,
    name: `guide-${slug}-1080x1080`,
  }));
  return [...fixed, ...guides];
}

async function main() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const targets = buildTargets();
  console.log(`▶ SNS export start: ${targets.length} images → ${outDir}`);
  console.log(`  base URL: ${BASE_URL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  let ok = 0;
  let fail = 0;
  for (const t of targets) {
    const url = `${BASE_URL}${t.url}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      const canvas = page.locator('#canvas');
      await canvas.waitFor({ state: 'visible', timeout: 10000 });

      // canvas の実サイズを取得して viewport を合わせる（余白を切る）
      const box = await canvas.boundingBox();
      if (!box) throw new Error('no bounding box for #canvas');

      // スクリーンショット（element screenshot は等倍で canvas だけ切り出す）
      const outPath = join(outDir, `${t.name}.png`);
      await canvas.screenshot({ path: outPath, omitBackground: false });
      console.log(`  ✓ ${t.name}.png  (${Math.round(box.width)}x${Math.round(box.height)})`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${t.name}  (${url})  → ${err.message}`);
      fail++;
    }
  }

  await browser.close();

  console.log(`\n✓ done: ${ok} success / ${fail} fail`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
