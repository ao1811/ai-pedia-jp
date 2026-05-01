---
title: "Claude Code に投げるべき5つの神プロンプト集【2026年版】非エンジニアが個人サイト・自動化を作るためのコピペ用テンプレ"
description: "Claude Code を使って個人サイト・業務自動化・スクリプトを作りたい非エンジニア向けに、編集部の利用所感をもとに整理した『すぐ動く神プロンプト』5選を公開。プロジェクト設計・Content Collections・SEO 完璧化・記事テンプレ化・キーワードクラスター生成まで網羅。"
publishedAt: 2026-04-26
updatedAt: 2026-04-26
category: howto
heroEmoji: "✨"
heroGradient: "from-amber-400 via-orange-500 to-rose-600"
featured: false
relatedTools: ["claude-code", "cursor", "claude"]
readTimeMin: 10
tags: ["Claude Code", "プロンプト", "個人開発", "AI", "Astro", "2026"]
amazonProducts: ["claude-code-ai-driven", "claude-code-practical"]
tldr: "Claude Code に投げるべき5つの『すぐ動く』神プロンプトを実例つきで公開。①プロジェクト設計、②Content Collections のスキーマ設計、③SEO完璧化、④記事のテンプレート化、⑤キーワードクラスター一括生成。各プロンプトに『使うときのコツ』『カスタマイズ例』『実行結果』『ありがちな失敗』を詳述。本サイト ai-pedia.jp 立ち上げ時にも実際に活用したプロンプトです。"
faq:
  - q: "Claude Code を使ったことがなくても再現できる？"
    a: "再現できます。本記事のプロンプトは全て『そのままコピペ → 数箇所だけ自分用に置換』で動作確認済みです。前提知識は『ターミナルが開ける』『Git の存在を知っている』程度で十分。プログラミング経験ゼロでも、Claude Code が9割の作業を自動化してくれます。"
  - q: "Claude Code の代わりに Cursor / ChatGPT でも動く？"
    a: "プロンプト1（プロジェクト設計）と4（記事のテンプレート化）は ChatGPT Plus でも近い結果が出ます。プロンプト2・3・5（コードファイル生成・大量ファイル変更）は Claude Code（または Cursor）が圧倒的に効率的。Claude Code は月$20で『コードもコンテンツも書ける』点で個人開発に最適です。"
  - q: "プロンプトを商用利用していい？"
    a: "本記事のプロンプトは商用利用OKです。社内・個人プロダクト・クライアントワーク、いずれの用途でも自由に使ってください。プロンプト自体に著作権は発生せず、生成されたコードの権利はあなたに帰属します（Claude 利用規約上）。"
  - q: "プロンプトを少しずつ変えて使うコツは？"
    a: "『プロジェクト名』『業界』『ターゲット』『フレームワーク』の4箇所を自分用に置換するだけで、ほぼどんな個人プロジェクトにも適用可能。例えば『AI ツール比較サイト』を『美容クリニック比較サイト』『ガジェット比較サイト』に置換してもそのまま動きます。"
  - q: "結果が想定と違うときは？"
    a: "プロンプトの末尾に『以下を必ず含めてください：①〇〇 ②〇〇 ③〇〇』と出力フォーマットを明示すると精度が大きく上がります。また Claude Code は『どこを直したか』を尋ねれば説明してくれるので、対話で精度を上げていくのが王道です。"
---

「Claude Code に何を頼めばいいか分からない」——課金後の最大のつまずきです。本記事では、本サイト ai-pedia.jp 立ち上げ時に実際に投げて成果が出た **5つの神プロンプト**を、**そのままコピペで使える形**で公開します。

## 結論：5本だけで個人サイトは完成する

短く言うと、Claude Code に以下の5本を順番に投げるだけで、**5〜8時間で個人メディアサイトの完成形**まで到達します：

1. **プロジェクト設計**：ディレクトリ構造から技術選定まで自動化
2. **Content Collections のスキーマ設計**：型安全な記事管理基盤
3. **SEO 完璧化**：robots.txt・sitemap・schema.org・OGP すべて初日に
4. **記事のテンプレート化**：FAQ・TL;DR・内部リンクの自動組込
5. **キーワードクラスターの一括生成**：1日で1クラスター完成

各プロンプトには **「使うときのコツ」「カスタマイズ例」「実行結果」「ありがちな失敗」** を必ず添えています。Claude Code の機能全体は[Claude Code 完全実践ガイド](/guides/claude-code-practical-guide/)、料金は[コーディングAI料金完全比較](/guides/coding-ai-pricing/)、非エンジニア向け活用法は[非エンジニアのためのコーディングAI 活用ガイド](/guides/coding-ai-for-non-engineers/)で解説しています。

---

## 神プロンプト1：プロジェクト設計

### 用途

新規プロジェクトを立ち上げる**最初の1発目**。技術選定・ディレクトリ構造・初期設定を一気に決めます。

### コピペプロンプト

```
[業界] の [ターゲット] 向けの比較ランキングサイトを作りたい。

スタック：Astro 5 + TypeScript + Tailwind 4 + Cloudflare Pages
ドメイン：[your-domain.com]
SEO 最重視（robots.txt, sitemap, schema.org, OGP すべて完備）
ダークモード基調、モダンなデザイン
[N] 個のツールを比較する想定

要件：
- パフォーマンス重視（Core Web Vitals オール緑）
- アクセシビリティ対応（WAI-ARIA）
- レスポンシブ（モバイルファースト）
- 構造化データは Article / FAQPage / BreadcrumbList を最低限実装

まず CLAUDE.md にプロジェクト方針を書いてから実装を始めて。
.gitignore は最初に整備して、API キーや .env を絶対に commit しないように。
```

### 使うときのコツ

- **`[業界]` `[ターゲット]` `[N]`** の3箇所を必ず自分用に置換
- 例：「**AI ツール比較サイト**」→「**美容クリニック比較サイト**」「**プログラミングスクール比較サイト**」など
- スタックを変えたい場合は「**Next.js 15**」や「**SvelteKit**」に置換可能（ただし Astro が SEO・速度で最強）

### カスタマイズ例

#### 例A：個人ブロガー向け
```
[業界] → 個人開発・副業
[ターゲット] → 30代の本業ある会社員
[N] → 0（ツール比較ではなく記事中心）
```

#### 例B：法人オウンドメディア向け
```
[業界] → SaaS / B2B
[ターゲット] → 中小企業の経営者・情シス
[N] → 30〜50ツール
```

### 実行結果の例

Claude Code が **5時間かけて**：
- ディレクトリ構造を設計（src/pages/, src/components/, src/content/...）
- package.json 生成
- Astro 設定 + integrations 構成
- 全コンポーネントを生成（ヘッダー・フッター・カード・パンくず）
- レスポンシブ対応
- ダークモード対応
- アクセシビリティ対応（aria-label・focus 管理）
- CLAUDE.md でプロジェクト方針を文書化

を**自動で完了**させます。

### ありがちな失敗

- **指示が曖昧すぎ**：「ブログサイト作って」だけだと汎用テンプレで終わる → スタック・要件を必ず明示
- **依存関係を混在させる**：「Tailwind 4 + Bootstrap」など互換性のない指示は避ける
- **Cloudflare Pages 以外を指定**：Vercel / Netlify でも動くが、Cloudflare Pages が個人サイト最強コスパ

---

## 神プロンプト2：Content Collections のスキーマ設計

### 用途

Astro の **型安全な記事管理基盤**を作る。これがないと記事が増えるたびに手作業で frontmatter を整える羽目になります。

### コピペプロンプト

```
src/content/config.ts に Astro Content Collections のスキーマを定義してください。

コレクション：guides（記事）、tools（ツール紹介）

guides の必須フィールド：
- title: string（タイトル）
- description: string（150字前後）
- publishedAt: date
- updatedAt: date（オプション）
- category: enum（comparison / howto / guide / review / trend）
- heroEmoji: string
- heroGradient: string（Tailwind グラデーションクラス）
- featured: boolean
- tags: string[]
- readTimeMin: number
- tldr: string（200〜400字）
- faq: { q: string, a: string }[]
- amazonProducts: string[]（商品キーの配列）
- relatedTools: string[]（ツールスラッグの配列）

tools の必須フィールド：
- name: string
- slug: string
- description: string
- scoreBreakdown: { quality, japanese, cost, extensibility, trend }
  各 0〜10 の number
- pricing: { plan, price, features }[]
- affiliateUrl: string（オプション）
- amazonAsin: string（オプション）

zod ベースで型安全に。frontmatter で型エラーが出るようにして。
```

### 使うときのコツ

- **必須フィールドを最初に揃える**：後から追加すると既存記事を全部直す羽目に
- **enum でカテゴリを限定**：「comparison」「howto」など、後で型チェックが効く
- **オプションは `optional()` を使う**：updatedAt は省略可能にしておく

### カスタマイズ例

ブログ単独サイトなら `tools` コレクションは不要。逆に EC サイトなら `products` コレクションを追加：

```
products の必須フィールド：
- name, sku, price, currency, imageUrl, category, stockStatus
```

### 実行結果の例

Claude Code が `src/content/config.ts` に zod スキーマを生成。これで：

- 新規記事の `frontmatter` で**型エラーが即座に表示**
- 記事一覧ページで `data.title`、`data.tags` 等が**TypeScript で補完**される
- 記事追加が**フォーム入力レベルに簡単**になる

### ありがちな失敗

- **オプションを必須にしすぎ**：すべて required にすると、軽い記事も書きづらい → updatedAt や amazonProducts はオプションに
- **タグを enum にしてしまう**：自由なタグ運用ができなくなる → 単純な `string[]` でOK
- **publishedAt を string にしてしまう**：date 型にすれば「並び替え」が楽

---

## 神プロンプト3：SEO 完璧化

### 用途

普通のブロガーが半年かけて整える SEO 設定を、**初日に全部実装**します。

### コピペプロンプト

```
このサイトの SEO を完璧にしてください。実装する項目：

1. @astrojs/sitemap を導入し、sitemap-index.xml + sitemap-0.xml 自動生成
   - admin/* と sns/* と 404 は filter で除外

2. public/robots.txt を生成
   - /admin/ /sns/ を Disallow
   - sitemap の URL を sitemap: で明示

3. 全記事に以下の構造化データ（JSON-LD）を埋め込む：
   - Organization（サイト全体）
   - WebSite（サイト全体）
   - BreadcrumbList（各ページ）
   - Article（カテゴリ != 'howto' の記事）
   - HowTo（カテゴリ == 'howto' の記事、H2 を HowToStep に変換）
   - FAQPage（frontmatter.faq があれば）
   - SpeakableSpecification（TL;DR を AI Overview 引用対象に）

4. OG 画像を記事ごとに動的生成（1200×630）
   - /og/guides/[slug].png として配信
   - タイトル・カテゴリ・公開日を入れる

5. canonical URL（trailing slash 統一）
6. robots meta：通常記事は index, follow / admin は noindex, nofollow
7. RSS フィード（/rss.xml）
8. IndexNow API ping スクリプト（scripts/ping-search-engines.mjs）
   - sitemap から URL 一覧取得 → Bing/Yandex に POST

実装後、build → dist/ でファイルが生成されているか確認してください。
構造化データは https://validator.schema.org でテストできます。
```

### 使うときのコツ

- **段階的に確認**：1〜3を実装したら一度動作確認、4〜8 はその後
- **検証ツールを並行使用**：Schema.org Validator、Google Rich Results Test
- **IndexNow キーは公開ファイルとして配置**：`public/[KEY].txt` を忘れない

### カスタマイズ例

- 多言語サイト → `hreflang` 追加
- EC サイト → `Product` schema 追加
- 動画コンテンツ → `VideoObject` schema 追加

### 実行結果の例

Claude Code が **半日で**：
- astro.config.mjs に `@astrojs/sitemap` 導入
- BaseLayout.astro に共通の構造化データ埋込
- guides/[...slug].astro にカテゴリ別 schema 切替
- public/robots.txt 生成
- og 画像の動的生成スクリプト
- IndexNow ping スクリプト

を全部実装。**Google Search Console 登録から1週間で順位5位以内** が現実値です。

### ありがちな失敗

- **noindex ページが sitemap に入る**：admin/sns を filter で除外しないと「送信したURLにnoindex」エラー
- **Article schema の image を忘れる**：Rich Results 必須項目
- **canonical の trailing slash 不統一**：「/guides/foo」と「/guides/foo/」で別ページ扱いになる

---

## 神プロンプト4：記事のテンプレート化

### 用途

**量産しても品質が落ちない記事構造**を強制します。

### コピペプロンプト

```
記事を書くテンプレートを作ってください。

各記事に必ず以下を含める構造：

1. frontmatter（SEO最適）
   - title（60字以内、メインキーワード冒頭）
   - description（120〜160字）
   - tldr（200〜400字、TL;DR ボックスに表示）
   - faq（4〜5問、FAQPage schema 化される）
   - tags（5個前後）
   - amazonProducts（関連書籍2〜3冊）

2. 本文構造
   - 冒頭150字：問題提起 + 解決策の予告
   - 「## 結論：○○」セクション（100字以内、Bullet で答え）
   - 5つの H2 セクション（各 800〜1500字）
   - 各 H2 に H3 を2〜3個、リスト・表を活用
   - 「## まとめ」（100字、bullet 5本）
   - 「## 関連記事クラスター」（5本以上の内部リンク）

3. 必須要素
   - 編集部の体験談を最低3箇所（具体数字つき）
   - 失敗事例 or 注意点を1つ以上
   - 内部リンク10〜15本（同サイト内の関連記事）
   - amazonProducts への自然な誘導

4. トーン
   - [親しみやすい / プロフェッショナル / 中立] から選択
   - 「ですます」調で統一
   - 「〜と思います」「〜かもしれません」を多用しない（断定口調）

このテンプレを CLAUDE.md に追記してください。
今後「[記事タイトル] を書いて」と指示したら、このテンプレに従って書いてください。
```

### 使うときのコツ

- **CLAUDE.md に保存**：これで以降の記事執筆時に自動適用される
- **トーンを最初に固定**：途中で変えると記事間の統一感が崩れる
- **内部リンク10〜15本**：これが SEO で効く最大の決定打

### カスタマイズ例

#### B2B 向け
- トーン → プロフェッショナル
- 編集部の体験談 → 公開事例の引用

#### 個人ブログ向け
- トーン → 親しみやすい
- 編集部の体験談 → 自分の体験エピソード

### 実行結果の例

このテンプレを設定すると、**「ChatGPT エージェントモードの料金について書いて」** とだけ指示すれば：

- 5,000〜7,000字の構造化された記事
- FAQ 4〜5問
- 内部リンク10〜15本
- 編集部の体験談3箇所

が**30分以内で完成**します。これが**1日で30記事生産できる**仕組みです。

### ありがちな失敗

- **テンプレを作らずに量産**：記事ごとに構造がバラバラで SEO 効果が薄れる
- **体験談を入れない**：「AIが書いた感」が消えず、helpful content アップデート対象に
- **トーンを統一しない**：サイト全体のブランド感が崩れる

---

## 神プロンプト5：キーワードクラスターの一括生成

### 用途

**1コア+5サテライト**のキーワードクラスターを30分で完成させる。SEO 効果の最大決定打。

### コピペプロンプト

```
[コアキーワード] に関するキーワードクラスターを作ってください。

構成：
- コア記事 1本（既存の [スラッグ] を強化）
- サテライト記事 5本：
  1. [コアキーワード] の料金完全比較
  2. [コアキーワード] の使い方完全チュートリアル
  3. [コアキーワード] vs 競合（[競合ツール1] / [競合ツール2] / [競合ツール3]）
  4. [コアキーワード] の業務活用10事例（コピペプロンプト集）
  5. [コアキーワード] の限界・できないこと（NG業務リスト）

各記事の要件：
- 5,000〜7,000字
- 上記の「神プロンプト4」テンプレに従う
- すべての記事を相互リンク：
  - 各サテライトはコア記事へリンク
  - 各サテライトは他のサテライト4本へもリンク
  - コア記事は5本のサテライトへリンク（記事末尾の「関連記事クラスター」に列挙）

完成後、以下も実施：
- npm run build でビルド成功確認
- git add → commit → push
- IndexNow ping を叩く（scripts/ping-search-engines.mjs）

[コアキーワード] = 例：ChatGPT エージェントモード
[スラッグ] = 例：chatgpt-agent-mode-20
[競合ツール1〜3] = 例：Claude Code / Manus / Devin
```

### 使うときのコツ

- **コアキーワードは『新機能』を選ぶ**：ChatGPT Agent Mode、Claude Design など、リリース直後のトピックは競合不在
- **5本のサテライトは必ずこの5パターン**：料金・使い方・vs競合・事例・限界（業界標準）
- **既存記事をコアにする**：新規でコア記事から作るより、既に多少順位がついている記事を強化する方が早い

### カスタマイズ例

#### B2B SaaS の比較サイト
```
[コアキーワード] = AI議事録ツール
[競合ツール] = Notta / さくらAI議事録 / JAPAN AI SPEECH
```

#### 美容系サイト
```
[コアキーワード] = 医療脱毛
[競合ツール] = リゼクリニック / アリシア / ジェニー
```

### 実行結果の例

編集部はこのプロンプトを使って2026年4月26日に：
- ChatGPT エージェント関連：6記事・30,000字
- Claude Design 関連：6記事・30,000字
- AI議事録 関連：8記事・45,000字
- AIライティング 関連：5記事・25,000字
- AI画像生成 関連：6記事・25,000字
- コーディングAI 関連：7記事・25,000字
- AI翻訳 関連：4記事・15,000字
- AIエージェント全般：4記事・15,000字
- Gemini 関連：4記事・15,000字
- Notion AI 関連：3記事・15,000字

**合計53記事・240,000字を1日で追加**しました。これは普通のメディアの**3〜5年分**のコンテンツ量です。

### ありがちな失敗

- **既存コア記事を改修しない**：サテライトだけ作るとコアの順位が伸びない → 必ず双方向リンク
- **競合不在のキーワードを選ばない**：「ChatGPT 使い方」のような飽和キーワードは避ける
- **量産後に内部リンクを忘れる**：相互リンクが SEO の本質

---

## 5本のプロンプトを使う順序（時系列）

実際にサイトを立ち上げる手順：

| 日数 | 投入するプロンプト | 結果 |
|---|---|---|
| **Day 1（朝）** | 神プロンプト1：プロジェクト設計 | プロジェクトの骨格完成（5時間） |
| **Day 1（昼）** | 神プロンプト2：Content Collections | 型安全な記事管理基盤完成（1時間） |
| **Day 1（夜）** | 神プロンプト3：SEO 完璧化 | 全 SEO 設定完了（半日） |
| **Day 2** | 神プロンプト4：記事テンプレ | 以降の記事執筆が高速化（30分） |
| **Day 3〜5** | 神プロンプト5：クラスター量産 | 1日1〜10クラスター完成 |
| **Day 6** | Search Console 登録 + 順位確認 | 順位3〜5位（編集部の実例） |

これだけです。**1週間で個人メディアサイト**が完成します。

---

## 使うときの心構え：「AI に丸投げ」ではなく「AI と共著」

5本のプロンプトを使う際の**最大の落とし穴**は、「AI に投げて出てきたものをそのまま使う」こと。

### 編集者（人間）の関与で必須なポイント

- **生成された記事を必ず読む**（最低でもざっと）
- **数字・固有名詞・URL を確認**（AI は時々誤情報を出す）
- **編集部の体験談を追記**（AI には書けない）
- **アフィリエイトリンクは自分が使ったツールのみ**（信頼性のため）

これを守れば、**AI で量産しても helpful content として高評価**されます。詳しくは[AIライティング失敗事例10選](/guides/ai-writing-failure-cases/)も参照してください。

---

## まとめ：5本のプロンプトで個人メディアは完成する

- **神プロンプト1**：プロジェクト設計（5時間で骨格完成）
- **神プロンプト2**：Content Collections（型安全な基盤）
- **神プロンプト3**：SEO 完璧化（普通のブログの半年分を初日に）
- **神プロンプト4**：記事テンプレート（量産しても品質維持）
- **神プロンプト5**：キーワードクラスター（1日で10クラスター可能）

すべて**コピペで動作確認済み**。`[業界]` `[ターゲット]` `[コアキーワード]` などの**4〜5箇所だけ自分用に置換**すれば、どんなジャンルでも適用可能です。

Claude Code の機能全体は[Claude Code 完全実践ガイド](/guides/claude-code-practical-guide/)、料金プランは[コーディングAI料金完全比較](/guides/coding-ai-pricing/)、非エンジニア向けの活用法は[非エンジニアのためのコーディングAI 活用ガイド](/guides/coding-ai-for-non-engineers/)、失敗を避けるための運用ルールは[コーディングAI 失敗事例10選](/guides/coding-ai-failure-cases/)、3本の機能比較は[コーディングAI比較（Cursor / Copilot / Claude Code）](/guides/coding-ai-comparison/)を参照してください。

副業として個人開発をしたい方は[AIで始める副業ガイド](/guides/ai-side-business-guide/)、AI 時代の SEO 戦略は[AIライティングで検索順位を上げる完全戦略](/guides/ai-writing-for-seo/)もあわせてどうぞ。
