/**
 * Qiita / Zenn 用クロスポストドラフトを自動生成。
 *
 * note 用ドラフト（generate-note-drafts.mjs）と異なり、技術系プラットフォーム向けの
 * トーン・構造・タグ付けに最適化：
 *   - フックは技術視点（「実装してみた」「比較してみた」）
 *   - TL;DR セクションを必ず冒頭に置く
 *   - 表・リストを多用（コードブロックも入る場合あり）
 *   - PR/AD 開示文を末尾に必ず付与
 *   - タグは技術系（AI, ChatGPT, Claude, Cursor 等）
 *
 * 出力: OneDrive/sns/crosspost-drafts/tech-{slug}.md
 *   各記事に「Qiita 推奨タグ」「Zenn 推奨設定」両方を記載するので、
 *   ユーザーがどちらか好きなプラットフォームへ転載可能。
 *
 * 「note 寄り」と判定した記事（副業・画像生成・趣味的な内容）は技術プラットフォームに
 * 不向きなのでスキップ（一覧で報告）。
 *
 * 使い方:
 *   node scripts/generate-tech-drafts.mjs              # 不足分のみ生成
 *   node scripts/generate-tech-drafts.mjs --force      # 全件再生成
 *   node scripts/generate-tech-drafts.mjs --slug=xxx   # 特定記事のみ
 */
import fs from 'node:fs';
import path from 'node:path';

const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const OUT_DIR = 'C:/Users/naoki/OneDrive/sns/crosspost-drafts';
const SITE_URL = 'https://ai-pedia.jp';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const slugFilter = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

// 技術プラットフォームに不向きな記事（note 専用）
const SKIP_FOR_TECH = new Set([
  'ai-side-business-guide',           // 副業
  'ai-cost-optimization',             // 節約系
  'ai-tool-failure-cases',            // 失敗例
  'midjourney-prompt-guide',          // クリエイター向け
  'ai-image-blog-guide',              // ブロガー向け
  'japanese-image-ai-5',              // 画像生成（クリエイター向け）
  'gemini-for-home-japan-2026',       // 家庭向け
]);

// 既存の手動ドラフトがある記事（既に Zenn 用として書かれている）
const HAND_CRAFTED_TECH = new Set([
  'ai-translation-tools-2026',  // 03-ai-translation-zenn.md
]);

const SLUG_TO_THEME = {
  'claude-design-vs-figma-canva': 'theme-01-claude-design',
  'ai-meeting-notes-2026-spring': 'theme-02-ai-meeting-notes',
  'ai-meeting-notes-guide': 'theme-02-ai-meeting-notes',
  'ai-transcription-comparison': 'theme-02-ai-meeting-notes',
  'ai-voice-recorder-hardware-2026': 'theme-02-ai-meeting-notes',
  'ai-agents-for-non-engineers-2026': 'theme-03-ai-agents',
  'chatgpt-claude-gemini-2026-04': 'theme-04-chat-ai-trio',
  'gemini-for-home-japan-2026': 'theme-05-gemini-for-home',
};

// 記事 → 技術タグのマッピングヒント
const TECH_TAG_HINTS = {
  'claude-design-vs-figma-canva': ['Claude', 'Figma', 'Anthropic', 'AI', 'デザイン'],
  'claude-mcp-explained': ['Claude', 'MCP', 'Anthropic', 'AI', 'プロトコル'],
  'claude-code-practical-guide': ['Claude', 'CLI', 'AI', 'コーディング', 'Anthropic'],
  'cursor-composer-agent': ['Cursor', 'IDE', 'AI', 'エージェント', 'コーディング'],
  'cursor-practical-guide': ['Cursor', 'IDE', 'AI', 'コーディング'],
  'coding-ai-comparison': ['AI', 'コーディング', 'Cursor', 'Claude', 'Copilot'],
  'chatgpt-agent-mode-20': ['ChatGPT', 'OpenAI', 'AI', 'エージェント', '自動化'],
  'chatgpt-claude-gemini-2026-04': ['ChatGPT', 'Claude', 'Gemini', 'AI', '比較'],
  'chatgpt-vs-claude-vs-gemini': ['ChatGPT', 'Claude', 'Gemini', 'AI', '比較'],
  'chatgpt-plans-which-to-choose': ['ChatGPT', 'OpenAI', 'AI', 'コスト'],
  'gemini-deep-research': ['Gemini', 'Google', 'AI', '検索'],
  'perplexity-vs-google': ['Perplexity', 'Google', 'AI', '検索'],
  'notion-ai-review': ['Notion', 'AI', '生産性'],
  'ai-meeting-notes-guide': ['AI', '議事録', '業務効率化'],
  'ai-meeting-notes-2026-spring': ['AI', '議事録', '比較', 'Notta'],
  'ai-transcription-comparison': ['AI', '文字起こし', 'Notta', 'Whisper'],
  'ai-voice-recorder-hardware-2026': ['AI', 'PLAUD', '議事録', 'IoT'],
  'transcription-reselect-2026': ['AI', '文字起こし', 'Notta'],
  'ai-translation-tools-2026': ['AI', '翻訳', 'DeepL', 'Languise'],
  'ai-writing-tools-comparison': ['AI', 'ライティング', '比較', '生成AI'],
  'bun-ken-seo-writer-workflow': ['AI', '校正', 'SEO', 'ライティング'],
  'ai-agents-for-non-engineers-2026': ['AI', 'エージェント', '自動化', '比較'],
  'ai-agent-frontier-2026': ['AI', 'エージェント', '生成AI', 'トレンド'],
  'ai-trend-2026-q2': ['AI', 'トレンド', '生成AI'],
  'free-ai-ranking-2026': ['AI', '比較', '生成AI', 'ChatGPT', 'Claude'],
  'how-to-choose-ai-tool': ['AI', '比較', '生成AI'],
  'claude-design-feature': ['Claude', 'Anthropic', 'AI', 'デザイン'],
};

const CATEGORY_JA = {
  comparison: '比較',
  howto: 'How-to',
  guide: 'ガイド',
  review: 'レビュー',
  trend: 'トレンド',
};

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

function plainText(s, max = 200) {
  if (!s) return '';
  let cleaned = s
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\|.*\|$/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (cleaned.length > max) cleaned = cleaned.slice(0, max - 1) + '…';
  return cleaned;
}

function firstSentences(text, count = 2, max = 220) {
  if (!text) return '';
  const cleaned = plainText(text, 1000);
  const sents = cleaned.split(/(?<=[。！？])/).filter((s) => s.trim().length > 0).slice(0, count);
  const joined = sents.join('').trim();
  return joined.length > max ? joined.slice(0, max - 1) + '…' : joined;
}

function parseArticleSections(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const fmEnd = src.indexOf('---', 3);
  const body = fmEnd === -1 ? src : src.slice(fmEnd + 3);
  const EXCLUDE = /^(まとめ|結論|おわりに|FAQ|よくある質問|参考|関連記事|関連リンク|免責|あわせて読みたい|TL;?DR|目次|参考情報|本記事|注意点)/;

  const sections = [];
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*import\s+/.test(line)) continue;
    if (/^\s*<\w/.test(line)) continue;
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (current && !EXCLUDE.test(current.heading)) sections.push(current);
      current = {
        heading: m[1].trim().replace(/[【】「」『』]/g, '').replace(/^\d+\.\s*/, ''),
        body: '',
        bullets: [],
      };
    } else if (current) {
      current.body += line + '\n';
      const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
      if (bullet) {
        const cleaned = bullet[1].replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
        if (cleaned.length >= 6 && cleaned.length <= 80 && current.bullets.length < 4) {
          current.bullets.push(cleaned);
        }
      }
    }
  }
  if (current && !EXCLUDE.test(current.heading)) sections.push(current);
  return sections.slice(0, 6);
}

function loadAllArticles() {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const fm = parseFrontmatter(fs.readFileSync(path.join(GUIDES_DIR, file), 'utf-8')) ?? {};
      return {
        slug,
        file,
        title: fm.title ?? '',
        description: fm.description ?? '',
        tldr: fm.tldr ?? '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        category: fm.category ?? 'guide',
        heroEmoji: fm.heroEmoji ?? '📘',
        publishedAt: fm.publishedAt ?? '',
        readTimeMin: fm.readTimeMin ?? '5',
      };
    })
    .filter((a) => a.title);
}

function buildTechHook(a) {
  const cleanTitle = a.title.split('｜')[0].replace(/【.*?】/g, '').trim();
  if (a.category === 'comparison') {
    return `業務で使う AI ツールを選ぶとき、「**機能比較表は見たけど、結局どれが自分の用途に合うか分からない**」という壁にぶつかったことはないでしょうか。\n\n本記事では「${cleanTitle}」を、AIpedia 編集部が実務で使った結果を **数値ベースで** 整理した記事のダイジェストとして共有します。`;
  }
  if (a.category === 'howto') {
    return `「**${cleanTitle}**」——技術的には可能と理解していても、実装や運用フェーズで詰まる人は多いと思います。\n\n本記事は AIpedia の元記事から、つまづきポイントと回避策を中心に抜粋した技術ダイジェストです。`;
  }
  if (a.category === 'trend') {
    return `2026年の AI 領域で **無視できない動き** として「${cleanTitle}」を整理します。\n\n単なるニュースまとめではなく、自分の業務・実装にどう影響するかという観点で整理した記事のダイジェスト版です。`;
  }
  if (a.category === 'review') {
    return `「**${cleanTitle}**」を実務で使った観点でレビューします。\n\nスペックシートからは見えない、実装上のクセや評価軸を整理しました。`;
  }
  return `「**${cleanTitle}**」について、技術視点で整理します。\n\nAIpedia の元記事から、エンジニア・PdM が押さえるべき要点を抜粋しました。`;
}

function buildTechDraftMd(a) {
  const sections = parseArticleSections(path.join(GUIDES_DIR, a.file));
  const cleanTitle = a.title.split('｜')[0];
  const url = `${SITE_URL}/guides/${a.slug}`;
  const tldr = a.tldr || a.description;

  // セクション → bullets 形式に
  const sectionsMd = sections.slice(0, 5).map((s) => {
    const summary = firstSentences(s.body, 2, 240);
    if (!summary) return null;
    const bulletList = (s.bullets || []).slice(0, 3);
    const bulletsHtml = bulletList.length > 0
      ? '\n\n' + bulletList.map((b) => `- ${b}`).join('\n')
      : '';
    return `### ${s.heading}\n\n${summary}${bulletsHtml}`;
  }).filter(Boolean).join('\n\n');

  // TL;DR の bullet 化
  const tldrPoints = (tldr || '').split(/[。、]/).filter((s) => s.length > 8).slice(0, 4);
  const tldrBullets = tldrPoints.length > 0
    ? tldrPoints.map((p) => `- ${p.trim()}`).join('\n')
    : `- ${tldr}`;

  // 技術タグ
  const techTags = TECH_TAG_HINTS[a.slug] || [...a.tags.slice(0, 3), 'AI', '生成AI'];
  const qiitaTags = techTags.slice(0, 5).map((t) => `\`${t}\``).join(' ');
  const zennTopics = techTags.slice(0, 5).map((t) => `'${t.toLowerCase().replace(/\s+/g, '')}'`).join(', ');

  return `# 投稿用タイトル

\`\`\`
${cleanTitle}
\`\`\`

- Zenn / Qiita どちらでも使える汎用タイトル
- 投稿先によってサブタイトルや見出しは適宜調整

---

# 投稿用本文（ここから下を全てコピペ）

${buildTechHook(a)}

---

## TL;DR

${tldrBullets}

---

## 詳細

${sectionsMd || `### 概要\n\n${a.description}`}

---

## まとめ

- 用途・予算・運用フェーズによって最適解は変わる
- ここでは概要だけ整理しているが、本編に **比較表 / 料金詳細 / 運用パターン別の推奨** を記載
- 実装・導入を検討中の方は元記事を参照ください

---

## 元記事（詳細・比較表あり）

${a.heroEmoji} ${cleanTitle}

👉 **[${cleanTitle}（ai-pedia.jp）](${url})**

本記事は要約版です。**料金詳細・実例・落とし穴・運用パターン別の推奨** は本編に揃っています。

---

> **免責 / Disclosure**：
> 本記事はAI ツール比較メディア「AIpedia」（[ai-pedia.jp](${SITE_URL})）の編集部から共有されている要約です。本編にはアフィリエイトリンクが含まれます。

---

（ここまでが本文。以下は投稿設定用のメモ、コピペ不要）

---

## 投稿先別の設定

### 🟢 Zenn に投稿する場合（おすすめ）

- 投稿タイプ：**「アイデア」**（記事レビュー寄りの内容のため）
  - 「Tech」にする場合はもう少しコード/実装寄りの追記が必要
- topics（最大5個）:

\`\`\`
${zennTopics}
\`\`\`

- emoji: ${a.heroEmoji}
- Publication: なし

### 🟡 Qiita に投稿する場合

- カテゴリ: 該当する技術カテゴリ
- タグ（最大5個）:

\`\`\`
${qiitaTags}
\`\`\`

- 注意：Qiita は「Tech 一択」なので、より技術的なコード例やコマンド例の追記を推奨

---

## サムネイル / OG 画像

${SLUG_TO_THEME[a.slug]
    ? `\`C:\\Users\\naoki\\OneDrive\\sns\\ai-pedia-contents-2026-04-22\\${SLUG_TO_THEME[a.slug]}\\preview-cards\\og.png\``
    : `\`C:\\Users\\naoki\\OneDrive\\sns\\ai-pedia-contents-2026-04-22\\article-${a.slug}\\preview-cards\\og.png\``}

---

## 投稿後のアクション

1. X (@aipediajp) から投稿URLを引用RT
   - リプ文例：「Zenn に書きました / ${cleanTitle.slice(0, 50)}」
2. はてなブックマーク登録（自分で1つ → 関連3件で「新着エントリ」入りやすい）
3. AI 系 Discord / Slack コミュニティで共有（押し付けにならない範囲で）
4. 48時間後に LGTM / スキ / PV を確認

---

## 効果測定

- **Zenn / Qiita 側**: ダッシュボード → 記事別ビュー
- **ai-pedia.jp 側**: GA4 → 集客 → 参照元 → zenn.dev / qiita.com のセッション数
- **期待値**: 投稿24時間以内に ai-pedia.jp に **10〜30PV** の新規流入
  - 技術系コミュニティはバズれば 100PV超 も狙える

---

## 元記事URL

${url}
`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const articles = loadAllArticles().filter((a) => !slugFilter || a.slug === slugFilter);

  let generated = 0;
  let skippedNonTech = 0;
  let skippedExisting = 0;
  let skippedHandCrafted = 0;

  for (const a of articles) {
    if (slugFilter !== a.slug) {
      // フィルタなしの場合は事前スキップ
      if (HAND_CRAFTED_TECH.has(a.slug)) {
        skippedHandCrafted++;
        console.log(`  ⊘ ${a.slug} (hand-crafted Zenn draft 既存)`);
        continue;
      }
      if (SKIP_FOR_TECH.has(a.slug)) {
        skippedNonTech++;
        console.log(`  ⊘ ${a.slug} (note 向け、技術プラットフォーム不向き)`);
        continue;
      }
    }
    const outFile = path.join(OUT_DIR, `tech-${a.slug}.md`);
    if (!FORCE && fs.existsSync(outFile) && !slugFilter) {
      skippedExisting++;
      console.log(`  ⊘ ${a.slug} (生成済)`);
      continue;
    }
    const md = buildTechDraftMd(a);
    fs.writeFileSync(outFile, md, 'utf-8');
    generated++;
    console.log(`  ✓ tech-${a.slug}.md`);
  }
  console.log(`\n✅ 生成: ${generated} 本`);
  console.log(`   スキップ: hand-crafted ${skippedHandCrafted} / note向け ${skippedNonTech} / 生成済 ${skippedExisting}`);
  console.log(`   保存先: ${OUT_DIR}`);
}

main();
