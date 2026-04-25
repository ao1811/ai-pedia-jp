/**
 * note 専用：「無料AI 5本コンボ」記事のヘッダー画像（1280×670）を生成。
 * 月¥3,000（取消線）→ 月¥0 のビフォーアフター対比で視線を止める設計。
 *
 * 出力: OneDrive/sns/.../article-free-ai-ranking-2026/preview-cards/note-header.png
 *
 * 使い方:
 *   node scripts/note-header-free-ai.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_FILE =
  'C:/Users/naoki/OneDrive/sns/ai-pedia-contents-2026-04-22/article-free-ai-ranking-2026/preview-cards/note-header.png';

const W = 1280;
const H = 670;

const HTML = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Inter:wght@900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:${W}px;height:${H}px;}
  body{
    font-family:'Noto Sans JP',system-ui,sans-serif;
    background:#0a0a0a;
    color:#fff;
    overflow:hidden;
    position:relative;
  }
  /* ベースグラデ（紫→ピンク→オレンジ、暗め） */
  .bg-grad{
    position:absolute;inset:0;z-index:0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(139,92,246,0.45) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.40) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 0%, rgba(251,146,60,0.25) 0%, transparent 60%),
      #0a0a0a;
  }
  /* グリッド */
  .grid-overlay{
    position:absolute;inset:0;z-index:1;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }
  /* 暗化ベール */
  .dim{
    position:absolute;inset:0;z-index:2;
    background:linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.55) 100%);
  }
  /* メインフレーム */
  .frame{
    position:relative;z-index:3;
    width:${W}px;height:${H}px;
    padding:48px 64px;
    display:flex;flex-direction:column;
  }

  /* === 上部ヘッダー === */
  .head{display:flex;justify-content:space-between;align-items:center;}
  .brand{display:flex;align-items:center;gap:14px;font-size:24px;font-weight:500;letter-spacing:-0.01em;color:#fff;}
  .logo{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;font-weight:900;color:#fff;
    box-shadow:0 4px 16px rgba(139,92,246,0.5);
  }
  .logo::before{content:'✦';}
  .badge-free{
    display:inline-flex;align-items:center;gap:8px;
    padding:8px 18px;border-radius:999px;
    background:linear-gradient(135deg,rgba(34,197,94,0.18),rgba(34,197,94,0.08));
    border:1.5px solid rgba(34,197,94,0.55);
    color:#86efac;font-size:18px;font-weight:900;letter-spacing:0.05em;
  }

  /* === 中央メイン === */
  .body{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:24px;}

  .compare-wrap{display:flex;align-items:flex-end;gap:48px;margin-bottom:36px;}

  .strike-block{display:flex;flex-direction:column;align-items:flex-start;}
  .strike-label{font-size:18px;color:#fca5a5;font-weight:700;letter-spacing:0.1em;margin-bottom:6px;}
  .strike-price{
    font-family:'Inter','Noto Sans JP',sans-serif;
    font-size:80px;font-weight:900;line-height:1;
    color:#9ca3af;
    text-decoration:line-through;
    text-decoration-color:rgba(244,63,94,0.85);
    text-decoration-thickness:8px;
    letter-spacing:-0.04em;
    position:relative;
  }

  .arrow{
    font-size:64px;color:#fb923c;line-height:0.8;
    transform:translateY(-12px);
    text-shadow:0 0 24px rgba(251,146,60,0.6);
  }

  .now-block{display:flex;flex-direction:column;align-items:flex-start;}
  .now-label{font-size:18px;color:#86efac;font-weight:700;letter-spacing:0.1em;margin-bottom:6px;}
  .now-price{
    font-family:'Inter','Noto Sans JP',sans-serif;
    font-size:140px;font-weight:900;line-height:0.9;
    background:linear-gradient(135deg,#fff 0%,#a7f3d0 50%,#86efac 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    letter-spacing:-0.05em;
    filter:drop-shadow(0 4px 24px rgba(134,239,172,0.4));
  }

  .lead{font-size:34px;font-weight:900;line-height:1.3;letter-spacing:-0.02em;color:#fff;margin-bottom:20px;}
  .lead em{font-style:normal;background:linear-gradient(90deg,#fb923c,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

  .tools{
    display:flex;align-items:center;gap:12px;flex-wrap:wrap;
    font-size:18px;color:#c7cbde;font-weight:500;
  }
  .tool-pill{
    padding:6px 14px;border-radius:999px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
    color:#fff;font-weight:700;font-size:16px;
  }

  /* === フッター === */
  .foot{
    margin-top:auto;
    padding-top:18px;
    border-top:1px solid rgba(255,255,255,0.12);
    display:flex;justify-content:space-between;align-items:center;
  }
  .domain{
    font-size:24px;font-weight:700;
    background:linear-gradient(90deg,#a78bfa,#f472b6);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    letter-spacing:-0.01em;
  }
  .meta{font-size:16px;color:#8a90a8;font-weight:500;}
</style></head>
<body>
<div class="bg-grad"></div>
<div class="grid-overlay"></div>
<div class="dim"></div>
<div class="frame">
  <div class="head">
    <div class="brand"><div class="logo"></div><span>ai-pedia</span></div>
    <div class="badge-free">🆓 完全無料</div>
  </div>

  <div class="body">
    <div class="compare-wrap">
      <div class="strike-block">
        <div class="strike-label">月の課金</div>
        <div class="strike-price">¥3,000</div>
      </div>
      <div class="arrow">→</div>
      <div class="now-block">
        <div class="now-label">2026年の現実</div>
        <div class="now-price">¥0</div>
      </div>
    </div>

    <div class="lead">
      無料AI <em>5本コンボ</em>で、<br>
      ホワイトカラー業務の<em>8割</em>が回る時代。
    </div>

    <div class="tools">
      <span class="tool-pill">Gemini</span>
      <span class="tool-pill">ChatGPT</span>
      <span class="tool-pill">Claude</span>
      <span class="tool-pill">Perplexity</span>
      <span class="tool-pill">Copilot</span>
    </div>
  </div>

  <div class="foot">
    <span class="domain">ai-pedia.jp</span>
    <span class="meta">9分で読める · 2026年4月版</span>
  </div>
</div>
</body></html>`;

async function main() {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  console.log('🎨 note ヘッダー画像を生成中...');
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(HTML, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: OUT_FILE, type: 'png', fullPage: false });
    await ctx.close();
  } finally {
    await browser.close();
  }
  const sizeMb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✅ 出力: ${OUT_FILE}`);
  console.log(`   サイズ: ${W}×${H}, ${sizeMb} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
