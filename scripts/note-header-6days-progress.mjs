/**
 * note 専用：「6日でメディアサイト立ち上げ」記事のヘッダー画像（1280×670）を生成。
 * 本業の合間 × AI で個人サイトが Google 検索順位3位に到達した実績を訴求。
 *
 * 設計：
 *   - 中央：巨大な「3位」（Google 順位）
 *   - 左：「6日 × AI」（時間 × 武器）
 *   - 右：「64記事 / 10クラスター / 24万字」（規模感）
 *   - 下部：「本業の合間 2時間 × 週末4時間」（共感トリガー）
 *   - 右下：「ai-pedia.jp」（ブランド）
 *
 * 出力:
 *   OneDrive/sns/note-headers/note-6days-progress-report.png
 *
 * 使い方:
 *   node scripts/note-header-6days-progress.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_FILE =
  'C:/Users/naoki/OneDrive/sns/note-headers/note-6days-progress-report.png';

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
  /* ベースグラデ（紫→ブルー→シアン、暗め） */
  .bg-grad{
    position:absolute;inset:0;z-index:0;
    background:
      radial-gradient(ellipse at 15% 25%, rgba(139,92,246,0.45) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 20%, rgba(59,130,246,0.40) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.30) 0%, transparent 60%),
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
    padding:42px 56px;
    display:flex;flex-direction:column;
  }

  /* === 上部ヘッダー === */
  .head{display:flex;justify-content:space-between;align-items:center;}
  .brand{display:flex;align-items:center;gap:14px;font-size:22px;font-weight:500;letter-spacing:-0.01em;color:#fff;}
  .logo{
    width:38px;height:38px;border-radius:10px;
    background:linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#7c3aed 100%);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;font-weight:900;color:#fff;
    box-shadow:0 4px 16px rgba(139,92,246,0.5);
  }
  .logo::before{content:'✦';}
  .badge-real{
    display:inline-flex;align-items:center;gap:8px;
    padding:8px 18px;border-radius:999px;
    background:linear-gradient(135deg,rgba(34,211,238,0.18),rgba(59,130,246,0.12));
    border:1.5px solid rgba(34,211,238,0.55);
    color:#67e8f9;font-size:16px;font-weight:900;letter-spacing:0.08em;
  }

  /* === 中央メイン === */
  .body{
    flex:1;display:flex;flex-direction:column;justify-content:center;
    margin-top:8px;
  }

  .lead{
    font-size:30px;font-weight:900;line-height:1.25;
    letter-spacing:-0.02em;color:#fff;
    margin-bottom:12px;
  }
  .lead em{
    font-style:normal;
    background:linear-gradient(90deg,#a78bfa,#22d3ee);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }

  .core-row{display:flex;align-items:center;gap:30px;margin-top:8px;}

  .rank-block{
    display:flex;flex-direction:column;align-items:flex-start;
    flex-shrink:0;
  }
  .rank-label{
    font-size:13px;color:#94a3b8;font-weight:700;
    letter-spacing:0.15em;margin-bottom:0;
    text-transform:uppercase;
  }
  .rank-keyword{font-size:13px;color:#67e8f9;font-weight:700;margin-bottom:6px;letter-spacing:0.02em;}
  .rank-value{
    font-family:'Inter','Noto Sans JP',sans-serif;
    font-size:148px;font-weight:900;line-height:0.9;
    background:linear-gradient(135deg,#fff 0%,#a78bfa 35%,#22d3ee 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    letter-spacing:-0.05em;
    filter:drop-shadow(0 4px 28px rgba(139,92,246,0.45));
    display:flex;align-items:baseline;gap:4px;
  }
  .rank-value .pos{
    font-size:60px;font-weight:900;
    background:linear-gradient(135deg,#fff,#a78bfa);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    margin-left:8px;letter-spacing:-0.04em;
  }

  .vs-divider{
    width:1px;height:140px;
    background:linear-gradient(180deg,transparent,rgba(255,255,255,0.18),transparent);
    flex-shrink:0;
  }

  .stats-block{
    display:flex;flex-direction:column;gap:10px;
    flex-shrink:0;
  }
  .stat-item{display:flex;align-items:baseline;gap:10px;}
  .stat-value{
    font-family:'Inter','Noto Sans JP',sans-serif;
    font-size:30px;font-weight:900;color:#fff;
    letter-spacing:-0.02em;
  }
  .stat-value em{
    font-style:normal;
    color:#22d3ee;
    margin-right:2px;
  }
  .stat-label{font-size:13px;color:#94a3b8;font-weight:500;}

  /* === フッター === */
  .foot{
    margin-top:auto;
    padding-top:14px;
    border-top:1px solid rgba(255,255,255,0.12);
    display:flex;justify-content:space-between;align-items:flex-end;
  }
  .foot-left{
    display:flex;flex-direction:column;gap:4px;
  }
  .foot-tag{
    font-size:13px;color:#94a3b8;font-weight:500;letter-spacing:0.05em;
  }
  .foot-time{
    font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.01em;
  }
  .foot-time em{
    font-style:normal;
    background:linear-gradient(90deg,#a78bfa,#22d3ee);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
  .domain{
    font-size:22px;font-weight:700;
    background:linear-gradient(90deg,#a78bfa,#22d3ee);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    letter-spacing:-0.01em;
  }
</style></head>
<body>
<div class="bg-grad"></div>
<div class="grid-overlay"></div>
<div class="dim"></div>
<div class="frame">
  <div class="head">
    <div class="brand"><div class="logo"></div><span>ai-pedia</span></div>
    <div class="badge-real">⚡ 6日間の実録</div>
  </div>

  <div class="body">
    <div class="lead">
      個人サイトを <em>AI（Claude Code）</em> で公開して6日。<br>
      Googleで「ChatGPT エージェント」で——
    </div>

    <div class="core-row">
      <div class="rank-block">
        <div class="rank-label">Search Console</div>
        <div class="rank-keyword">「チャットgpt エージェント」</div>
        <div class="rank-value"><span>3</span><span class="pos">位</span></div>
      </div>

      <div class="vs-divider"></div>

      <div class="stats-block">
        <div class="stat-item">
          <span class="stat-value"><em>64</em>記事</span>
          <span class="stat-label">/ 公開済み</span>
        </div>
        <div class="stat-item">
          <span class="stat-value"><em>10</em>クラスター</span>
          <span class="stat-label">/ SEO 戦略</span>
        </div>
        <div class="stat-item">
          <span class="stat-value"><em>24</em>万字</span>
          <span class="stat-label">/ 1日で追加</span>
        </div>
      </div>
    </div>
  </div>

  <div class="foot">
    <div class="foot-left">
      <span class="foot-tag">本業ある会社員の作業時間：</span>
      <span class="foot-time"><em>平日 2時間 + 週末 4時間</em>のスキマ時間だけ</span>
    </div>
    <span class="domain">ai-pedia.jp</span>
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
  const sizeKb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✅ 出力: ${OUT_FILE}`);
  console.log(`   サイズ: ${W}×${H}, ${sizeKb} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
