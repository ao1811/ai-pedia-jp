/**
 * SNS 投稿用「記事プレビューカード」を新スタイルで生成する。
 *
 * ユーザーが2026/4/23に指定した「ダークグラデ＋ミニマル」テイスト。
 * 各テーマに対し Instagram/TikTok/OG の3サイズを出力する。
 *
 * 出力先: OneDrive/sns/ai-pedia-contents-YYYY-MM-DD/theme-XX/preview-cards/
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

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
  if (entries.length === 0) throw new Error('ai-pedia-contents-* フォルダが見つかりません');
  return path.join(base, entries[0]);
}

// 5テーマの設定（新記事の frontmatter と一致）
const themes = [
  {
    dir: 'theme-01-claude-design',
    slug: 'claude-design-vs-figma-canva',
    title: 'Claude Design登場で変わるAIデザインツール5選',
    description: 'Anthropicが2026年4月17日に公開した「Claude Design」を中心に、Figma Make・Canva Magic Studio・v0・Microsoft Designerの5ツールを実務目線で徹底比較。',
    category: '比較',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
    date: '2026.04.22',
    readTime: '9',
    featured: true,
  },
  {
    dir: 'theme-02-ai-meeting-notes',
    slug: 'ai-meeting-notes-2026-spring',
    title: 'AI議事録ツール徹底比較5選｜Notta・さくら・JAPAN AI・PLAUD・tl;dv',
    description: '2026年春、国産勢が一気に追い上げ始めたAI議事録市場を徹底比較。週5時間の議事録を30分にするための選び方。',
    category: '比較',
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 50%, #2563eb 100%)',
    date: '2026.04.23',
    readTime: '8',
    featured: true,
  },
  {
    dir: 'theme-03-ai-agents',
    slug: 'ai-agents-for-non-engineers-2026',
    title: '非エンジニアでも使えるAIエージェント5選【2026年4月版】',
    description: 'Microsoft Copilot Cowork・Claude Computer Use・Dify・Coze・ChatGPT Agent Mode 2.0 を実務目線で徹底比較。',
    category: '比較',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #f43f5e 100%)',
    date: '2026.04.23',
    readTime: '9',
    featured: true,
  },
  {
    dir: 'theme-04-chat-ai-trio',
    slug: 'chatgpt-claude-gemini-2026-04',
    title: 'ChatGPT・Claude・Gemini 徹底比較【2026年4月版】',
    description: 'GPT-5.4 / Claude Opus 4.7 / Gemini 2.5 Pro が出揃った2026年4月時点の決定版。8項目で徹底比較します。',
    category: '比較',
    emoji: '⚔️',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #fb923c 100%)',
    date: '2026.04.23',
    readTime: '9',
    featured: true,
  },
  {
    dir: 'theme-05-gemini-for-home',
    slug: 'gemini-for-home-japan-2026',
    title: 'Gemini for Home 日本上陸｜家庭AI元年の選び方',
    description: 'Googleが日本向け早期アクセスを開始。Alexa+・Apple Intelligence・Copilot+ PCと比較しながら「家庭AI元年」を解説。',
    category: 'トレンド',
    emoji: '🏠',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)',
    date: '2026.04.23',
    readTime: '7',
    featured: true,
  },
];

// 3サイズの設定
const sizes = [
  { name: 'instagram', w: 1080, h: 1350 },
  { name: 'tiktok',    w: 1080, h: 1920 },
  { name: 'og',        w: 1200, h: 630  },
];

/**
 * カードのHTML文字列を生成。
 * CSSは size.name に応じてフォントサイズ・パディングを変える。
 */
function buildHtml(t, size) {
  const isOg = size.name === 'og';
  const isStory = size.name === 'tiktok';

  const titleSize = isOg ? 58 : isStory ? 76 : 68;
  const descSize = isOg ? 24 : 30;
  const emojiSize = isOg ? 110 : isStory ? 180 : 160;
  const padding = isOg ? 56 : 72;
  const brandSize = isOg ? 26 : 32;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${size.w}px; height: ${size.h}px; }
  body {
    font-family: 'Noto Sans JP', system-ui, sans-serif;
    background: #0a0a0a;
    color: #fff;
    overflow: hidden;
  }

  .card {
    width: ${size.w}px;
    height: ${size.h}px;
    padding: ${padding}px;
    position: relative;
    display: flex;
    flex-direction: column;
    /* ベースは黒 → 記事の heroGradient を上に薄く重ねる */
    background:
      radial-gradient(circle at 30% 20%, rgba(255,255,255,0.04), transparent 60%),
      ${t.gradient};
    background-blend-mode: overlay, normal;
  }
  .card::before {
    /* ダーク化オーバーレイ（画像に近い黒っぽさを確保） */
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%);
    z-index: 0;
  }
  .card::after {
    /* グリッドパターン */
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 80px 80px;
    z-index: 1;
  }
  .card > * { position: relative; z-index: 2; }

  /* --- ヘッダー（左: ブランド、右: カテゴリ） --- */
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #fff;
    font-size: ${brandSize}px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .logo {
    width: ${brandSize + 16}px;
    height: ${brandSize + 16}px;
    border-radius: ${(brandSize + 16) * 0.25}px;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${brandSize}px;
    font-weight: 900;
    color: #fff;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
  .logo::before { content: '✦'; }
  .category {
    padding: 10px 24px;
    border-radius: 999px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    color: #fff;
    font-size: ${isOg ? 18 : 22}px;
    font-weight: 700;
    letter-spacing: 0.05em;
    backdrop-filter: blur(12px);
  }

  /* --- 中央エリア --- */
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    ${isOg ? 'padding-top: 0;' : 'padding-top: 40px;'}
  }
  .emoji {
    font-size: ${emojiSize}px;
    line-height: 1;
    margin-bottom: ${isOg ? 20 : 40}px;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
  }
  h1 {
    font-size: ${titleSize}px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #fff;
    margin-bottom: ${isOg ? 18 : 32}px;
    max-width: 95%;
  }
  .desc {
    font-size: ${descSize}px;
    line-height: 1.6;
    color: #c7cbde;
    max-width: 92%;
    ${isOg ? 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;' : ''}
  }

  /* --- メタバッジ --- */
  .meta {
    display: flex;
    gap: ${isOg ? 12 : 20}px;
    margin-top: ${isOg ? 24 : 56}px;
    flex-wrap: wrap;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: ${isOg ? '10px 20px' : '14px 28px'};
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff;
    font-size: ${isOg ? 18 : 24}px;
    font-weight: 500;
    font-family: 'Noto Sans JP', sans-serif;
  }
  .badge.featured {
    background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2));
    border-color: rgba(251,191,36,0.5);
    color: #fde68a;
  }

  /* --- フッター --- */
  .foot {
    margin-top: ${isOg ? 24 : 40}px;
    padding-top: ${isOg ? 20 : 32}px;
    border-top: 1px solid rgba(255,255,255,0.12);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .domain {
    font-size: ${isOg ? 26 : 36}px;
    font-weight: 700;
    background: linear-gradient(90deg, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.01em;
  }
  .cta {
    font-size: ${isOg ? 18 : 26}px;
    color: #c7cbde;
    font-weight: 500;
  }
  .cta::after {
    content: ' →';
    color: #a78bfa;
    margin-left: 4px;
    font-weight: 700;
  }
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div class="brand">
      <div class="logo"></div>
      <span>ai-pedia</span>
    </div>
    <div class="category">${t.category}</div>
  </div>

  <div class="body">
    <div class="emoji">${t.emoji}</div>
    <h1>${t.title}</h1>
    <p class="desc">${t.description}</p>
    <div class="meta">
      <span class="badge">📅 ${t.date}</span>
      <span class="badge">⏱ ${t.readTime}分で読める</span>
      ${t.featured ? '<span class="badge featured">⭐ 編集部おすすめ</span>' : ''}
    </div>
  </div>

  <div class="foot">
    <span class="domain">ai-pedia.jp</span>
    <span class="cta">続きはサイトで</span>
  </div>
</div>
</body>
</html>`;
}

async function main() {
  console.log(`📂 対象フォルダ: ${ROOT}`);
  console.log(`🎨 新スタイル: ダークグラデ + ミニマル（2026-04-23 標準）`);

  const browser = await chromium.launch();

  try {
    for (const t of themes) {
      const outDir = path.join(ROOT, t.dir, 'preview-cards');
      fs.mkdirSync(outDir, { recursive: true });
      console.log(`\n▶ ${t.dir}`);

      for (const s of sizes) {
        const html = buildHtml(t, s);
        const context = await browser.newContext({
          viewport: { width: s.w, height: s.h },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        const out = path.join(outDir, `${s.name}.png`);
        await page.screenshot({ path: out, type: 'png', fullPage: false });
        console.log(`  ✔ ${s.name}.png  (${s.w}×${s.h})`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n✅ 全15枚の preview-card を生成完了');
  console.log(`   保存先: ${ROOT}\\theme-XX\\preview-cards\\{instagram|tiktok|og}.png`);
}

main().catch((e) => { console.error(e); process.exit(1); });
