# scripts/

## generate-article.ts — LLM 記事生成

Claude API を利用して記事ドラフトを生成するCLIツール。**公開前に必ず人間のレビューと追記**が必要です（Google AdSense の Scaled Content Abuses ポリシー対策）。

### セットアップ

```bash
npm install -D tsx @types/node
```

### 使い方

```bash
# Anthropic API Key を環境変数で設定
export ANTHROPIC_API_KEY=sk-ant-...

# 比較記事を生成
npx tsx scripts/generate-article.ts \
  --topic "notion-ai-vs-obsidian-2026" \
  --category comparison \
  --related "notion-ai" \
  --title "Notion AI vs Obsidian — どちらを選ぶか"

# ドライラン（プロンプトのみ確認）
npx tsx scripts/generate-article.ts --topic sample --category guide --dry-run
```

### 公開までのワークフロー

1. `npx tsx scripts/generate-article.ts ...` で `src/content/guides/<topic>.md` を生成
2. **事実確認**: 料金・機能は公式サイトで最新版を確認
3. **独自要素の追加**: 編集部の実体験・独自スコア・具体的な利用シーンを最低30%追記
4. **SEO チューニング**: タイトル・descriptionを主要キーワード込みで調整
5. `npm run dev` でプレビュー → `npm run build` でビルド確認
6. Git commit → Cloudflare Pages が自動デプロイ

### 量産ペースの目安

- AdSense 審査前: **週2〜3本**（自然な更新頻度）
- 承認後: **週5〜10本**（同一ツールの連投は避ける）
- 1日10本以上の連続投稿は Scaled Content Abuses のトリガーになる可能性があるため避ける
