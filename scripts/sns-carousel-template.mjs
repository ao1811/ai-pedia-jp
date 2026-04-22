/**
 * SNSカルーセル（9スライド）用のHTMLテンプレート生成。
 *
 * 新ダークグラデ・ミニマルスタイル（2026-04-23 標準）。
 * preview-cards.mjs と揃えた共通の見た目で、カバー/問題提起/アイテム×5/比較表/CTA の9枚。
 *
 * buildCarouselHtml(theme, size) => HTML string
 *   size: { width, height, name: 'instagram' | 'tiktok' }
 */

/**
 * スライド共通のラッパースタイル（ダークグラデ + グリッド + ロゴ/カテゴリ）を返す。
 * インライン <style> 内で使う想定。
 */
function commonSlideCss(width, height, isStory) {
  const basePad = isStory ? 84 : 72;
  return `
  .slide {
    width: ${width}px;
    height: ${height}px;
    padding: ${basePad}px;
    position: relative;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    color: #fff;
    overflow: hidden;
    page-break-after: always;
  }
  .slide::before {
    /* テーマ gradient を薄く重ねる（暗めに保つ） */
    content: '';
    position: absolute; inset: 0;
    background: var(--theme-grad);
    opacity: 0.55;
    z-index: 0;
  }
  .slide::after {
    /* 暗化 + グリッドパターン */
    content: '';
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%),
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 100% 100%, 80px 80px, 80px 80px;
    z-index: 1;
  }
  .slide > * { position: relative; z-index: 2; }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${isStory ? 48 : 40}px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: ${isStory ? 34 : 30}px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #fff;
  }
  .logo {
    width: ${isStory ? 52 : 46}px;
    height: ${isStory ? 52 : 46}px;
    border-radius: 12px;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${isStory ? 30 : 26}px;
    font-weight: 900;
    color: #fff;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
  .logo::before { content: '✦'; }
  .category {
    padding: ${isStory ? '12px 28px' : '10px 24px'};
    border-radius: 999px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    color: #fff;
    font-size: ${isStory ? 22 : 20}px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .foot {
    margin-top: auto;
    padding-top: ${isStory ? 32 : 28}px;
    border-top: 1px solid rgba(255,255,255,0.12);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .domain {
    font-size: ${isStory ? 32 : 28}px;
    font-weight: 700;
    background: linear-gradient(90deg, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.01em;
  }
  .page {
    font-size: ${isStory ? 22 : 20}px;
    color: #8a90a8;
    font-weight: 500;
    letter-spacing: 0.08em;
  }

  em {
    font-style: normal;
    background: linear-gradient(90deg, #a78bfa, #f472b6, #fb923c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  `;
}

/** スライド共通のヘッダ/フッタで囲むヘルパー */
function frame(theme, { pageNum, total }, inner) {
  return `
<div class="slide">
  <div class="head">
    <div class="brand"><div class="logo"></div><span>ai-pedia</span></div>
    <div class="category">${theme.category}</div>
  </div>
  ${inner}
  <div class="foot">
    <span class="domain">ai-pedia.jp</span>
    <span class="page">${String(pageNum).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
  </div>
</div>
  `;
}

function coverSlide(theme, isStory, meta) {
  const h1Size = isStory ? 110 : 92;
  const subSize = isStory ? 36 : 32;
  return frame(theme, meta, `
  <div class="body">
    <div style="font-size:${isStory ? 22 : 20}px;letter-spacing:0.18em;color:#c7cbde;font-weight:700;margin-bottom:${isStory ? 48 : 32}px;">
      ${theme.cover.eyebrow}
    </div>
    <div style="font-size:${isStory ? 200 : 160}px;line-height:1;margin-bottom:${isStory ? 48 : 40}px;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.5));">
      ${theme.emoji}
    </div>
    <h1 style="font-size:${h1Size}px;font-weight:900;line-height:1.12;letter-spacing:-0.035em;margin-bottom:${isStory ? 40 : 32}px;max-width:95%;">
      ${theme.cover.h1}
    </h1>
    <p style="font-size:${subSize}px;line-height:1.55;color:#c7cbde;max-width:92%;font-weight:500;">
      ${theme.cover.subtitle}
    </p>
  </div>
  <div style="position:absolute;bottom:${isStory ? 200 : 160}px;right:${isStory ? 84 : 72}px;z-index:2;">
    <div style="display:inline-flex;align-items:center;gap:14px;padding:${isStory ? '16px 32px' : '14px 28px'};border-radius:999px;background:linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2));border:1px solid rgba(167,139,250,0.4);font-size:${isStory ? 24 : 22}px;font-weight:700;color:#fff;">
      SWIPE →
    </div>
  </div>
  `);
}

function problemSlide(theme, isStory, meta) {
  const h2Size = isStory ? 82 : 68;
  const itemSize = isStory ? 34 : 30;
  return frame(theme, meta, `
  <div class="body">
    <div style="font-size:${isStory ? 22 : 20}px;letter-spacing:0.18em;color:#fb923c;font-weight:700;margin-bottom:${isStory ? 32 : 24}px;">
      ⚠ PROBLEM
    </div>
    <h2 style="font-size:${h2Size}px;font-weight:900;line-height:1.18;letter-spacing:-0.03em;margin-bottom:${isStory ? 64 : 48}px;max-width:95%;">
      ${theme.problem.h2}
    </h2>
    <div style="display:flex;flex-direction:column;gap:${isStory ? 28 : 24}px;">
      ${theme.problem.items.map((t, i) => `
        <div style="display:flex;gap:${isStory ? 28 : 24}px;align-items:flex-start;padding:${isStory ? '28px 32px' : '24px 28px'};background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;backdrop-filter:blur(8px);">
          <div style="flex-shrink:0;width:${isStory ? 56 : 48}px;height:${isStory ? 56 : 48}px;border-radius:14px;background:linear-gradient(135deg,#fb923c,#f43f5e);display:flex;align-items:center;justify-content:center;font-size:${isStory ? 28 : 24}px;font-weight:900;color:#fff;">
            ${i + 1}
          </div>
          <p style="font-size:${itemSize}px;line-height:1.5;color:#e4e6f0;font-weight:500;">${t}</p>
        </div>
      `).join('')}
    </div>
  </div>
  `);
}

function itemSlide(theme, item, idx, isStory, meta) {
  const nameSize = isStory ? 88 : 72;
  const catchSize = isStory ? 44 : 38;
  const featSize = isStory ? 30 : 26;
  const badgeSize = isStory ? 22 : 20;
  return frame(theme, meta, `
  <div class="body">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:${isStory ? 24 : 20}px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:${isStory ? 64 : 56}px;height:${isStory ? 64 : 56}px;border-radius:16px;background:linear-gradient(135deg,#a78bfa,#ec4899);font-size:${isStory ? 30 : 26}px;font-weight:900;color:#fff;">
        ${String(idx + 1).padStart(2, '0')}
      </span>
      <span style="font-size:${badgeSize}px;letter-spacing:0.14em;color:#c7cbde;font-weight:700;">
        ${item.vendor}
      </span>
    </div>
    <h2 style="font-size:${nameSize}px;font-weight:900;line-height:1.05;letter-spacing:-0.035em;margin-bottom:${isStory ? 28 : 24}px;">
      ${item.name}
    </h2>
    <p style="font-size:${catchSize}px;line-height:1.25;color:#fff;font-weight:700;margin-bottom:${isStory ? 48 : 36}px;white-space:pre-line;">
      <em>${item.catch}</em>
    </p>
    <div style="display:flex;flex-direction:column;gap:${isStory ? 20 : 16}px;margin-bottom:${isStory ? 40 : 28}px;">
      ${item.features.map((f) => `
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <div style="flex-shrink:0;width:${isStory ? 28 : 24}px;height:${isStory ? 28 : 24}px;border-radius:8px;background:linear-gradient(135deg,#34d399,#06b6d4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${isStory ? 18 : 15}px;font-weight:900;margin-top:4px;">
            ✓
          </div>
          <p style="font-size:${featSize}px;line-height:1.5;color:#e4e6f0;font-weight:500;">${f}</p>
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:${isStory ? 20 : 16}px;flex-wrap:wrap;">
      <div style="padding:${isStory ? '16px 28px' : '14px 24px'};border-radius:999px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);font-size:${badgeSize + 4}px;color:#fde68a;font-weight:700;">
        💴 ${item.price}
      </div>
      <div style="padding:${isStory ? '16px 28px' : '14px 24px'};border-radius:999px;background:rgba(139,92,246,0.12);border:1px solid rgba(167,139,250,0.4);font-size:${badgeSize + 4}px;color:#ddd6fe;font-weight:700;">
        🎯 ${item.audience}
      </div>
    </div>
  </div>
  `);
}

function tableSlide(theme, isStory, meta) {
  const h2Size = isStory ? 70 : 58;
  const cellSize = isStory ? 26 : 22;
  return frame(theme, meta, `
  <div class="body">
    <div style="font-size:${isStory ? 22 : 20}px;letter-spacing:0.18em;color:#34d399;font-weight:700;margin-bottom:${isStory ? 24 : 20}px;">
      🏆 VERDICT
    </div>
    <h2 style="font-size:${h2Size}px;font-weight:900;line-height:1.15;letter-spacing:-0.03em;margin-bottom:${isStory ? 48 : 36}px;max-width:95%;">
      ${theme.table.h2}
    </h2>
    <div style="border:1px solid rgba(255,255,255,0.12);border-radius:24px;overflow:hidden;backdrop-filter:blur(8px);background:rgba(255,255,255,0.03);">
      <div style="display:grid;grid-template-columns:1.3fr 1fr 1.1fr;background:rgba(255,255,255,0.08);font-size:${cellSize}px;font-weight:900;color:#fff;">
        <div style="padding:${isStory ? '20px 28px' : '18px 24px'};border-right:1px solid rgba(255,255,255,0.08);">こんな人に</div>
        <div style="padding:${isStory ? '20px 28px' : '18px 24px'};border-right:1px solid rgba(255,255,255,0.08);">おすすめ</div>
        <div style="padding:${isStory ? '20px 28px' : '18px 24px'};">決め手</div>
      </div>
      ${theme.table.rows.map((row, i) => `
        <div style="display:grid;grid-template-columns:1.3fr 1fr 1.1fr;font-size:${cellSize}px;${i < theme.table.rows.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
          <div style="padding:${isStory ? '22px 28px' : '18px 24px'};border-right:1px solid rgba(255,255,255,0.06);color:#e4e6f0;font-weight:500;">${row[0]}</div>
          <div style="padding:${isStory ? '22px 28px' : '18px 24px'};border-right:1px solid rgba(255,255,255,0.06);color:#fff;font-weight:900;">${row[1]}</div>
          <div style="padding:${isStory ? '22px 28px' : '18px 24px'};color:#c7cbde;font-weight:500;">${row[2]}</div>
        </div>
      `).join('')}
    </div>
  </div>
  `);
}

function ctaSlide(theme, isStory, meta) {
  const h2Size = isStory ? 82 : 68;
  const stepSize = isStory ? 34 : 30;
  return frame(theme, meta, `
  <div class="body" style="justify-content:center;">
    <div style="font-size:${isStory ? 22 : 20}px;letter-spacing:0.18em;color:#f472b6;font-weight:700;margin-bottom:${isStory ? 32 : 24}px;">
      💾 SAVE & FOLLOW
    </div>
    <h2 style="font-size:${h2Size}px;font-weight:900;line-height:1.15;letter-spacing:-0.03em;margin-bottom:${isStory ? 64 : 48}px;max-width:95%;">
      ${theme.cta.h2}
    </h2>
    <div style="display:flex;flex-direction:column;gap:${isStory ? 24 : 20}px;margin-bottom:${isStory ? 56 : 40}px;">
      ${theme.cta.steps.map((s, i) => `
        <div style="display:flex;gap:${isStory ? 28 : 24}px;align-items:center;padding:${isStory ? '28px 32px' : '24px 28px'};background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:20px;">
          <div style="flex-shrink:0;width:${isStory ? 56 : 48}px;height:${isStory ? 56 : 48}px;border-radius:14px;background:linear-gradient(135deg,#a78bfa,#ec4899);display:flex;align-items:center;justify-content:center;font-size:${isStory ? 28 : 24}px;font-weight:900;color:#fff;">
            ${i + 1}
          </div>
          <p style="font-size:${stepSize}px;color:#fff;font-weight:700;">${s}</p>
        </div>
      `).join('')}
    </div>
    <div style="padding:${isStory ? '32px 36px' : '28px 32px'};border-radius:24px;background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(236,72,153,0.25));border:1px solid rgba(167,139,250,0.5);text-align:center;">
      <div style="font-size:${isStory ? 22 : 20}px;color:#ddd6fe;font-weight:700;letter-spacing:0.08em;margin-bottom:10px;">READ THE FULL ARTICLE</div>
      <div style="font-size:${isStory ? 34 : 30}px;color:#fff;font-weight:900;letter-spacing:-0.02em;">${theme.cta.url}</div>
    </div>
  </div>
  `);
}

/**
 * 9スライドを束ねた完全なHTMLを返す。
 * size: { width, height, name }
 */
export function buildCarouselHtml(theme, size) {
  const isStory = size.name === 'tiktok';
  const total = 9;
  let idx = 1;
  const meta = () => ({ pageNum: idx++, total });

  const slides = [
    coverSlide(theme, isStory, meta()),
    problemSlide(theme, isStory, meta()),
    ...theme.items.map((it, i) => itemSlide(theme, it, i, isStory, meta())),
    tableSlide(theme, isStory, meta()),
    ctaSlide(theme, isStory, meta()),
  ];

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${theme.slug} [${size.name}]</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #000;
    font-family: 'Noto Sans JP', system-ui, sans-serif;
    --theme-grad: ${theme.gradient};
  }
  body { display: flex; flex-direction: column; gap: 40px; padding: 40px; }
  ${commonSlideCss(size.width, size.height, isStory)}
</style>
</head>
<body>
${slides.join('\n')}
</body>
</html>`;
}
