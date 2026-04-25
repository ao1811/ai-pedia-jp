/**
 * SNS 投稿用の文面を記事から自動生成するスクリプト。
 *
 * 用途:
 *   - 毎朝の運用で「今日投稿する文」を取り出す
 *   - Claude in Chrome に「この文を X に投稿して」と指示する元データ
 *   - GitHub Actions から cron で起動して artifact としてダウンロード可能にする
 *
 * 使い方:
 *   node scripts/generate-post-drafts.mjs                # ランダム1記事、全プラットフォーム分
 *   node scripts/generate-post-drafts.mjs --slug=xxx     # 特定記事
 *   node scripts/generate-post-drafts.mjs --mode=new     # 直近7日の新規記事優先
 *   node scripts/generate-post-drafts.mjs --mode=popular # スコア高い順
 *   node scripts/generate-post-drafts.mjs --thread       # X スレッド案（3-5ツイート連続）も追加生成
 *
 * 出力先:
 *   scripts/post-drafts/YYYY-MM-DD.md
 *   （X / Instagram / TikTok / LINE 各プラットフォームの投稿案を1ファイルに集約）
 */
import fs from 'node:fs';
import path from 'node:path';

const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const OUT_DIR = path.join(process.cwd(), 'scripts', 'post-drafts');
const SITE_URL = 'https://ai-pedia.jp';
const SITE_HANDLE = '@aipediajp';

// CLI オプション
const args = process.argv.slice(2);
const slugArg = args.find((a) => a.startsWith('--slug='))?.split('=')[1];
const modeArg = args.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'random';
const threadFlag = args.includes('--thread');

/** JST（日本時間）基準で YYYY-MM-DD を返す */
function jstDate() {
  const jst = new Date(Date.now() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** frontmatter を簡易パース（YAMLライブラリ不要） */
function parseFrontmatter(src) {
  if (!src.startsWith('---')) return null;
  const end = src.indexOf('---', 3);
  if (end === -1) return null;
  const fm = src.slice(3, end);
  const data = {};
  const lines = fm.split(/\r?\n/);
  let currentKey = null;
  let inArray = false;
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      const val = m[2].trim();
      currentKey = key;
      if (val.startsWith('[') && val.endsWith(']')) {
        // インライン配列
        data[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else if (val === '') {
        data[key] = [];
        inArray = true;
      } else {
        data[key] = val.replace(/^["']|["']$/g, '');
      }
    } else if (inArray && line.trim().startsWith('- ')) {
      // TODO: nested array items
    }
  }
  return data;
}

/** 本文から H2 見出しを抽出（スレッド生成で使用） */
function extractH2Sections(src) {
  const end = src.indexOf('---', 3);
  if (end === -1) return [];
  const body = src.slice(end + 3);
  const sections = [];
  const lines = body.split(/\r?\n/);
  let currentHeading = null;
  let currentBody = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = m[1].trim();
      currentBody = [];
    } else if (currentHeading) {
      currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }
  return sections;
}

/** 全記事を読み取り、メタデータの配列を返す */
function loadGuides() {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const src = fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8');
      const fm = parseFrontmatter(src) ?? {};
      return {
        slug,
        file,
        title: fm.title ?? '',
        description: fm.description ?? '',
        tldr: fm.tldr ?? '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        category: fm.category ?? '',
        publishedAt: fm.publishedAt ?? '',
        featured: fm.featured === 'true',
        heroEmoji: fm.heroEmoji ?? '📘',
        sections: extractH2Sections(src),
      };
    })
    .filter((g) => g.title);
}

/** mode に応じて記事を1本選ぶ */
function pickGuide(guides) {
  if (slugArg) {
    const found = guides.find((g) => g.slug === slugArg);
    if (!found) throw new Error(`slug not found: ${slugArg}`);
    return found;
  }
  if (modeArg === 'new') {
    // 直近7日に公開された記事優先
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const candidates = guides.filter((g) => {
      const t = Date.parse(g.publishedAt);
      return isFinite(t) && t >= weekAgo;
    });
    if (candidates.length === 0) return pickRandom(guides);
    return pickRandom(candidates);
  }
  if (modeArg === 'popular') {
    // featured 優先
    const candidates = guides.filter((g) => g.featured);
    if (candidates.length === 0) return pickRandom(guides);
    return pickRandom(candidates);
  }
  return pickRandom(guides);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** X の投稿案（複数パターン）を生成 */
function buildXPosts(g) {
  const url = `${SITE_URL}/guides/${g.slug}`;
  const hashtagList = [...g.tags.slice(0, 3), 'AIpedia']
    .map((t) => '#' + t.replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g, ''))
    .join(' ');

  // パターンA: 問いかけ型
  const patternA = `${g.heroEmoji} ${g.title.split('｜')[0]}

${truncate(g.tldr || g.description, 120)}

▼詳しくはこちら
${url}

${hashtagList}`;

  // パターンB: 箇条書き型
  const bullets = g.tags
    .slice(0, 3)
    .map((t) => `・${t}`)
    .join('\n');
  const patternB = `${g.heroEmoji} ${g.title.split('｜')[0]}

主なテーマ:
${bullets}

${url}

${hashtagList}`;

  // パターンC: カジュアル型
  const patternC = `${g.heroEmoji} ${truncate(g.tldr || g.description, 180)}

続きはこちら👇
${url}

${hashtagList}`;

  return { patternA, patternB, patternC };
}

function truncate(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

/** H2セクションの本文1〜2文を抜き出して要点にする */
function summarizeSection(body, max = 110) {
  if (!body) return '';
  // マークダウン記号を素朴に剥ぐ（太字・リンク・見出し・表・リスト・番号・箇条）
  let plain = body
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // code spans
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')    // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\*\*([^*]+)\*\*/g, '$1')       // bold
    .replace(/\*([^*]+)\*/g, '$1')           // italic
    .replace(/^\s*[-*+>]\s+/gm, '')          // list/quote markers
    .replace(/^\s*\d+\.\s+/gm, '')           // ordered list
    .replace(/^\s*\|.*\|$/gm, '')            // table rows
    .replace(/^\s*#+\s+/gm, '')              // sub-headings
    .replace(/\n{2,}/g, '\n')
    .trim();
  // 先頭から1文抜き出し
  const firstSentence = plain.split(/(?<=[。！？!?])/)[0] ?? plain;
  return truncate(firstSentence.replace(/\s+/g, ' ').trim(), max);
}

/**
 * X スレッド案を生成（Hook → 3〜5 要点 → 着地）。
 * 文字数は各ツイート 140 字以内を目安。
 */
function buildXThread(g) {
  const url = `${SITE_URL}/guides/${g.slug}`;
  // 目次になりそうな H2 を抽出（「まとめ」「結論」「よくある質問」等は除外）
  const EXCLUDE = /^(まとめ|結論|おわりに|FAQ|よくある質問|参考|関連記事|関連リンク|免責)/;
  const sections = (g.sections ?? [])
    .filter((s) => !EXCLUDE.test(s.heading))
    .map((s) => ({ ...s, summary: summarizeSection(s.body) }))
    .filter((s) => s.summary && s.summary.length >= 20)
    .slice(0, 5);

  const title = g.title.split('｜')[0];
  const hookText = g.tldr || truncate(g.description, 120);

  const hook = `${g.heroEmoji} ${title}

${truncate(hookText, 180)}

要点をスレッドでまとめます 🧵👇`;

  const bodyTweets = sections.map((s, i) => {
    const num = `${i + 1}/${sections.length}`;
    return `${num} ${s.heading}

${s.summary}`;
  });

  const hashtagList = [...g.tags.slice(0, 3), 'AIpedia']
    .map((t) => '#' + t.replace(/[^\w぀-ゟ゠-ヿ一-鿿]/g, ''))
    .join(' ');

  const closing = `詳しい比較表・料金・具体例は本記事にまとめています👇

${url}

${hashtagList}`;

  return { hook, body: bodyTweets, closing, count: sections.length + 2 };
}

/** Instagram のキャプション案 */
function buildInstagramCaption(g) {
  const url = `${SITE_URL}/guides/${g.slug}`;
  const hashtags = [...g.tags, 'AIpedia', 'AIツール', '生成AI', '非エンジニア']
    .slice(0, 10)
    .map((t) => '#' + t.replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g, ''))
    .join(' ');
  return `${g.heroEmoji} ${g.title.split('｜')[0]}

${g.tldr || g.description}

━━━━━━━━━━
📖 続きはプロフのリンクから
🔗 ${url}
━━━━━━━━━━

${hashtags}`;
}

/** TikTok のキャプション案（短く） */
function buildTikTokCaption(g) {
  const hashtags = [...g.tags.slice(0, 3), 'AI', 'AIツール', '生成AI']
    .map((t) => '#' + t.replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/g, ''))
    .join(' ');
  return `${g.heroEmoji} ${truncate(g.tldr || g.description, 80)}

プロフからサイトへ ${hashtags}`;
}

/** LINE VOOM のキャプション */
function buildLineCaption(g) {
  const url = `${SITE_URL}/guides/${g.slug}`;
  return `${g.heroEmoji} ${g.title.split('｜')[0]}

${g.tldr || g.description}

詳しくは👉 ${url}`;
}

function buildOutput(g) {
  const x = buildXPosts(g);
  const thread = threadFlag ? buildXThread(g) : null;
  const ig = buildInstagramCaption(g);
  const tt = buildTikTokCaption(g);
  const line = buildLineCaption(g);
  const url = `${SITE_URL}/guides/${g.slug}`;

  const threadSection = thread
    ? `
### 案D：スレッド型（${thread.count}ツイート連続）

> 伸び方を底上げするならこの型。Hook で引きつけ、要点を1ツイートずつ展開、最後にURL。
> 投稿時は最初のツイートに返信する形で続けて投稿する。

**ツイート 1（Hook）:**

\`\`\`
${thread.hook}
\`\`\`

${thread.body
  .map(
    (t, i) => `**ツイート ${i + 2}（要点 ${i + 1}）:**

\`\`\`
${t}
\`\`\`
`,
  )
  .join('\n')}
**ツイート ${thread.count}（着地・リンク）:**

\`\`\`
${thread.closing}
\`\`\`

`
    : '';

  return `# AIpedia SNS 投稿案（${jstDate()}）

**対象記事**: ${g.title}
**元URL**: ${url}
**カテゴリ**: ${g.category}
**タグ**: ${g.tags.join(', ')}

---

## X（旧Twitter） · ${SITE_HANDLE}

### 案A：問いかけ型

\`\`\`
${x.patternA}
\`\`\`

### 案B：箇条書き型

\`\`\`
${x.patternB}
\`\`\`

### 案C：カジュアル型

\`\`\`
${x.patternC}
\`\`\`
${threadSection}
---

## Instagram · @ai_pedia.jp

**キャプション**:

\`\`\`
${ig}
\`\`\`

**サムネ画像（OneDrive内）**:
\`C:\\Users\\naoki\\OneDrive\\sns\\ai-pedia-contents-2026-04-22\\\` 配下から類似テーマのpreview-card、または
\`https://ai-pedia.jp/og/og/guides/${g.slug}.png\` をダウンロード

---

## TikTok · ${SITE_HANDLE}

**キャプション**:

\`\`\`
${tt}
\`\`\`

---

## LINE VOOM

**テキスト**:

\`\`\`
${line}
\`\`\`

---

## Claude in Chrome で使う場合

このファイルを Claude に渡して、以下のように指示できます：

\`\`\`
「この投稿案の X 案A を @aipediajp に投稿して」
→ Claude in Chrome が X を開いて、文を貼り付けます。
   ユーザーは最終的に「ポストする」ボタンを押すだけ。
\`\`\`

- 投稿前に必ずユーザーが文面を確認・微調整
- 連続投稿は NG（X のスパム判定対象）、最低2〜3時間空ける
- 同じ記事の別パターンでも、同じ日に重複投稿は避ける
`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const guides = loadGuides();
  if (guides.length === 0) {
    console.error('記事が見つかりません');
    process.exit(1);
  }
  const picked = pickGuide(guides);
  const output = buildOutput(picked);
  const date = jstDate();
  const outFile = path.join(OUT_DIR, `${date}-${picked.slug}.md`);
  fs.writeFileSync(outFile, output, 'utf-8');
  console.log(`✅ 投稿案を生成: ${path.relative(process.cwd(), outFile)}`);
  console.log(`   対象記事: ${picked.title}`);
  console.log(`   URL: ${SITE_URL}/guides/${picked.slug}`);
}

main();
