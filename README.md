# AIツール比較ランキング

Astro 5 + Tailwind 4 で構築されたAIツール比較アフィリエイトサイト。
Cloudflare Pages へデプロイし、Google AdSense 承認後に広告を表示する想定で設計されています。

## 開発

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # dist/ に静的出力
npm run preview # ビルド結果をローカル確認
```

## ディレクトリ構成（要点）

```
src/
  data/
    tools.ts          # AIツールのマスターデータ（ここを編集するとランキング全体に反映）
    affiliate.ts      # アフィリエイトリンクのマッピング
  content/
    guides/*.md       # 特集・ガイド記事（Markdown + frontmatter）
  pages/
    index.astro       # トップ
    tools/[slug].astro
    category/[slug].astro
    guides/[...slug].astro
    compare.astro     # 横並び比較
    contact.astro     # 問い合わせ
  components/
    AdSlot.astro      # AdSense 広告枠
  layouts/
    BaseLayout.astro  # 全ページ共通レイアウト
scripts/
  generate-article.ts # LLM記事生成CLI
functions/
  api/contact.ts      # Cloudflare Pages Functions（問い合わせ受信）
public/
  ads.txt             # AdSense の publisher ID を記入
  _headers            # セキュリティヘッダ・キャッシュ
  _redirects
```

---

## 運用ロードマップ（1ヶ月 → AdSense申請）

### Week 0：デプロイと初期設定

1. 独自ドメイン取得（後述）
2. GitHub リポジトリ作成 → Cloudflare Pages と連携
3. ドメインを Cloudflare Pages に接続
4. **公開**（空コンテンツでも一度ライブにする）

### Week 1-2：コンテンツ量増強

- `scripts/generate-article.ts` で **週3〜5記事** 追加
- 公開前は必ず人間レビューで事実確認と独自情報30%追記
- 目標：**記事数 20本以上、合計ページ 30以上**

### Week 3：アフィリエイト登録＆リンク差し替え

- a8.net ／もしもアフィリエイト等に登録（後述）
- 審査通過後、`src/data/affiliate.ts` にURLを記入

### Week 4：AdSense 申請

- `ads.txt` に承認後の publisher ID を記入
- `.env` に `PUBLIC_ADSENSE_CLIENT` / 各スロットID を設定
- Google Search Console 登録 → sitemap送信
- AdSense申請 → 通常1〜3週間で審査

---

## Cloudflare Pages デプロイ手順

### 1. GitHub リポジトリ作成

```bash
gh repo create ai-tools-ranking --private --source=. --remote=origin --push
```

（`gh` がなければ GitHub Web でリポジトリを作り `git remote add origin ...` で接続）

### 2. Cloudflare Pages プロジェクト作成

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git
2. リポジトリを選択
3. ビルド設定:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: **20** 以上

### 3. 環境変数（Cloudflare Pages 管理画面で設定）

| Key | 値の例 | 説明 |
|---|---|---|
| `PUBLIC_ADSENSE_CLIENT` | `ca-pub-XXXXXXXXXXXXXXXX` | AdSense承認後 |
| `PUBLIC_ADSENSE_SLOT_IN_ARTICLE_TOP` | `1234567890` | 広告ユニットID |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | 問い合わせ通知（任意） |
| `RESEND_API_KEY` | `re_...` | 問い合わせメール送信（任意） |
| `CONTACT_TO_EMAIL` | `you@example.com` | |
| `CONTACT_FROM_EMAIL` | `noreply@yourdomain.com` | |

### 4. カスタムドメイン接続

Cloudflare Pages → Custom domains → Add → 取得したドメインを入力。
Cloudflare でドメイン取得した場合は DNS 自動設定。他社の場合は NS 変更 or CNAME 設定が必要。

### 5. sitemap を Google Search Console に登録

デプロイ後：
1. [Google Search Console](https://search.google.com/search-console) にドメインを追加
2. DNS TXT レコードで所有権確認
3. サイトマップ `https://yourdomain.com/sitemap-index.xml` を送信

---

## ドメイン取得のおすすめ

| サービス | 特徴 | 推奨TLD |
|---|---|---|
| **Cloudflare Registrar** | 原価提供で最安、Pagesとの統合が完璧 | `.com` ¥1,400/年程度 |
| お名前.com | 初年度が極端に安い、更新は割高 | `.com` / `.jp` |
| ムームードメイン | 国内老舗、管理画面が日本語で分かりやすい | `.com` / `.jp` |

**推奨**: Cloudflare Registrar × `.com`。Pagesとの統合、WHOIS秘匿、原価販売で長期的に最安です。

ドメイン名は `aitools-rank.com`、`ai-hikaku.com`、`ai-comparison.jp` など、短く覚えやすいものを。

---

## アフィリエイト登録のおすすめ（優先順）

### 1. a8.net — 最優先
- 国内最大手、SaaS案件が最も豊富
- 登録無料、審査は比較的緩い（当サイトレベルなら通過可能）
- セルフバック（自己アフィリエイト）も利用可
- [申込み](https://www.a8.net)

### 2. もしもアフィリエイト
- 国内第2位、Amazon/楽天アソシエイトを一括管理できる
- W報酬制度で報酬+12%
- [申込み](https://af.moshimo.com)

### 3. ValueCommerce
- Yahoo! 系、大手企業案件多数
- やや審査厳しめ（記事数20本以上あれば通りやすい）

### 4. Amazon アソシエイト
- ガジェット書籍等で活用、単価は低いが決定率高い
- **3件の売上が発生しないと本審査に進まない**ので早めに登録

### 5. 各SaaSの直接プログラム
- **Anthropic Partner Program**（Claude）
- **OpenAI Partnership**（現状個人向けは限定的）
- **Notion Affiliate**（月次報酬高）
- **Cursor Affiliate**（個人でも応募可）

### 登録後のリンク反映

アフィリURLを取得したら、`src/data/affiliate.ts` の `affiliateUrls` に slug → URL でマッピングするだけ。サイト全体で自動反映され、`rel="sponsored"` が自動付与されます。

```typescript
export const affiliateUrls: Record<string, string> = {
  'chatgpt': 'https://px.a8.net/svt/ejp?a8mat=XXXX&...',
  'claude': 'https://...',
};
```

---

## 記事の追加（LLMパイプライン）

```bash
# API Key 設定
export ANTHROPIC_API_KEY=sk-ant-...

# 比較記事生成
npx tsx scripts/generate-article.ts \
  --topic "ai-transcription-comparison" \
  --category comparison \
  --related "elevenlabs" \
  --title "AI文字起こしツール徹底比較"
```

**必ず公開前に人間レビュー**：
1. 事実確認（料金・機能を公式サイトで確認）
2. 独自要素（編集部の実体験・具体数値）を30%以上追記
3. SEO タイトル・meta description を調整

---

## AdSense 申請チェックリスト

- [ ] 記事数 20本以上
- [ ] 各記事1500字以上
- [ ] 独自ドメインで公開済み（3週間以上運用）
- [ ] プライバシーポリシー `/privacy`
- [ ] 運営者情報 `/about`
- [ ] 問い合わせ `/contact`（動作確認済み）
- [ ] アフィリエイト開示 `/disclosure`
- [ ] `ads.txt` 配置
- [ ] Google Search Console 登録、sitemap 送信
- [ ] モバイル表示の崩れがない
- [ ] 画像の alt 属性漏れなし
- [ ] コンテンツがコピーではなくオリジナル

すべてチェック後、[AdSense 申請](https://www.google.com/adsense/)。
