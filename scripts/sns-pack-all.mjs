/**
 * 全記事分の SNS 投稿パック（画像 + 動画 + キャプション）を OneDrive に一括生成。
 *
 * 出力:
 *   C:\Users\naoki\OneDrive\sns\ai-pedia-contents-YYYY-MM-DD\
 *     article-{slug}/
 *       preview-cards/
 *         og.png        (1200×630, OGP・X・Facebook 用)
 *         instagram.png (1080×1350, Instagram 用)
 *         tiktok.png    (1080×1920, TikTok カバー / 縦動画素材)
 *       videos/
 *         tiktok.mp4    (15秒・1080×1920、Buffer の TikTok 投稿用)
 *       post-drafts.md  (X / Instagram / TikTok / LINE のキャプション）
 *
 * 既存の 5 つの「premium テーマ」（hand-crafted な9枚カルーセル・27秒動画あり）には
 * 影響しない。post-drafts.md だけ premium テーマ folder にも作成する。
 *
 * 冪等性: 既に preview-cards/og.png が存在する記事はデフォルトでスキップ。
 *        --force で全件再生成。
 *
 * 使い方:
 *   node scripts/sns-pack-all.mjs              # 不足分のみ生成
 *   node scripts/sns-pack-all.mjs --force      # 全件再生成
 *   node scripts/sns-pack-all.mjs --slug=foo   # 特定記事のみ
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// 出力先：環境変数 SNS_PACK_OUTPUT_DIR があればそれを使う（CI 用）。
// なければデフォルトで OneDrive のローカルパス。
const ONEDRIVE_BASE = process.env.SNS_PACK_OUTPUT_DIR || 'C:/Users/naoki/OneDrive/sns';
const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const SITE_URL = 'https://ai-pedia.jp';
const SITE_HANDLE = '@aipediajp';

// CLI オプション
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const slugFilter = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

// 既存の premium テーマ（hand-crafted 5 テーマ）→ そのまま既存フォルダを使う
const PREMIUM_THEMES = {
  'claude-design-vs-figma-canva': 'theme-01-claude-design',
  'ai-meeting-notes-2026-spring': 'theme-02-ai-meeting-notes',
  'ai-agents-for-non-engineers-2026': 'theme-03-ai-agents',
  'chatgpt-claude-gemini-2026-04': 'theme-04-chat-ai-trio',
  'gemini-for-home-japan-2026': 'theme-05-gemini-for-home',
};

// Tailwind gradient class → CSS gradient stops
const COLORS = {
  'violet-500': '#8b5cf6', 'violet-400': '#a78bfa', 'violet-600': '#7c3aed',
  'fuchsia-500': '#d946ef', 'fuchsia-400': '#e879f9',
  'pink-500': '#ec4899', 'pink-400': '#f472b6',
  'rose-500': '#f43f5e', 'rose-400': '#fb7185',
  'red-500': '#ef4444',
  'orange-500': '#f97316', 'orange-400': '#fb923c',
  'amber-500': '#f59e0b', 'amber-400': '#fbbf24',
  'yellow-500': '#eab308', 'yellow-400': '#facc15',
  'lime-500': '#84cc16',
  'emerald-500': '#10b981', 'emerald-400': '#34d399',
  'teal-500': '#14b8a6', 'teal-400': '#2dd4bf',
  'cyan-500': '#06b6d4', 'cyan-400': '#22d3ee',
  'sky-500': '#0ea5e9', 'sky-400': '#38bdf8',
  'blue-500': '#3b82f6', 'blue-400': '#60a5fa', 'blue-600': '#2563eb',
  'indigo-500': '#6366f1', 'indigo-600': '#4f46e5',
  'purple-500': '#a855f7',
};

/** "from-violet-500 via-fuchsia-500 to-pink-500" → CSS linear-gradient */
function tailwindToCSSGradient(twClass) {
  const tokens = twClass.split(/\s+/).filter(Boolean);
  const stops = [];
  for (const t of tokens) {
    const m = t.match(/^(?:from|via|to)-([\w-]+)/);
    if (m && COLORS[m[1]]) stops.push(COLORS[m[1]]);
  }
  if (stops.length === 0) return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
  if (stops.length === 1) return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[0]} 100%)`;
  if (stops.length === 2) return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 100%)`;
  return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 50%, ${stops[2]} 100%)`;
}

/** frontmatter を簡易パース */
function parseFrontmatter(src) {
  if (!src.startsWith('---')) return null;
  const end = src.indexOf('---', 3);
  if (end === -1) return null;
  const fm = src.slice(3, end);
  const data = {};
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, valRaw] = m;
    const val = valRaw.trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (val === '') {
      data[key] = [];
    } else {
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return data;
}

const CATEGORY_JA = {
  comparison: '比較',
  howto: 'How-to',
  guide: 'ガイド',
  review: 'レビュー',
  trend: 'トレンド',
};

/** 全記事を読み込み */
function loadAllArticles() {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const fm = parseFrontmatter(fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8')) ?? {};
      return {
        slug,
        title: fm.title ?? '',
        description: fm.description ?? '',
        tldr: fm.tldr ?? '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        category: fm.category ?? 'guide',
        publishedAt: fm.publishedAt ?? '',
        updatedAt: fm.updatedAt ?? fm.publishedAt ?? '',
        readTimeMin: fm.readTimeMin ?? '5',
        featured: fm.featured === 'true',
        heroEmoji: fm.heroEmoji ?? '📘',
        heroGradient: fm.heroGradient ?? 'from-violet-500 to-fuchsia-500',
      };
    })
    .filter((a) => a.title);
}

/** preview-cards 用 HTML 生成（共通テンプレート） */
function buildPreviewHtml(a, size) {
  const gradient = tailwindToCSSGradient(a.heroGradient);
  const isOg = size.name === 'og';
  const isStory = size.name === 'tiktok';
  const titleSize = isOg ? 58 : isStory ? 76 : 68;
  const descSize = isOg ? 24 : 30;
  const emojiSize = isOg ? 110 : isStory ? 180 : 160;
  const padding = isOg ? 56 : 72;
  const brandSize = isOg ? 26 : 32;
  const formatted = (a.publishedAt || '').replace(/-/g, '.');

  const cleanTitle = a.title.split('｜')[0];
  const desc = a.description || a.tldr || '';

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:${size.w}px;height:${size.h}px;}
  body{font-family:'Noto Sans JP',system-ui,sans-serif;background:#0a0a0a;color:#fff;overflow:hidden;}
  .card{width:${size.w}px;height:${size.h}px;padding:${padding}px;position:relative;display:flex;flex-direction:column;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,0.04),transparent 60%),${gradient};background-blend-mode:overlay,normal;}
  .card::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.85) 100%);z-index:0;}
  .card::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:80px 80px;z-index:1;}
  .card>*{position:relative;z-index:2;}
  .head{display:flex;justify-content:space-between;align-items:center;}
  .brand{display:flex;align-items:center;gap:16px;color:#fff;font-size:${brandSize}px;font-weight:500;letter-spacing:-0.01em;}
  .logo{width:${brandSize+16}px;height:${brandSize+16}px;border-radius:${(brandSize+16)*0.25}px;background:linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%);display:flex;align-items:center;justify-content:center;font-size:${brandSize}px;font-weight:900;color:#fff;box-shadow:0 4px 20px rgba(139,92,246,0.5);}
  .logo::before{content:'✦';}
  .category{padding:10px 24px;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:${isOg?18:22}px;font-weight:700;letter-spacing:0.05em;backdrop-filter:blur(12px);}
  .body{flex:1;display:flex;flex-direction:column;justify-content:center;${isOg?'padding-top:0;':'padding-top:40px;'}}
  .emoji{font-size:${emojiSize}px;line-height:1;margin-bottom:${isOg?20:40}px;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.5));}
  h1{font-size:${titleSize}px;font-weight:900;line-height:1.15;letter-spacing:-0.03em;color:#fff;margin-bottom:${isOg?18:32}px;max-width:95%;}
  .desc{font-size:${descSize}px;line-height:1.6;color:#c7cbde;max-width:92%;${isOg?'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;':''}}
  .meta{display:flex;gap:${isOg?12:20}px;margin-top:${isOg?24:56}px;flex-wrap:wrap;}
  .badge{display:inline-flex;align-items:center;gap:12px;padding:${isOg?'10px 20px':'14px 28px'};border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:${isOg?18:24}px;font-weight:500;}
  .foot{margin-top:${isOg?24:40}px;padding-top:${isOg?20:32}px;border-top:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;}
  .domain{font-size:${isOg?26:36}px;font-weight:700;background:linear-gradient(90deg,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.01em;}
  .cta{font-size:${isOg?18:26}px;color:#c7cbde;font-weight:500;}
  .cta::after{content:' →';color:#a78bfa;margin-left:4px;font-weight:700;}
</style></head><body><div class="card">
<div class="head"><div class="brand"><div class="logo"></div><span>ai-pedia</span></div><div class="category">${CATEGORY_JA[a.category] || a.category}</div></div>
<div class="body"><div class="emoji">${a.heroEmoji}</div><h1>${cleanTitle}</h1><p class="desc">${desc}</p>
<div class="meta">${formatted ? `<span class="badge">📅 ${formatted}</span>` : ''}<span class="badge">⏱ ${a.readTimeMin}分で読める</span>${a.featured ? '<span class="badge" style="background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(249,115,22,0.2));border-color:rgba(251,191,36,0.5);color:#fde68a;">⭐ 編集部おすすめ</span>' : ''}</div></div>
<div class="foot"><span class="domain">ai-pedia.jp</span><span class="cta">続きはサイトで</span></div>
</div></body></html>`;
}

const SIZES = [
  { name: 'instagram', w: 1080, h: 1350 },
  { name: 'tiktok',    w: 1080, h: 1920 },
  { name: 'og',        w: 1200, h: 630  },
];

/** preview-cards 3サイズを生成 */
async function generatePreviewCards(browser, a, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const s of SIZES) {
    const outFile = path.join(outDir, `${s.name}.png`);
    if (!FORCE && fs.existsSync(outFile)) continue;
    const html = buildPreviewHtml(a, s);
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: outFile, type: 'png', fullPage: false });
    await ctx.close();
  }
}

/**
 * auto-article 用 5スライド HTML を生成。
 * 各スライドは同じダークグラデ＋グリッド背景で、テキスト内容だけが変わる。
 * 1080×1920（TikTok 縦長）固定。
 */
function buildAutoSlideHtml(a, slideIndex) {
  const gradient = tailwindToCSSGradient(a.heroGradient);
  const cleanTitle = a.title.split('｜')[0];
  const desc = a.description || a.tldr || '';
  const tldr = a.tldr || '';
  const url = `${SITE_URL}/guides/${a.slug}`;
  const cat = CATEGORY_JA[a.category] || a.category;

  // スライドごとの中央コンテンツ
  let bodyHtml = '';
  let pageNum = `${slideIndex} / 5`;

  if (slideIndex === 1) {
    // Cover: 大きな絵文字 + タイトル
    bodyHtml = `
      <div class="emoji-xl">${a.heroEmoji}</div>
      <h1 class="title-xl">${cleanTitle}</h1>
      <p class="lead">${desc.slice(0, 80)}</p>
      <div class="swipe">SWIPE →</div>
    `;
  } else if (slideIndex === 2) {
    // Hook: TLDR を引用風に
    const hook = tldr || desc;
    bodyHtml = `
      <div class="eyebrow">💡 KEY POINT</div>
      <h2 class="hook">${hook.slice(0, 200)}</h2>
    `;
  } else if (slideIndex === 3) {
    // Description: 詳細説明
    bodyHtml = `
      <div class="eyebrow">📖 ABOUT</div>
      <h2 class="title-md">${cleanTitle}</h2>
      <p class="desc-lg">${desc}</p>
    `;
  } else if (slideIndex === 4) {
    // Highlights: タグを 3つ並べる
    const tags = a.tags.slice(0, 3);
    const items = tags.length > 0
      ? tags.map((t, i) => `<div class="point"><div class="point-num">${i + 1}</div><div class="point-text">${t}</div></div>`).join('')
      : `<div class="point"><div class="point-num">1</div><div class="point-text">用途別の最適解</div></div>
         <div class="point"><div class="point-num">2</div><div class="point-text">料金の比較</div></div>
         <div class="point"><div class="point-num">3</div><div class="point-text">実務での使い分け</div></div>`;
    bodyHtml = `
      <div class="eyebrow">🎯 HIGHLIGHTS</div>
      <h2 class="title-md">この記事のポイント</h2>
      <div class="points">${items}</div>
    `;
  } else {
    // CTA: URL + 続きはサイトで
    bodyHtml = `
      <div class="eyebrow">💾 SAVE & READ</div>
      <h2 class="title-md">続きは ai-pedia.jp で</h2>
      <div class="url-box">
        <div class="url-label">READ THE FULL ARTICLE</div>
        <div class="url-text">${url.replace('https://', '')}</div>
      </div>
      <div class="cta-action">@aipediajp をフォローしてね</div>
    `;
    pageNum = '5 / 5';
  }

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:1080px;height:1920px;}
  body{font-family:'Noto Sans JP',system-ui,sans-serif;background:#0a0a0a;color:#fff;overflow:hidden;}
  .slide{width:1080px;height:1920px;padding:84px;position:relative;display:flex;flex-direction:column;}
  .slide::before{content:'';position:absolute;inset:0;background:${gradient};opacity:0.55;z-index:0;}
  .slide::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.85) 100%),linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:100% 100%,80px 80px,80px 80px;z-index:1;}
  .slide>*{position:relative;z-index:2;}
  .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:48px;}
  .brand{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:500;color:#fff;}
  .logo{width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;box-shadow:0 4px 20px rgba(139,92,246,0.5);}
  .logo::before{content:'✦';}
  .category{padding:12px 28px;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:22px;font-weight:700;letter-spacing:0.05em;}
  .body{flex:1;display:flex;flex-direction:column;justify-content:center;}

  /* slide 1 (cover) */
  .emoji-xl{font-size:280px;line-height:1;margin-bottom:48px;text-align:center;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.5));}
  .title-xl{font-size:96px;font-weight:900;line-height:1.1;letter-spacing:-0.035em;text-align:center;margin-bottom:32px;}
  .lead{font-size:32px;line-height:1.5;color:#c7cbde;text-align:center;font-weight:500;}
  .swipe{position:absolute;bottom:160px;right:84px;display:inline-flex;align-items:center;gap:12px;padding:14px 28px;border-radius:999px;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(236,72,153,0.25));border:1px solid rgba(167,139,250,0.5);font-size:24px;font-weight:700;color:#fff;}

  /* slide 2 (hook) */
  .eyebrow{font-size:24px;letter-spacing:0.18em;color:#fb923c;font-weight:700;margin-bottom:36px;}
  .hook{font-size:84px;font-weight:900;line-height:1.2;letter-spacing:-0.03em;color:#fff;}

  /* slide 3 (description) */
  .title-md{font-size:64px;font-weight:900;line-height:1.18;letter-spacing:-0.03em;margin-bottom:48px;}
  .desc-lg{font-size:38px;line-height:1.55;color:#e4e6f0;font-weight:500;}

  /* slide 4 (highlights) */
  .points{display:flex;flex-direction:column;gap:32px;margin-top:24px;}
  .point{display:flex;align-items:center;gap:32px;padding:32px 40px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:24px;}
  .point-num{flex-shrink:0;width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#a78bfa,#ec4899);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#fff;}
  .point-text{font-size:36px;color:#fff;font-weight:700;}

  /* slide 5 (cta) */
  .url-box{padding:48px;border-radius:32px;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(236,72,153,0.25));border:2px solid rgba(167,139,250,0.5);text-align:center;margin-bottom:48px;}
  .url-label{font-size:24px;color:#ddd6fe;font-weight:700;letter-spacing:0.12em;margin-bottom:16px;}
  .url-text{font-size:42px;color:#fff;font-weight:900;letter-spacing:-0.01em;word-break:break-all;}
  .cta-action{text-align:center;font-size:32px;color:#c7cbde;font-weight:500;}

  .foot{margin-top:auto;padding-top:32px;border-top:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;}
  .domain{font-size:32px;font-weight:700;background:linear-gradient(90deg,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.01em;}
  .page{font-size:22px;color:#8a90a8;font-weight:500;letter-spacing:0.08em;}
</style></head><body><div class="slide">
<div class="head"><div class="brand"><div class="logo"></div><span>ai-pedia</span></div><div class="category">${cat}</div></div>
<div class="body">${bodyHtml}</div>
<div class="foot"><span class="domain">ai-pedia.jp</span><span class="page">${pageNum}</span></div>
</div></body></html>`;
}

/** auto-article 用 5スライド PNG を生成（1080×1920） */
async function generateAutoSlides(browser, a, slidesDir) {
  fs.mkdirSync(slidesDir, { recursive: true });
  for (let i = 1; i <= 5; i++) {
    const outFile = path.join(slidesDir, `slide-${String(i).padStart(2, '0')}.png`);
    if (!FORCE && fs.existsSync(outFile)) continue;
    const html = buildAutoSlideHtml(a, i);
    const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: outFile, type: 'png', fullPage: false });
    await ctx.close();
  }
}

/** 5枚のスライドから 22秒の MP4（クロスフェード）を生成 */
function generateAutoSlideshow(slidesDir, outMp4) {
  if (!FORCE && fs.existsSync(outMp4)) return;
  fs.mkdirSync(path.dirname(outMp4), { recursive: true });

  const SLIDE_DURATION = 4.0;
  const FADE_DURATION = 0.4;
  const slides = Array.from({ length: 5 }, (_, i) =>
    path.join(slidesDir, `slide-${String(i + 1).padStart(2, '0')}.png`),
  );
  for (const s of slides) {
    if (!fs.existsSync(s)) {
      console.log(`  ⚠ missing slide ${path.basename(s)}, skipping video`);
      return;
    }
  }

  const args = ['-y'];
  for (const s of slides) {
    args.push('-loop', '1', '-t', String(SLIDE_DURATION), '-i', s);
  }
  let filter = '';
  for (let i = 0; i < slides.length; i++) {
    filter += `[${i}:v]scale=1080:1920,setsar=1,fps=30[v${i}];`;
  }
  let prev = 'v0';
  let cumulativeOffset = SLIDE_DURATION - FADE_DURATION;
  for (let i = 1; i < slides.length; i++) {
    const out = i === slides.length - 1 ? 'vout' : `vx${i}`;
    filter += `[${prev}][v${i}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${cumulativeOffset.toFixed(2)}[${out}];`;
    prev = out;
    cumulativeOffset += SLIDE_DURATION - FADE_DURATION;
  }
  filter = filter.replace(/;$/, '');

  args.push('-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', outMp4);

  try {
    execFileSync('ffmpeg', args, { stdio: 'pipe' });
  } catch (e) {
    console.error(`  ✗ slideshow video failed:`, String(e.stderr || e.message).slice(-300));
  }
}

/** post-drafts.md 生成 */
function buildPostDrafts(a) {
  const url = `${SITE_URL}/guides/${a.slug}`;
  const hashtagsX = [...a.tags.slice(0, 3), 'AIpedia'].map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, '')).join(' ');
  const hashtagsIG = [...a.tags, 'AIpedia', 'AIツール', '生成AI', '非エンジニア'].slice(0, 10).map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, '')).join(' ');
  const hashtagsTT = [...a.tags.slice(0, 3), 'AI', 'AIツール', '生成AI'].map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, '')).join(' ');
  const cleanTitle = a.title.split('｜')[0];
  const summary = a.tldr || a.description;

  const x = `${a.heroEmoji} ${cleanTitle}\n\n${(summary || '').slice(0, 140)}\n\n続きはこちら👇\n${url}\n\n${hashtagsX}`;
  const ig = `${a.heroEmoji} ${cleanTitle}\n\n${summary}\n\n━━━━━━━━━━\n📖 続きはプロフのリンクから\n🔗 ${url}\n━━━━━━━━━━\n\n${hashtagsIG}`;
  const tt = `${a.heroEmoji} ${(summary || '').slice(0, 80)}\n\nプロフからサイトへ ${hashtagsTT}`;
  const line = `${a.heroEmoji} ${cleanTitle}\n\n${summary}\n\n詳しくは👉 ${url}`;

  return `# ${cleanTitle}

**元記事**: ${url}
**カテゴリ**: ${CATEGORY_JA[a.category] || a.category}
**タグ**: ${a.tags.join(', ')}

---

## X · ${SITE_HANDLE}

\`\`\`
${x}
\`\`\`

---

## Instagram · @ai_pedia.jp

**キャプション**:

\`\`\`
${ig}
\`\`\`

**画像**: \`preview-cards/instagram.png\` または 9枚カルーセル（premium テーマのみ）

**Buffer 投稿手順**:
1. Buffer ダッシュボード → New Post → Instagram
2. キャプション貼り付け
3. \`preview-cards/instagram.png\` をアップロード
4. Add to Queue（事前設定の枠で自動投稿）

---

## TikTok · ${SITE_HANDLE}

\`\`\`
${tt}
\`\`\`

**動画**: \`videos/tiktok.mp4\`（15秒、1080×1920）

**Buffer 投稿手順**:
1. New Post → TikTok
2. 上記動画をアップロード
3. キャプション貼り付け
4. Schedule Post で 18:00〜21:00 に設定

---

## LINE VOOM

\`\`\`
${line}
\`\`\`

---

## 推奨投稿時間

- **Instagram**: 平日 7:30 / 12:30 / 20:00、週末 10:00
- **TikTok**: 平日 18:00 / 21:00、週末 11:00 / 20:00
- **X**: 平日 8:00 / 12:00 / 19:00、週末 10:00

---

*このファイルは scripts/sns-pack-all.mjs により自動生成されました。*
`;
}

/** メイン */
async function main() {
  const today = new Date().toISOString().slice(0, 10);
  // 既存の最新フォルダを再利用、なければ今日付で新規作成
  const allDirs = fs.readdirSync(ONEDRIVE_BASE, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('ai-pedia-contents-'))
    .map((d) => d.name).sort().reverse();
  const ROOT = allDirs.length > 0
    ? path.join(ONEDRIVE_BASE, allDirs[0])
    : path.join(ONEDRIVE_BASE, `ai-pedia-contents-${today}`);
  fs.mkdirSync(ROOT, { recursive: true });
  console.log(`📂 出力先: ${ROOT}`);

  const articles = loadAllArticles().filter((a) => !slugFilter || a.slug === slugFilter);
  console.log(`📝 対象記事: ${articles.length} 本`);

  const browser = await chromium.launch();
  try {
    let processed = 0;
    let skipped = 0;
    for (const a of articles) {
      const folderName = PREMIUM_THEMES[a.slug] || `article-${a.slug}`;
      const folder = path.join(ROOT, folderName);
      const isPremium = !!PREMIUM_THEMES[a.slug];

      const previewDir = path.join(folder, 'preview-cards');
      const videoFile = path.join(folder, 'videos', 'tiktok.mp4');
      const draftsFile = path.join(folder, 'post-drafts.md');

      const ogPng = path.join(previewDir, 'og.png');
      const tiktokPng = path.join(previewDir, 'tiktok.png');

      // preview-cards 生成（premiumも含めて、og.png が無ければ作る）
      if (FORCE || !fs.existsSync(ogPng)) {
        await generatePreviewCards(browser, a, previewDir);
      }

      // TikTok video
      // - premium テーマは既に hand-crafted な9スライド動画があるのでスキップ
      // - auto-article は 5スライドショー動画を生成（cover/hook/desc/highlights/cta）
      if (!isPremium) {
        const slidesDir = path.join(folder, 'images', 'tiktok-slides');
        if (FORCE || !fs.existsSync(path.join(slidesDir, 'slide-05.png'))) {
          await generateAutoSlides(browser, a, slidesDir);
        }
        if (FORCE || !fs.existsSync(videoFile)) {
          generateAutoSlideshow(slidesDir, videoFile);
        }
      }

      // post-drafts.md は常に最新化
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(draftsFile, buildPostDrafts(a), 'utf-8');

      console.log(`  ✓ ${folderName}${isPremium ? ' [premium]' : ''}`);
      processed++;
    }
    console.log(`\n✅ 完了: ${processed} 記事処理 (${skipped} スキップ)`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
