/**
 * Instagram / TikTok 軽量再投稿スクリプト。
 *
 * 目的:
 *   すでに OneDrive/sns に蓄積済みのカルーセル画像を再利用し、
 *   月1〜週1 ペースで Instagram / TikTok に再投稿するための下書きを生成する。
 *   X 集中運用中に、IG/TikTok アカウントを "休眠させない" ための最小工数運用。
 *
 * 挙動:
 *   - OneDrive/sns/ai-pedia-contents-(日付)/theme-(連番) を全スキャン
 *   - scripts/post-drafts/recycle-log.json に「最後に再投稿した日」を記録
 *   - もっとも再投稿から日数が空いたテーマを自動選択（LRU）
 *   - 対応する記事の title / tldr を frontmatter から取得
 *   - IG / TikTok それぞれのキャプション案、画像パス、投稿チェックリストを
 *     scripts/post-drafts/recycle-YYYY-MM-DD-<slug>.md に出力
 *
 * 使い方:
 *   node scripts/sns-recycle.mjs                 # 自動選択（LRU）
 *   node scripts/sns-recycle.mjs --theme=<dir>   # 特定テーマを指定
 *   node scripts/sns-recycle.mjs --list          # 候補一覧と最終投稿日を表示
 *   node scripts/sns-recycle.mjs --dry-run       # ファイルを書かずに標準出力だけ
 *
 * 運用想定:
 *   月1回 5〜10分の作業:
 *     1. `node scripts/sns-recycle.mjs` を実行
 *     2. 出力された recycle-*.md を開き、キャプションを軽く調整
 *     3. 指示されたスライド PNG を IG / TikTok に手動投稿
 *     4. 完了したら git commit（log.json を含め記録として残す）
 */
import fs from 'node:fs';
import path from 'node:path';
import { THEMES } from './sns-carousel-data.mjs';

const ONEDRIVE_BASE = 'C:/Users/naoki/OneDrive/sns';
const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const OUT_DIR = path.join(process.cwd(), 'scripts', 'post-drafts');
const LOG_FILE = path.join(OUT_DIR, 'recycle-log.json');
const SITE_URL = 'https://ai-pedia.jp';
const SITE_HANDLE_IG = '@ai_pedia.jp';
const SITE_HANDLE_TT = '@ai_pedia_jp';

const args = process.argv.slice(2);
const themeArg = args.find((a) => a.startsWith('--theme='))?.split('=')[1];
const listMode = args.includes('--list');
const dryRun = args.includes('--dry-run');

/** JST（日本時間）基準で YYYY-MM-DD を返す */
function jstDate() {
  const jst = new Date(Date.now() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** frontmatter を簡易パース（generate-post-drafts.mjs と同じロジックを再掲） */
function parseFrontmatter(src) {
  if (!src.startsWith('---')) return null;
  const end = src.indexOf('---', 3);
  if (end === -1) return null;
  const fm = src.slice(3, end);
  const data = {};
  const lines = fm.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      const val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        data[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (val !== '') {
        data[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  return data;
}

/** OneDrive 配下のテーマを全スキャン */
function scanThemes() {
  if (!fs.existsSync(ONEDRIVE_BASE)) {
    throw new Error(`OneDrive SNS ディレクトリが見つかりません: ${ONEDRIVE_BASE}`);
  }
  const out = [];
  const batches = fs
    .readdirSync(ONEDRIVE_BASE, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('ai-pedia-contents-'))
    .map((d) => d.name)
    .sort(); // 古い→新しい

  for (const batch of batches) {
    const batchPath = path.join(ONEDRIVE_BASE, batch);
    const themes = fs
      .readdirSync(batchPath, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('theme-'))
      .map((d) => d.name);
    for (const themeDir of themes) {
      const igDir = path.join(batchPath, themeDir, 'images', 'instagram');
      const ttDir = path.join(batchPath, themeDir, 'images', 'tiktok');
      const hasIg = fs.existsSync(igDir);
      const hasTt = fs.existsSync(ttDir);
      if (!hasIg && !hasTt) continue;
      // THEMES 定義があれば正式 slug を優先、無ければディレクトリ末尾から推測
      const themeDef = THEMES.find((t) => t.dir === themeDir);
      const slug = themeDef?.slug ?? themeDir.replace(/^theme-\d+-/, '');
      out.push({
        id: `${batch}/${themeDir}`,
        batch,
        themeDir,
        slug,
        igDir: hasIg ? igDir : null,
        ttDir: hasTt ? ttDir : null,
      });
    }
  }
  return out;
}

/** 記事の frontmatter を取得。slug 完全一致が無ければ部分一致にフォールバック */
function findArticle(slug) {
  if (!fs.existsSync(GUIDES_DIR)) return null;
  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  // 完全一致優先
  const exact = files.find(
    (f) => f === `${slug}.md` || f === `${slug}.mdx`,
  );
  const target =
    exact ??
    files.find((f) => f.includes(slug) || slug.includes(f.replace(/\.(md|mdx)$/, '')));
  if (!target) return null;
  const full = path.join(GUIDES_DIR, target);
  const src = fs.readFileSync(full, 'utf-8');
  const fm = parseFrontmatter(src) ?? {};
  return {
    slug: target.replace(/\.(md|mdx)$/, ''),
    title: fm.title ?? '',
    description: fm.description ?? '',
    tldr: fm.tldr ?? '',
    category: fm.category ?? '',
    heroEmoji: fm.heroEmoji ?? '📘',
    tags: Array.isArray(fm.tags) ? fm.tags : [],
  };
}

function loadLog() {
  if (!fs.existsSync(LOG_FILE)) return { history: {} };
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  } catch {
    return { history: {} };
  }
}

function saveLog(log) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
}

/** LRU で再投稿候補を選ぶ（最後に投稿してから経過日数が多い順） */
function pickLRU(themes, log) {
  const today = jstDate();
  const scored = themes.map((t) => {
    const last = log.history[t.id];
    const daysSince = last
      ? Math.floor((Date.parse(today) - Date.parse(last)) / (24 * 3600 * 1000))
      : 999;
    return { ...t, last: last ?? '未投稿', daysSince };
  });
  scored.sort((a, b) => b.daysSince - a.daysSince);
  return scored;
}

function listSlides(dir) {
  if (!dir) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^slide-\d+\.png$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

function buildInstagramCaption(article, theme) {
  const url = `${SITE_URL}/guides/${theme.slug}`;
  const tags = [
    ...article.tags.slice(0, 4),
    'AIpedia',
    'AIツール',
    '生成AI',
    '非エンジニア',
    'AI副業',
  ]
    .slice(0, 10)
    .map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, ''))
    .join(' ');

  const summary = article.tldr || article.description || '';
  return `${article.heroEmoji} ${article.title.split('｜')[0]}

${summary}

━━━━━━━━━━
🔖 保存して後でじっくり読む
👤 フォローで毎週の新着が届きます
🔗 プロフのリンクから詳細記事へ
━━━━━━━━━━

※ この投稿は再構成版です。最新情報は記事本文をご確認ください。

${tags}`;
}

function buildTikTokCaption(article, theme) {
  const tags = [...article.tags.slice(0, 3), 'AI', 'AIツール', '生成AI', 'おすすめ']
    .map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, ''))
    .join(' ');
  const summary = (article.tldr || article.description || '').slice(0, 80);
  return `${article.heroEmoji} ${summary}

プロフからサイトへ ${tags}`;
}

function formatSlidePath(full) {
  return full.replace(/\//g, '\\');
}

function buildDraft(theme, article) {
  const igSlides = listSlides(theme.igDir);
  const ttSlides = listSlides(theme.ttDir);
  const igCaption = buildInstagramCaption(article, theme);
  const ttCaption = buildTikTokCaption(article, theme);

  const bullet = (arr) => arr.map((p) => `- ${formatSlidePath(p)}`).join('\n');

  return `# AIpedia 再投稿下書き（${jstDate()}）

**対象テーマ**: ${theme.themeDir}
**撮影バッチ**: ${theme.batch}
**記事スラグ**: ${theme.slug}
**記事タイトル**: ${article.title}
**記事URL**: ${SITE_URL}/guides/${theme.slug}
**最終再投稿**: ${theme.last} （${theme.daysSince}日前）

---

## Instagram · ${SITE_HANDLE_IG}

**使用画像（${igSlides.length}枚 / 1080×1350）**:

${igSlides.length ? bullet(igSlides) : '（画像なし）'}

**キャプション**:

\`\`\`
${igCaption}
\`\`\`

**投稿ステップ**:
1. Instagram アプリ → 「+」→ 投稿
2. 上記の \`slide-01.png〜slide-XX.png\` を順番に選択（カルーセル）
3. 1枚目にカバースライドが来ることを確認
4. キャプションを貼り付け、微調整
5. 「位置情報: 日本」「音声: なし」「リミックス: 許可」
6. 公開

---

## TikTok · ${SITE_HANDLE_TT}

**使用画像（${ttSlides.length}枚 / 1080×1920）**:

${ttSlides.length ? bullet(ttSlides) : '（画像なし）'}

**キャプション**:

\`\`\`
${ttCaption}
\`\`\`

**投稿ステップ**:
1. TikTok アプリ → 「+」→ 「フォトモード」
2. 上記の \`slide-01.png〜slide-XX.png\` を順番に追加
3. 各スライド 4秒程度の尺を設定（合計 ${ttSlides.length * 4}秒前後）
4. BGM: トレンド音源から "chill / lofi" カテゴリで無難な1曲
5. キャプションを貼り付け
6. 「説明欄: あり」「コメント: 許可」「Duet/Stitch: 許可」
7. 投稿

---

## 再投稿時の注意

- **そのまま貼らない**: キャプション冒頭の1行は毎回変えるとアルゴリズム的に有利
- **投稿頻度**: IG は週1〜2回、TikTok は週1〜3回が目安。同じテーマは最低30日空ける
- **URLはプロフのみ**: IG/TikTok はキャプション内 URL がクリックできないため、プロフのリンクを最新のテーマに更新
- **再投稿であることの明示**: IG キャプションに「再構成版です」と入れているのはコピペ疑惑回避のため、必要に応じて差し替え可

---

## 完了後の記録（log.json 反映済み）

\`\`\`
{
  "id": "${theme.id}",
  "postedAt": "${jstDate()}"
}
\`\`\`

次回実行時は、これ以外のテーマが自動的に候補上位に上がります。
`;
}

function main() {
  const themes = scanThemes();
  if (themes.length === 0) {
    console.error(`テーマが見つかりませんでした: ${ONEDRIVE_BASE}`);
    process.exit(1);
  }

  const log = loadLog();
  const candidates = pickLRU(themes, log);

  if (listMode) {
    console.log('📋 再投稿候補一覧（最終投稿から経過日数の多い順）:\n');
    for (const c of candidates) {
      console.log(
        `  ${String(c.daysSince).padStart(3)}日前  ${c.id}  →  ${c.slug}`,
      );
    }
    return;
  }

  const pick = themeArg
    ? candidates.find((c) => c.themeDir === themeArg || c.id.endsWith(themeArg))
    : candidates[0];
  if (!pick) {
    console.error(`テーマが見つかりません: ${themeArg}`);
    process.exit(1);
  }

  const article = findArticle(pick.slug);
  if (!article) {
    console.error(
      `対応する記事が見つかりません（slug=${pick.slug}）。記事のファイル名を確認してください。`,
    );
    process.exit(1);
  }

  const draft = buildDraft(pick, article);
  const today = jstDate();
  const outFile = path.join(OUT_DIR, `recycle-${today}-${pick.slug}.md`);

  if (dryRun) {
    console.log(draft);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outFile, draft, 'utf-8');

  log.history = log.history || {};
  log.history[pick.id] = today;
  saveLog(log);

  console.log(`✅ 再投稿下書きを生成: ${path.relative(process.cwd(), outFile)}`);
  console.log(`   対象テーマ: ${pick.id}`);
  console.log(`   記事: ${article.title}`);
  console.log(`   IG 画像: ${listSlides(pick.igDir).length}枚`);
  console.log(`   TikTok 画像: ${listSlides(pick.ttDir).length}枚`);
}

main();
