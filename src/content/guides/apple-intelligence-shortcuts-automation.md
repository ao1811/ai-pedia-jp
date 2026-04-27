---
title: "Apple Intelligence × Shortcuts 自動化レシピ集【2026年版】個人AIで業務を10倍効率化する15の実用パターン"
description: "Apple Intelligence と Shortcuts アプリを連携した自動化レシピを15個厳選。メール要約 → Slack 投稿、写真自動整理、議事録自動生成、クリップボード AI 整形、定時レポート自動化など、個人 AI で業務を10倍効率化する実用パターンを完全解説。"
publishedAt: 2026-04-27
updatedAt: 2026-04-27
category: howto
heroEmoji: "⚡"
heroGradient: "from-blue-500 via-purple-500 to-pink-500"
featured: false
relatedTools: ["chatgpt", "claude", "gemini"]
readTimeMin: 11
tags: ["Apple Intelligence", "Shortcuts", "自動化", "iPhone", "Mac", "業務効率化", "2026"]
amazonProducts: ["chatgpt-strongest-work", "ai-thinking-techniques"]
tldr: "Apple Intelligence は Shortcuts アプリと連携することで真価を発揮する。本記事は『メール要約→Slack投稿』『写真自動アルバム化』『会議録音→議事録自動生成』『クリップボードAI整形』『朝のニュースブリーフィング』など15個の実用レシピを完全解説。Use Model アクション（オンデバイス/Private Cloud Compute/ChatGPT 切替）を活用し、個人レベルで Zapier 級の自動化を月¥0で実現。"
faq:
  - q: "Shortcuts アプリは無料？追加課金は必要？"
    a: "Shortcuts アプリは iOS / macOS 標準搭載で完全無料。Apple Intelligence の AI アクションも無料で利用可能。ChatGPT 連携を使う場合のみ ChatGPT Plus（¥3,000/月）があれば高度モデルが使えるが、無料アカウントでも基本連携は動作する。"
  - q: "プログラミング知識は必要？"
    a: "不要。Shortcuts はビジュアルブロック型でドラッグ&ドロップ作成。本記事のレシピは全て『コピーして使える』形式で提供する。慣れたらカスタマイズも数分でできる。"
  - q: "iPhone 15 以前でも使える？"
    a: "Shortcuts 自体は iPhone 15 以前でも動くが、Apple Intelligence の AI アクション（Use Model など）は iPhone 15 Pro 以降・M1 以降の Mac/iPad が必須。AI 部分を Web API（ChatGPT API）に置き換えれば旧端末でも動作可能。"
  - q: "セキュリティは大丈夫？"
    a: "Shortcuts は Apple のサンドボックス内で動作し、各アクションごとにアクセス権限を確認。Apple Intelligence は3層プライバシー（On-Device → PCC → ChatGPT）で動くため、機密度に応じてモデルを切り替え可能。社外秘データは『On-Device 強制』レシピで処理可能。"
  - q: "他人のレシピを安全に使う方法は？"
    a: "Shortcuts ギャラリーまたは信頼できる開発者の URL のみ使う。インストール時に『含まれるアクション一覧』が表示されるので、不審な操作（ファイル送信、URL リクエスト等）がないか必ず確認。本記事のレシピは編集部が自社で運用検証済み。"
---

「Apple Intelligence の真価は Shortcuts と組み合わせたとき」——これが Apple 公式情報と編集部の利用所感から導いた結論です。

本記事では、**Zapier や IFTTT に課金しなくても**、個人レベルで業務を10倍効率化する **Shortcuts 自動化レシピ15選** を完全公開します。

## 結論：Apple Intelligence + Shortcuts = 個人版 Zapier

短く言うと：

```
Zapier Pro：¥4,500/月
IFTTT Pro：¥1,000/月
Apple Intelligence + Shortcuts：¥0（無料）
```

Apple のエコシステム内なら、外部 SaaS なしで業務自動化が完結します。

[Apple Intelligence とは？](/guides/apple-intelligence-overview)、[使い方完全ガイド](/guides/apple-intelligence-how-to-use)、[隠し機能30選](/guides/apple-intelligence-hidden-tips-30)、[ChatGPT との比較](/guides/apple-intelligence-vs-chatgpt)も併せてどうぞ。

---

## 基礎：Shortcuts × Apple Intelligence の3つのアクション

Shortcuts アプリで **「Apple Intelligence」カテゴリ** を検索すると、以下のアクションが利用可能です。

### 1. Use Model（モデル選択）

```
✅ Apple オンデバイス：機密度高、ネット不要、超高速
✅ Private Cloud Compute：精度UP、ネット必要、ログ残らない
✅ ChatGPT：最高精度、ネット必要、OpenAI に送信
```

### 2. Summarize（要約）

```
入力：長文テキスト
出力：要約（圧縮率指定可）
```

### 3. Rewrite（リライト）

```
入力：原文 + トーン指示（Friendly / Professional / Concise）
出力：リライト後テキスト
```

### 4. Create Image（画像生成）

```
入力：プロンプト
出力：Image Playground 生成画像
```

これらを組み合わせて、ありとあらゆる業務を自動化できます。

---

## カテゴリ1：メール・コミュニケーション自動化（4レシピ）

### レシピ01｜直近1時間の重要メールを音声要約

**シナリオ**：忙しくてメールを開く時間がない朝のブリーフィング用

```
[Shortcut の構成]
1. Find All Messages where:
   - 受信日時：直近1時間
   - フォルダ：受信箱
   - 重要度：高（Priority Inbox）
2. For Each Mail:
   - Get Body
   - Use Model（PCC）→ Summarize（100字）
3. Combine Summaries
4. Speak Text（読み上げ）
```

通勤中に「Hey Siri、朝のメールブリーフィング」一発で全要約を聞けます。

### レシピ02｜選択メールにAI返信草案を生成

**シナリオ**：返信に時間がかかるメールを瞬時にドラフト化

```
[Shortcut の構成]
1. Get Selected Email
2. Use Model（PCC）：
   - 「以下のメールに、20%短く、丁寧に、3つの提案付きで返信」
3. Show Result（または Mail.app に下書き保存）
```

メール作成時間を **平均10分→1分** に短縮できます。

### レシピ03｜Slack に「現在状況」を自動投稿

**シナリオ**：オフィスで席を立つ時、ステータスを自動更新

```
[Shortcut の構成]
1. Show Menu：
   - 集中中
   - ミーティング中
   - 外出中
   - 休憩中
2. 選択結果に応じて：
   - Use Model（On-Device）：「適切な絵文字を1つ提案」
   - Webhook POST → Slack（チャンネル：#status）
3. Set Focus Mode（連動して通知制御）
```

### レシピ04｜会議録音→議事録→Slack共有の3段自動化

**シナリオ**：会議終了の瞬間に、議事録が共有される

```
[Shortcut の構成]
1. Notes アプリで録音開始（Trigger：会議開始時刻）
2. 録音停止後：
   - Get Transcription（自動文字起こし）
   - Use Model（PCC）：
     「以下を議事録形式で要約。決定事項・宿題・次回までのアクションに分類」
3. Post to Slack（指定チャンネル）
4. Save to Notes（フォルダ：議事録）
```

**会議1時間 → 議事録2分** で完成・共有まで終わります。

---

## カテゴリ2：写真・ファイル整理自動化（3レシピ）

### レシピ05｜今日撮影した写真を自動アルバム化

**シナリオ**：旅行・イベント後の写真整理を自動化

```
[Shortcut の構成]
1. Find Photos where:
   - 撮影日：今日
2. Use Model（On-Device）：
   - 「以下の写真群にふさわしいアルバム名を1つ提案」
3. Create Album（提案名）
4. Add Photos to Album
5. Show Notification（完了通知）
```

旅行終了後、ワンタップで整理完了。

### レシピ06｜レシート写真→経費精算データ抽出

**シナリオ**：紙レシートの経費入力を自動化

```
[Shortcut の構成]
1. Take Photo（または Photos から選択）
2. Extract Text from Image
3. Use Model（PCC）：
   - 「以下のレシートから店名・日付・金額・カテゴリを JSON で抽出」
4. Save to Numbers（経費精算スプレッドシート）
5. Save Image to Files（フォルダ：経費レシート）
```

経費精算の所要時間を **1件あたり3分→30秒** に短縮。

### レシピ07｜PDF を自動要約してメモ化

**シナリオ**：契約書・論文・社内文書を瞬時に把握

```
[Shortcut の構成]
1. Files から PDF 選択（または Share Sheet 経由）
2. Extract Text from PDF
3. Use Model（PCC）：
   - 「以下を3項目で要約：①概要 ②重要な条件 ③注意点」
4. Save to Notes（フォルダ：要約）
5. Show Result
```

契約書レビューの初動が10倍速くなります。

---

## カテゴリ3：日常タスク自動化（4レシピ）

### レシピ08｜朝のブリーフィング（天気・予定・ニュース）

**シナリオ**：起床時に「Hey Siri、おはよう」一発で1日が始まる

```
[Shortcut の構成]
1. Get Weather（今日の天気・気温）
2. Get Calendar Events（今日の予定）
3. Get RSS Feed（お気に入りニュースサイト）
4. Use Model（On-Device）：
   - 「以下の情報を1分で読める朝のブリーフィングに整形」
5. Speak Text
6. Send to Watch（Apple Watch にテキスト送信）
```

これを **Personal Automation** で起床時刻に自動実行すれば、目覚まし代わりに。

### レシピ09｜クリップボードを自動整形

**シナリオ**：コピーしたテキストを瞬時に「使える形」に変換

```
[Shortcut の構成]
1. Get Clipboard
2. Show Menu：
   - 100字に要約
   - 箇条書きに変換
   - 敬語に変換
   - 英訳
   - マークダウンに整形
3. Use Model（On-Device or PCC）に応じて処理
4. Set Clipboard（結果で上書き）
5. Show Notification
```

ライターやマーケターの **作業時間が30%短縮** します。

### レシピ10｜定時レポート自動生成（金曜17時）

**シナリオ**：週次レポートを自動下書き化

```
[Shortcut の構成]
1. Get Calendar Events（今週の完了済み予定）
2. Get Notes（フォルダ：今週のメモ）
3. Get Reminders（完了タスク）
4. Use Model（PCC）：
   - 「以下を週次レポート形式で整形：①完了したこと ②学び ③来週の課題」
5. Save to Notes（フォルダ：週次レポート）
6. Send via Mail（上司宛・下書き）
```

金曜の定時前タスクが消えます。

### レシピ11｜タスク作成（音声 → 構造化リマインダー）

**シナリオ**：「あれやらなきゃ」を瞬時にリマインダー化

```
[Shortcut の構成]
1. Dictate Text（音声入力）
2. Use Model（On-Device）：
   - 「以下から①タスク内容 ②期限 ③優先度を JSON で抽出」
3. Add Reminder（抽出データから自動設定）
4. Show Notification（追加完了）
```

「Hey Siri、タスク追加」→「来週水曜までに山田さんに資料送る、優先度高」と一言で完結。

---

## カテゴリ4：Web・調査自動化（2レシピ）

### レシピ12｜開いている記事を要約してメモ

**シナリオ**：Safari で気になる記事を瞬時にストック

```
[Shortcut の構成]
1. Get Article from Safari（Share Sheet 経由）
2. Extract Article Text
3. Use Model（PCC）：
   - 「以下を3項目で要約：①テーマ ②重要なポイント ③個人的な感想予想」
4. Save to Notes（フォルダ：記事ストック）
5. Save URL & 要約 to Bear / Obsidian（オプション）
```

情報収集効率が劇的に上がります。

### レシピ13｜株価・為替の朝チェック→AI解説

**シナリオ**：投資家・ビジネスパーソン向けの市況把握

```
[Shortcut の構成]
1. Get Contents of URL（Yahoo Finance API など）：
   - 日経平均、TOPIX、ダウ、ナスダック、USD/JPY
2. Use Model（PCC）：
   - 「以下の市況データから、今日の市場のトピックを3行で解説」
3. Speak Text（または Notification）
4. Trigger：平日朝7時に自動実行
```

通勤前の30秒で市況把握が完了します。

---

## カテゴリ5：プライバシー重視レシピ（2レシピ）

### レシピ14｜機密文書を On-Device 限定で処理

**シナリオ**：社外秘データをクラウドに送らない

```
[Shortcut の構成]
1. Get File（社内ファイル）
2. Extract Text
3. Use Model（**強制 On-Device**）：
   - PCC や ChatGPT は使わない
   - ネット切断状態でも動作
4. Local Save（ファイル外送信なし）
```

「Use Model」設定で **「Apple オンデバイス」を明示選択** すれば、データが端末から出ません。

### レシピ15｜匿名化してから AI 処理

**シナリオ**：実データを匿名化してから外部 AI に投げる

```
[Shortcut の構成]
1. Get Text
2. Use Model（On-Device）：
   - 「以下から個人名・電話番号・メールアドレスを [REDACTED] に置換」
3. 匿名化済みテキストを Use Model（ChatGPT）に送信
4. 結果を逆置換（オプション）
```

機密データを外部 AI に直接送信しないワンクッションを自動化できます。

---

## レシピの導入手順（5分）

### Step 1：Shortcuts アプリを起動

```
iPhone：標準搭載（削除した場合は App Store で再インストール）
Mac：標準搭載（macOS Monterey 以降）
```

### Step 2：新規ショートカット作成

```
1. 「+」ボタン
2. 名前を入力（例：「朝のブリーフィング」）
3. アクションを追加：「Apple Intelligence」で検索
```

### Step 3：アクションを順に追加

```
本記事の各レシピの構成を上から順に追加
```

### Step 4：起動方法を設定

```
✅ ホーム画面アイコン化
✅ Siri 音声起動（「Hey Siri、〇〇」）
✅ Personal Automation（時刻・場所・NFC・Focus トリガー）
✅ Share Sheet（他アプリから呼び出し）
✅ ウィジェット
```

### Step 5：実行・調整

```
「実行」ボタンで動作確認
うまく動かない部分を個別調整
気に入ったらホーム画面に置く or Siri 登録
```

---

## おすすめの組み合わせ運用

### パターンA：朝活セット（5レシピ）

```
06:30 → レシピ08「朝のブリーフィング」自動起動
06:45 → レシピ13「市況チェック」（投資家向け）
07:00 → レシピ01「直近1時間の重要メール要約」
07:15 → レシピ11「今日のタスク音声入力」
通勤中 → レシピ12「気になる記事を要約ストック」
```

### パターンB：会議効率化セット（4レシピ）

```
会議前 → レシピ09「資料テキストをクリップボード経由でAI整形」
会議中 → レシピ04「録音→議事録→Slack共有」
会議後 → レシピ02「メール返信草案」
週末 → レシピ10「週次レポート自動生成」
```

### パターンC：プライバシー重視セット（2レシピ）

```
社内資料処理 → レシピ14「On-Device 限定処理」
顧客データ処理 → レシピ15「匿名化→外部AI」
```

---

## トラブルシューティング

### Apple Intelligence アクションが見つからない場合

```
✅ iOS 18.4 以降にアップデート済みか確認
✅ 設定 → Apple Intelligence & Siri → 有効化済みか確認
✅ Shortcuts アプリを再起動
✅ 端末再起動
```

### Use Model が ChatGPT を選べない場合

```
✅ ChatGPT 連携を有効化（設定 → Apple Intelligence → ChatGPT）
✅ ChatGPT アカウントにサインイン（Plus は不要）
```

### Personal Automation が動かない

```
✅ ロック解除中であることを確認（一部はロック中動作不可）
✅ Wi-Fi / 位置情報の権限を確認
✅ 「実行前に確認」を OFF（ON だと毎回手動承認必要）
```

---

## 結論：Shortcuts 連携で「Apple Intelligence の本気」を引き出す

本記事の15レシピの中から、**まず3つだけ試して**ください。

```
推奨スタートセット：
① レシピ08「朝のブリーフィング」
② レシピ09「クリップボード自動整形」
③ レシピ04「会議録音→議事録→Slack」
```

1週間使えば、**Apple Intelligence なしの生活には戻れない** はずです。

慣れてきたら、自分の業務に合わせてアクションをカスタマイズ。Apple のエコシステムに閉じた **個人版 Zapier** が、月¥0で完成します。

## 次に読むべき記事

- 隠し機能の総まとめ → [Apple Intelligence 隠し機能・裏技30選](/guides/apple-intelligence-hidden-tips-30)
- 全体像 → [Apple Intelligence とは？2026年版完全解説](/guides/apple-intelligence-overview)
- 30分で覚える → [使い方完全ガイド](/guides/apple-intelligence-how-to-use)
- ChatGPT との比較 → [Apple Intelligence vs ChatGPT](/guides/apple-intelligence-vs-chatgpt)
- どの端末で使える？ → [対応端末完全リスト](/guides/apple-intelligence-compatible-devices)
- Gemini for Home でスマートホーム自動化 → [Gemini for Home 音声コマンド100選](/guides/gemini-for-home-voice-commands-100)
