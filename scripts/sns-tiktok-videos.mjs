/**
 * TikTok 用スライドショー動画を 9枚スライド PNG から生成するスクリプト。
 *
 * 入力:
 *   OneDrive/sns/ai-pedia-contents-YYYY-MM-DD/theme-XX/images/tiktok/slide-01..09.png
 *   （sns-images.mjs が生成済みの 1080×1920 縦長スライド）
 *
 * 出力:
 *   OneDrive/sns/ai-pedia-contents-YYYY-MM-DD/theme-XX/videos/tiktok.mp4
 *
 * 仕様:
 *   - 各スライド 3秒 × 9枚 = 27秒
 *   - 1080×1920、30fps、H.264、AAC（音声は無音）
 *   - スライド間にクロスフェード 0.3秒
 *   - TikTok の最短動画（3秒以上）と最大長（10分以内）の両方を満たす
 *
 * 前提:
 *   - ffmpeg が PATH に通っていること（scoop install ffmpeg または公式バイナリ）
 *
 * 使い方:
 *   node scripts/sns-tiktok-videos.mjs                       # 全テーマ
 *   node scripts/sns-tiktok-videos.mjs theme-01-claude-design # 単一テーマ
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ONEDRIVE_BASE = 'C:/Users/naoki/OneDrive/sns';
const SLIDE_DURATION = 3.0; // 1スライド表示時間（秒）
const FADE_DURATION = 0.3;  // クロスフェード時間（秒）

function pickLatestContentFolder(base) {
  const entries = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('ai-pedia-contents-'))
    .map((d) => d.name)
    .sort()
    .reverse();
  if (entries.length === 0) {
    throw new Error(`${base} に ai-pedia-contents-YYYY-MM-DD フォルダが見つかりません`);
  }
  return path.join(base, entries[0]);
}

const ROOT = pickLatestContentFolder(ONEDRIVE_BASE);
const targetTheme = process.argv[2] || null;

console.log(`📂 対象フォルダ: ${ROOT}`);
console.log(`🎬 スライド ${SLIDE_DURATION}s × 9 + フェード ${FADE_DURATION}s ≒ ${(SLIDE_DURATION * 9).toFixed(0)}秒の動画を生成します`);

const themes = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^theme-\d+/.test(d.name))
  .map((d) => d.name)
  .filter((name) => !targetTheme || name === targetTheme)
  .sort();

if (themes.length === 0) {
  console.error('対象のテーマが見つかりません');
  process.exit(1);
}

/**
 * ffmpeg コマンドを構築。
 * concat demuxer で各画像を一定時間表示し、xfade で繋ぐ。
 */
function buildVideoForTheme(themeDir) {
  const slideDir = path.join(ROOT, themeDir, 'images', 'tiktok');
  const outDir = path.join(ROOT, themeDir, 'videos');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'tiktok.mp4');

  // 入力画像を確認
  const slides = Array.from({ length: 9 }, (_, i) =>
    path.join(slideDir, `slide-${String(i + 1).padStart(2, '0')}.png`),
  );
  for (const s of slides) {
    if (!fs.existsSync(s)) {
      console.log(`  ⚠ ${themeDir}: ${path.basename(s)} がないのでスキップ`);
      return false;
    }
  }

  // 各画像を SLIDE_DURATION 秒ループ → ストリームを順に xfade で繋ぐ
  const args = ['-y'];
  for (const s of slides) {
    args.push('-loop', '1', '-t', String(SLIDE_DURATION), '-i', s);
  }

  // フィルタグラフを構築
  // [0:v] → [v0], [1:v] → [v1] ... 各入力をスケール
  // 順次 xfade で連結
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
  // 末尾セミコロン削除
  filter = filter.replace(/;$/, '');

  args.push('-filter_complex', filter, '-map', '[vout]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', outFile);

  console.log(`\n▶ ${themeDir} を動画化中...`);
  try {
    execFileSync('ffmpeg', args, { stdio: 'pipe' });
    const size = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2);
    console.log(`  ✓ 出力: ${path.relative(ROOT, outFile)} (${size} MB)`);
    return true;
  } catch (e) {
    console.error(`  ✗ ${themeDir} 失敗:`, e.message.split('\n').slice(-3).join('\n'));
    return false;
  }
}

let success = 0;
for (const theme of themes) {
  if (buildVideoForTheme(theme)) success++;
}

console.log(`\n✅ ${success}/${themes.length} テーマの TikTok 動画を生成完了`);
console.log(`   保存先: ${ROOT}\\theme-XX\\videos\\tiktok.mp4`);
