/**
 * 全記事の note クロスポスト用ドラフトを自動生成。
 *
 * 出力: OneDrive/sns/crosspost-drafts/note-{slug}.md
 *
 * 既に hand-crafted で存在する 3本（01-claude-design-note, 02-ai-voice-recorder-note,
 * 03-ai-translation-zenn）には触れず、それ以外の31本を生成する。
 *
 * 各ドラフトは「note にコピペでそのまま投稿できる形式」：
 *   - 投稿用タイトル（コードブロック内）
 *   - 投稿用本文（フック + 結論 + 主要セクション + CTA + 関連リンク）
 *   - note の投稿設定メモ（ハッシュタグ・サムネ・カテゴリ）
 *   - 元記事URL・効果測定の手順
 *
 * 使い方:
 *   node scripts/generate-note-drafts.mjs                 # 不足分のみ生成
 *   node scripts/generate-note-drafts.mjs --force         # 全件再生成
 *   node scripts/generate-note-drafts.mjs --slug=xxx      # 特定記事だけ
 */
import fs from 'node:fs';
import path from 'node:path';

const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const OUT_DIR = 'C:/Users/naoki/OneDrive/sns/crosspost-drafts';
const SITE_URL = 'https://ai-pedia.jp';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const slugFilter = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

// 既に hand-crafted ドラフトがある記事はデフォルトでスキップ
const HAND_CRAFTED_SLUGS = new Set([
  'claude-design-vs-figma-canva',         // 01-claude-design-note.md
  'ai-voice-recorder-hardware-2026',      // 02-ai-voice-recorder-note.md
  'ai-translation-tools-2026',            // 03-ai-translation-zenn.md
]);

// 既存の SNS テーマ → サムネ参照
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

const CATEGORY_JA = {
  comparison: '比較',
  howto: 'How-to',
  guide: 'ガイド',
  review: 'レビュー',
  trend: 'トレンド',
};
const NOTE_CATEGORY = {
  comparison: 'テクノロジー',
  howto: '仕事',
  guide: 'テクノロジー',
  review: 'テクノロジー',
  trend: 'テクノロジー',
};

// ============================================================================
// frontmatter / 本文パース
// ============================================================================

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
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
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

function firstSentences(text, count = 2, max = 200) {
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
      };
    } else if (current) {
      current.body += line + '\n';
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
        featured: fm.featured === 'true',
      };
    })
    .filter((a) => a.title);
}

// ============================================================================
// note ドラフト本体生成
// ============================================================================

function buildHook(a) {
  // 記事カテゴリに応じた hook テンプレ
  const cleanTitle = a.title.split('｜')[0];
  if (a.category === 'comparison') {
    return `「${cleanTitle.replace(/【.*?】/g, '').trim()}」——選び方で迷っている方へ。\n\n2026年の AI ツールはあまりにも選択肢が多く、「どれが自分に合うか」だけで時間を溶かしてしまいがちです。\n\n本記事は、AIpedia 編集部が実務で使い倒した結果を **数字で比較** して、用途別の最適解を整理したものの note 用ダイジェストです。`;
  }
  if (a.category === 'howto') {
    return `${cleanTitle.replace(/【.*?】/g, '').trim()} ——\n\n「気になっているけど、結局どこから始めれば？」と止まっている方へ。\n\n本記事では実務で使えるレベルまで落とし込んだ手順と、つまづきポイントの回避策をまとめました。`;
  }
  if (a.category === 'trend') {
    return `2026年のAI業界で見逃せないトレンド「${cleanTitle.replace(/【.*?】/g, '').trim()}」を整理しました。\n\n表面的なニュースだけでは見えにくい、業務への影響と対応の優先順位までまとめます。`;
  }
  if (a.category === 'review') {
    return `「${cleanTitle.replace(/【.*?】/g, '').trim()}」を実際に使ってわかった、評価できる点と物足りない点を整理します。\n\n業務で本当に使えるか判断するための材料として書きました。`;
  }
  // guide / fallback
  return `「${cleanTitle.replace(/【.*?】/g, '').trim()}」について、まず押さえておきたいポイントを note 用にまとめました。\n\nAIpedia の元記事から、特に重要な5項目を抜粋しています。`;
}

function buildBody(a, sections) {
  const cleanTitle = a.title.split('｜')[0];
  const url = `${SITE_URL}/guides/${a.slug}`;

  const sectionsHtml = sections.map((s) => {
    const summary = firstSentences(s.body, 2, 240);
    if (!summary) return null;
    return `## ${s.heading}\n\n${summary}`;
  }).filter(Boolean).join('\n\n---\n\n');

  // ハッシュタグ（記事タグ + 共通）
  const tagsClean = a.tags
    .slice(0, 3)
    .map((t) => '#' + t.replace(/[\s・\/-]/g, '').replace(/[【】「」『』]/g, ''));
  const commonTags = ['#AI', '#生成AI', '#AIツール', '#AIpedia'];
  const hashtags = [...tagsClean, ...commonTags].slice(0, 5).join(' ');

  // 関連リンク（カテゴリ別に3本）
  const RELATED = {
    comparison: [
      ['AIライティングツール徹底比較', '/guides/ai-writing-tools-comparison'],
      ['AIで始める副業ガイド', '/guides/ai-side-business-guide'],
      ['ChatGPT・Claude・Gemini 比較', '/guides/chatgpt-claude-gemini-2026-04'],
    ],
    howto: [
      ['AIで始める副業ガイド', '/guides/ai-side-business-guide'],
      ['AI議事録の始め方完全ガイド', '/guides/ai-meeting-notes-guide'],
      ['ブログ記事用のAI画像生成完全ガイド', '/guides/ai-image-blog-guide'],
    ],
    guide: [
      ['AIツール選びの完全フロー', '/guides/how-to-choose-ai-tool'],
      ['AIで始める副業ガイド', '/guides/ai-side-business-guide'],
      ['ChatGPT・Claude・Gemini 比較', '/guides/chatgpt-claude-gemini-2026-04'],
    ],
    review: [
      ['ChatGPT・Claude・Gemini 比較', '/guides/chatgpt-claude-gemini-2026-04'],
      ['AIライティングツール徹底比較', '/guides/ai-writing-tools-comparison'],
      ['AI議事録ツール徹底比較', '/guides/ai-meeting-notes-2026-spring'],
    ],
    trend: [
      ['ChatGPT・Claude・Gemini 比較', '/guides/chatgpt-claude-gemini-2026-04'],
      ['AIエージェント比較（非エンジニア向け）', '/guides/ai-agents-for-non-engineers-2026'],
      ['Gemini for Home 日本上陸', '/guides/gemini-for-home-japan-2026'],
    ],
  };
  const related = (RELATED[a.category] || RELATED.guide)
    .filter(([, p]) => !p.endsWith(`/${a.slug}`))
    .slice(0, 3);

  return {
    hook: buildHook(a),
    sectionsHtml,
    hashtags,
    related,
    cleanTitle,
    url,
  };
}

function buildNoteDraftMd(a) {
  const sections = parseArticleSections(path.join(GUIDES_DIR, a.file));
  const { hook, sectionsHtml, hashtags, related, cleanTitle, url } = buildBody(a, sections);

  const themeDir = SLUG_TO_THEME[a.slug];
  const thumbPath = themeDir
    ? `C:\\Users\\naoki\\OneDrive\\sns\\ai-pedia-contents-2026-04-22\\${themeDir}\\preview-cards\\og.png`
    : `C:\\Users\\naoki\\OneDrive\\sns\\ai-pedia-contents-2026-04-22\\article-${a.slug}\\preview-cards\\og.png`;

  const tldr = a.tldr || a.description;

  return `# 投稿用タイトル（確定）

\`\`\`
${cleanTitle}
\`\`\`

- note のタイトル欄にそのままコピペ
- サブタイトル欄は空欄でOK（本文冒頭で状況を語っています）

---

# 投稿用本文（ここから下を全てコピペ）

${hook}

---

## ${a.heroEmoji} 結論：今日のポイント

${tldr}

---

${sectionsHtml || `## 詳しい内容\n\n${a.description}`}

---

## 続きは ai-pedia.jp で

本記事は AIpedia の以下の詳細記事の要約です。

具体的な比較表・料金・実例・つまづきポイントまで、本編で詳しくまとめています：

👉 **[${cleanTitle}（ai-pedia.jp）](${url})**

「自分の業務に当てはめると？」が気になった方は、ぜひ本編もご覧ください。

---

## 関連トピック

${related.map(([title, p]) => `- [${title}（ai-pedia.jp）](${SITE_URL}${p})`).join('\n')}

---

（ここまでが本文。以下は投稿設定用のメモ、コピペ不要）

---

## note の投稿設定

### ハッシュタグ（最大5個推奨）

\`\`\`
${hashtags}
\`\`\`

### サムネイル画像

以下をファイル選択でアップロード：

\`\`\`
${thumbPath}
\`\`\`

横長 1200×630 の画像で note のヘッダーに最適。

### その他の設定

- カテゴリ：「${NOTE_CATEGORY[a.category] || 'テクノロジー'}」または「ビジネス」
- 有料設定：**OFF**（無料でリーチ最大化が目的）
- コメント：ON（読者との対話は評価シグナルになる）
- 予約投稿：朝7-9時 or 夜20-22時 が note 最もアクティブ

### 投稿後のアクション

1. X (@aipediajp) から投稿URLを引用RT
2. Instagram のプロフリンクを一時的に note URL に差し替えも検討
3. 48時間後に note ダッシュボードで PV・スキ数を確認

---

## 効果測定

- **note側**: ダッシュボード → 記事別ビュー
- **ai-pedia.jp側**: GA4 → 集客 → 参照元 → note.com のセッション数
- 期待値：投稿24時間以内に ai-pedia.jp に 10〜50PV の新規流入

---

## 元記事URL

${url}
`;
}

// ============================================================================
// main
// ============================================================================

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const articles = loadAllArticles().filter((a) => !slugFilter || a.slug === slugFilter);

  let generated = 0;
  let skipped = 0;
  for (const a of articles) {
    if (HAND_CRAFTED_SLUGS.has(a.slug) && !slugFilter) {
      skipped++;
      console.log(`  ⊘ ${a.slug} (hand-crafted draft 既存)`);
      continue;
    }
    const outFile = path.join(OUT_DIR, `note-${a.slug}.md`);
    if (!FORCE && fs.existsSync(outFile) && !slugFilter) {
      skipped++;
      console.log(`  ⊘ ${a.slug} (生成済)`);
      continue;
    }
    const md = buildNoteDraftMd(a);
    fs.writeFileSync(outFile, md, 'utf-8');
    generated++;
    console.log(`  ✓ note-${a.slug}.md`);
  }
  console.log(`\n✅ 生成: ${generated} 本 / スキップ: ${skipped} 本`);
  console.log(`   保存先: ${OUT_DIR}`);
}

main();
