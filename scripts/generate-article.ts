/**
 * LLM 記事生成パイプライン（CLI）
 *
 * 使い方:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/generate-article.ts --topic "notion-ai-vs-obsidian-2026" --category comparison
 *
 * 仕組み:
 *   1. コマンドライン引数から記事トピックと種別を受け取る
 *   2. 既存のツールデータ（src/data/tools.ts）をコンテキストとして Claude API に渡す
 *   3. 「独自評価軸」と「Scaled Content Abuses 回避」のためのプロンプト制約を付与
 *   4. Markdown 原稿を生成 → src/content/guides/ に保存
 *   5. 生成後は必ず人間がレビュー＆追記してから公開（Google AdSense・Scaled Content Abuses 対策）
 *
 * 編集部ルール（重要）:
 *   - 生成直後の記事は公開しない。必ず編集部が「独自の経験・評価・数値」を最低30%追記する
 *   - ファクトチェック（価格・機能の最新性）は人間が確認する
 *   - 同一ツールの記事を1週間に3本以上公開しない（不自然な量産を避ける）
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tools } from '../src/data/tools';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_DIR = path.resolve(__dirname, '../src/content/guides');

type Category = 'comparison' | 'howto' | 'guide' | 'review' | 'trend';

interface Args {
  topic: string;
  category: Category;
  relatedTools: string[];
  title?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = { relatedTools: [], dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--topic') args.topic = argv[++i];
    else if (a === '--category') args.category = argv[++i] as Category;
    else if (a === '--title') args.title = argv[++i];
    else if (a === '--related') args.relatedTools = argv[++i].split(',').map((s) => s.trim());
    else if (a === '--dry-run') args.dryRun = true;
  }
  if (!args.topic || !args.category) {
    throw new Error(
      'Usage: tsx scripts/generate-article.ts --topic <slug> --category <comparison|howto|guide|review|trend> [--related chatgpt,claude] [--title "..."] [--dry-run]',
    );
  }
  return args as Args;
}

function buildPrompt(args: Args) {
  const relatedTools = args.relatedTools
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter(Boolean)
    .map((t) => JSON.stringify(t, null, 2))
    .join('\n\n');

  const categoryGuide = {
    comparison: '2〜4本のツールを「料金・機能・日本語精度・用途別」で比較し、読者のタイプごとに結論を出す',
    howto: '読者の具体的な問題を1つ設定し、段階的に解決する実践ガイド',
    guide: 'あるカテゴリの選び方・入門知識を体系的にまとめる',
    review: '1つのツールを実使用レベルで深掘りし、メリット・デメリット・代替案を提示',
    trend: '業界の最新動向・予測・個人/企業への提言',
  }[args.category];

  return `あなたは日本のテックメディアの編集者です。AIツール比較サイトの特集記事を執筆します。

# 目的
${categoryGuide}

# 必須要件
- 文字数: 1800〜2800字（冗長にならない範囲で実用情報を最大化）
- 構成: 見出し（H2/H3）を使って読みやすく、スマホ閲覧前提
- 独自性: 「編集部が実使用した結果」として具体数値・体験談を織り交ぜる（※生成後に人間が事実ベースで置換する前提）
- 避ける: 一般論の羅列、「〜と言われています」等の曖昧表現、既存ツールの誇張表現
- 含める: 比較表（Markdown table）、用途別の推奨、料金の具体値、まとめ

# トピック
${args.title ?? args.topic}

# 関連ツールデータ（JSON）
${relatedTools || '（指定なし）'}

# 出力フォーマット
Markdown。最初に frontmatter を出力する:
---
title: "..."
description: "..."（120字以内、SEO説明文）
publishedAt: ${new Date().toISOString().slice(0, 10)}
category: ${args.category}
heroEmoji: "..."
heroGradient: "from-... via-... to-..."
featured: false
relatedTools: [${args.relatedTools.map((s) => `"${s}"`).join(', ')}]
readTimeMin: 7
tags: [...]
---

本文は frontmatter の下に続けて出力。本文末尾に「まとめ」H2 セクションを必ず置く。`;
}

async function callClaude(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is required');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  }
  const data: any = await res.json();
  return data.content?.[0]?.text ?? '';
}

function extractFrontmatterBody(md: string): { body: string } {
  // 先頭の ```markdown 等の fence を除去
  const cleaned = md.replace(/^```(?:markdown|md)?\n/, '').replace(/\n```\s*$/, '');
  return { body: cleaned.trim() };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`[generate] topic=${args.topic} category=${args.category}`);

  const prompt = buildPrompt(args);
  if (args.dryRun) {
    console.log('---- PROMPT ----');
    console.log(prompt);
    return;
  }

  console.log('[generate] calling Claude...');
  const raw = await callClaude(prompt);
  const { body } = extractFrontmatterBody(raw);

  const outPath = path.join(GUIDES_DIR, `${args.topic}.md`);
  await fs.mkdir(GUIDES_DIR, { recursive: true });
  await fs.writeFile(outPath, body, 'utf8');

  console.log(`[generate] wrote ${outPath}`);
  console.log('[generate] ⚠ 公開前に必ず以下を実施してください:');
  console.log('  1. 事実確認（料金・機能は公式サイトで最新版をチェック）');
  console.log('  2. 独自要素の追記（編集部の実体験・独自評価スコア等）');
  console.log('  3. タイトル・説明文を SEO 観点でチューニング');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
