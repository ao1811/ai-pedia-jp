/**
 * SNSカルーセル用の5テーマ分の9スライドコンテンツ定義。
 * sns-images.mjs から読み込まれ、HTMLテンプレートに流し込まれる。
 */

export const THEMES = [
  // ─────────────────────────────────────
  // Theme 01: Claude Design vs Figma Canva
  // ─────────────────────────────────────
  {
    dir: 'theme-01-claude-design',
    slug: 'claude-design-vs-figma-canva',
    category: '比較',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
    issue: 'AIPEDIA / ISSUE №1 / APR 22, 2026',
    cover: {
      eyebrow: 'SPECIAL FEATURE · 2026.04',
      h1: 'デザインが、ついに<em>AIの仕事</em>になった。',
      subtitle: 'Claude Designが変えた2026年春、プロじゃなくても「作れる」5ツール',
    },
    problem: {
      h2: '「デザイナー不在」で、もう止まらない。',
      items: [
        'LP・営業資料を外注すると、高い／遅い／意図がズレる。',
        'Figmaを触るのが怖い。PowerPointは古臭く見える。',
        'AIで作れると聞くけど、どれが本当に実務で使えるか不明。',
      ],
    },
    items: [
      { name: 'Claude Design',      vendor: 'BY ANTHROPIC · 2026.04.17 LAUNCH', catch: '「対話するだけ」で\nUIもスライドも動く。', features: ['Opus 4.7 搭載、参考画像の再現度が段違い', 'チャット→キャンバスで即プレビュー、会話で反復', 'Claude Code / Canva へ書き出し実装まで繋がる'], price: 'Claude Pro 月¥3,000〜（追加料金なし）', audience: '営業・広報・PdMの即席デザイン' },
      { name: 'Figma Make',         vendor: 'BY FIGMA · AI MODE',                 catch: '王者の反撃、プロトタイプ\n生成まで一気通貫。',   features: ['既存Figma資産・デザインシステムを活用', 'コンポーネント・オートレイアウトを理解', 'チーム公式Figmaに直接書き出し、運用継続'], price: 'Professional $15 / 月〜', audience: '既にFigma運用中のチーム' },
      { name: 'Canva Magic Studio', vendor: 'BY CANVA · AI NATIVE',                catch: 'テンプレ×AIで、\n今日から使える確実さ。', features: ['10万点のテンプレ＋AI生成の組み合わせ', '日本語UI・フォント豊富で社内資料に最適', 'SNS投稿・動画・プレゼンまで完全対応'], price: '無料〜Pro ¥1,500 / 月', audience: 'SNS運用・社内資料作成' },
      { name: 'v0 by Vercel',        vendor: 'BY VERCEL · CODE-FIRST',               catch: 'UI生成＝実装コード。\n最速でLPが動く。',     features: ['React/Next.js のコードを即生成・プレビュー', 'shadcn/ui + Tailwind のモダンUI', 'ワンクリックで Vercel にデプロイ公開'], price: 'Free / Premium $20 / 月', audience: 'エンジニア兼デザイナー' },
      { name: 'Microsoft Designer',  vendor: 'BY MICROSOFT · M365 INTEGRATED',       catch: 'PowerPointの次世代版、\n企業導入済みの強さ。', features: ['Copilot でPPTを自動生成・整形', 'M365 統合、情シス承認済みで導入が早い', '企業ブランド適用を自動化'], price: 'M365 Copilot $30 / 月〜', audience: '大企業・既にM365導入済' },
    ],
    table: {
      h2: '結論、あなたに合う1本はこれ。',
      rows: [
        ['営業資料を即作りたい',   'Claude Design', '対話で速い'],
        ['Figma運用中のチーム',    'Figma Make',    '資産を活かせる'],
        ['SNS画像を量産したい',    'Canva',         'テンプレ豊富'],
        ['LPを今すぐ公開したい',   'v0',            'コード＋デプロイ'],
        ['M365のPPTを自動化',      'MS Designer',   'Copilot統合'],
        ['とにかく試したい',       'Claude / Canva','無料〜少額で開始'],
      ],
    },
    cta: {
      h2: 'ブックマークして、<em>次の企画書で使う。</em>',
      steps: ['この投稿を「💾 保存」しておく', '@ai_pedia_jp をフォロー', 'プロフのリンクで詳細記事を読む'],
      url: 'ai-pedia.jp/guides/claude-design-vs-figma-canva',
    },
  },

  // ─────────────────────────────────────
  // Theme 02: AI Meeting Notes
  // ─────────────────────────────────────
  {
    dir: 'theme-02-ai-meeting-notes',
    slug: 'ai-meeting-notes-2026-spring',
    category: '比較',
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 50%, #2563eb 100%)',
    issue: 'AIPEDIA / ISSUE №2 / APR 23, 2026',
    cover: {
      eyebrow: 'BUSINESS SPECIAL · 2026.04',
      h1: '議事録、<em>もう書かない。</em>',
      subtitle: '国産3＋海外2で選ぶ、2026年のAI議事録ベストプラクティス',
    },
    problem: {
      h2: '週5時間の議事録、いつまで？',
      items: [
        '録音を聞き直して書く時間が週5時間を超えている。',
        'ChatGPTにコピペしても話者が分からず要点が抜ける。',
        'どのツールが日本語で本当に使えるか判断できない。',
      ],
    },
    items: [
      { name: 'Notta',            vendor: 'BY NOTTA · 日本定番の文字起こし',      catch: '日本語精度と\nZoom連携で業界トップ。',    features: ['日本語精度は国産勢トップクラス', 'Zoom/Teams/Meetにボット参加で自動化', '話者分離・AI要約・議事録を一気通貫'], price: 'Free / Pro ¥1,800 / 月', audience: '中小企業〜個人事業主' },
      { name: 'さくらのAI議事録',   vendor: 'BY さくらインターネット · 2026.03.25', catch: '国産DC、ガバナンス重視\n企業の新本命。',    features: ['国内データセンター処理でリスク最小', '文字起こし→要約→共有までワンストップ', '官公庁・金融機関の導入を見据えた設計'], price: '要問合せ（ビジネス向け）', audience: '情報統制の厳しい企業' },
      { name: 'JAPAN AI SPEECH',  vendor: 'BY JAPAN AI · エンタープライズ寄り',   catch: 'ファインチューニングで、\n業界用語も的確に。',  features: ['業界・企業固有の用語を学習できる', '話者分離・要約を統合した国産エンタープライズ', '医療・法律・金融の業務で威力'], price: '要問合せ（月額ライセンス）', audience: '専門用語の多い業務' },
      { name: 'PLAUD',            vendor: 'BY PLAUD · AI内蔵ボイスレコーダー',     catch: 'ハード＋AI。\n手ぶらで議事録が完成する。',   features: ['カード型・ピン型で装着するだけ', 'GPT-4o / Claude で要約・タスク抽出', '世界100万人以上が利用、対面に強い'], price: '本体¥27,500 / Pro ¥1,590 / 月', audience: '対面商談・現場取材' },
      { name: 'tl;dv',            vendor: 'BY TL;DV · 海外発の無料枠最強',        catch: '月10件まで無料、\nZoom/Meet連携が秀逸。',   features: ['月10件まで録音＋AIメモが無料', 'Zoom / Google Meet にシームレス連携', 'ハイライトで振り返りが高速'], price: 'Free / Pro $29 / 月', audience: 'まず無料で試したい人' },
    ],
    table: {
      h2: '結論、あなたに合う1本はこれ。',
      rows: [
        ['とにかく日本語精度重視', 'Notta',             '業界トップの精度'],
        ['情報統制が厳しい企業',    'さくら AI議事録',   '国内処理'],
        ['専門用語の多い業務',      'JAPAN AI SPEECH',   '学習可能'],
        ['対面の商談が多い',        'PLAUD',             'ハードで手ぶら'],
        ['まず無料で始めたい',      'tl;dv',             '月10件無料'],
        ['2本使いの王道',           'Notta + PLAUD',     'オンライン・対面'],
      ],
    },
    cta: {
      h2: '週5時間の議事録を、<em>週30分</em>にする。',
      steps: ['この投稿を「💾 保存」しておく', '@ai_pedia_jp をフォロー', 'プロフのリンクで比較記事を読む'],
      url: 'ai-pedia.jp/guides/ai-meeting-notes-2026-spring',
    },
  },

  // ─────────────────────────────────────
  // Theme 03: AI Agents
  // ─────────────────────────────────────
  {
    dir: 'theme-03-ai-agents',
    slug: 'ai-agents-for-non-engineers-2026',
    category: '比較',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #f43f5e 100%)',
    issue: 'AIPEDIA / ISSUE №3 / APR 23, 2026',
    cover: {
      eyebrow: 'AGENT ERA · 2026.04',
      h1: 'AIが<em>働く</em>、<br>あなたは指示するだけ。',
      subtitle: '非エンジニアでも今日から使える、AIエージェント5選',
    },
    problem: {
      h2: 'AIに「自分でやって」と言える時代。',
      items: [
        'ChatGPTで下書きはできるが、結局「実行」は人間がやっている。',
        '「AIエージェント」「ノーコード」と言われても何から始めていいか不明。',
        'エンジニアでない自分が、本当に業務自動化できるのか不安。',
      ],
    },
    items: [
      { name: 'Copilot Cowork',          vendor: 'BY MICROSOFT · 2026.03 LAUNCH',       catch: '長期の多段階業務を\nAIが自律で完遂する。', features: ['M365と深く統合、Outlook/Teams/Excelを横断', '複数日にまたがるプロジェクトを分解・実行', '情シス承認済みで企業導入の障壁が最小'], price: 'M365 Copilot $30 / 月〜', audience: 'M365導入済の大企業' },
      { name: 'Claude Computer Use',      vendor: 'BY ANTHROPIC · Opus 4.6+',            catch: 'PC画面を見て、\nクリックし、入力する。', features: ['人の代わりにPCを操作する能力が最強', 'APIのないWebサービスも自動化できる', 'Claude Codeとの連携でワークフロー構築'], price: 'API従量 / Claude Pro ¥3,000〜', audience: 'DX担当・業務自動化推進' },
      { name: 'Dify',                     vendor: 'BY LANGGENIUS · ノーコード',           catch: 'ドラッグ＆ドロップで、\n自分専用AIを作る。', features: ['OSS、セルフホスト可のノーコード基盤', 'GPT/Claude/Gemini を横断利用', '社内データで業務特化の「うちのAI」'], price: 'Free / Pro $59 / 月', audience: '情シス・業務改善担当' },
      { name: 'Coze',                     vendor: 'BY BYTEDANCE · ノーコードボット',      catch: 'LINE/Slack/Discord に\nAIを張り付ける。',  features: ['ビジュアルエディタで短時間で構築', 'Slack / LINE / Discord に即デプロイ', 'プラグイン200種超で外部API連携が豊富'], price: 'Free / Pro $20 / 月', audience: 'カスタマーサポート・受付' },
      { name: 'ChatGPT Agent Mode 2.0',    vendor: 'BY OPENAI · GPT-5.4搭載',             catch: 'ChatGPTのまま、\n勝手にブラウザが動く。', features: ['GPT-5.4搭載で推論と実行が強化', 'ブラウザで調査・比較・予約を自動化', '400Kトークンの長期記憶で複数日OK'], price: 'ChatGPT Plus ¥3,000 / 月', audience: '個人・フリーランス' },
    ],
    table: {
      h2: '結論、あなたに合う1本はこれ。',
      rows: [
        ['M365大企業の業務自動化', 'Copilot Cowork',      '統合の深さ'],
        ['PCを自動で操作したい',    'Claude Computer Use', '画面理解が最強'],
        ['社内AIを自分で構築',      'Dify',                'ノーコード基盤'],
        ['LINE/Slackボット',        'Coze',                'デプロイが即'],
        ['個人で使い倒す',          'ChatGPT Agent',       '¥3,000で万能'],
        ['まず試す1本',             'ChatGPT Agent',       '学習コスト最低'],
      ],
    },
    cta: {
      h2: 'AIに任せる業務を、今週<em>1つ</em>決める。',
      steps: ['この投稿を「💾 保存」しておく', '@ai_pedia_jp をフォロー', 'プロフのリンクで詳細を読む'],
      url: 'ai-pedia.jp/guides/ai-agents-for-non-engineers-2026',
    },
  },

  // ─────────────────────────────────────
  // Theme 04: Chat AI Trio
  // ─────────────────────────────────────
  {
    dir: 'theme-04-chat-ai-trio',
    slug: 'chatgpt-claude-gemini-2026-04',
    category: '比較',
    emoji: '⚔️',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #fb923c 100%)',
    issue: 'AIPEDIA / ISSUE №4 / APR 23, 2026',
    cover: {
      eyebrow: 'DECISIVE EDITION · 2026.04',
      h1: 'ChatGPT / Claude / Gemini<br><em>結論、</em>出た。',
      subtitle: 'GPT-5.4 / Opus 4.7 / Deep Research 強化 · 2026年4月の決定版',
    },
    problem: {
      h2: '「結局どれ？」の答えが欲しい。',
      items: [
        '3社とも直近で大型アップデート。情報が多すぎて整理できない。',
        '月3,000円を1本に絞りたいが、どれが自分の用途に合うか不明。',
        '3つ全部契約する余裕はない。「決定版の1本」を決めて欲しい。',
      ],
    },
    items: [
      { name: 'ChatGPT',          vendor: 'BY OPENAI · GPT-5.4・GPT-5.3 INSTANT',    catch: '万能性と日本語の自然さ、\n初心者の最適解。',    features: ['GPT-5.4は最上位、GPT-5.3 Instantが標準', '400Kトークン・長期記憶・Agent Mode 2.0', '画像・音声・Web・コードを統合'], price: 'Plus ¥3,000 / Pro ¥30,000', audience: '初心者・万能に使いたい人' },
      { name: 'Claude',           vendor: 'BY ANTHROPIC · OPUS 4.7',                  catch: '長文・コード・デザイン、\nプロ職人の第一候補。', features: ['推論と視覚理解が業界トップクラス', '100万トークンの長文処理', 'Claude Code・Design で拡張'], price: 'Pro ¥3,000 / Max ¥15,000', audience: 'エンジニア・ライター' },
      { name: 'Gemini',           vendor: 'BY GOOGLE · 2.5 PRO・DEEP RESEARCH',       catch: 'Google統合と調査力、\nリサーチャー必携。',    features: ['Deep Research が MCP連携・ファイル検索', 'Gmail / Docs / Sheets と統合', '2Mトークンの超長文、動画入力も可'], price: 'Free / Advanced ¥2,900', audience: 'Google Workspace使用者' },
      { name: '今月の新機能まとめ', vendor: 'UPDATES · APR 2026',                       catch: '御三家が<br>この1ヶ月でやったこと。',       features: ['OpenAI: GPT-5.4 リリース、400Kトークン', 'Anthropic: Claude Design（4/17）、Code刷新', 'Google: Gemini for Home日本上陸、AI Studio緩和'], price: '—', audience: '速報を追いたい人' },
      { name: '2本使いの最適解',   vendor: 'RECOMMENDATION',                            catch: 'ChatGPT + Claude で<br>月¥6,000の最強構成。',  features: ['ChatGPT: ブレスト・議事録・画像生成', 'Claude: 長文・コード・Claude Design', 'Gemini Free: 調査・Workspace連携'], price: '月¥6,000（2本）or ¥3,000（1本+Free）', audience: 'バランス重視' },
    ],
    table: {
      h2: '結論、あなたに合う1本はこれ。',
      rows: [
        ['初心者・迷ったら',       'ChatGPT Plus',       '万能・安定'],
        ['コード書く・長文扱う',   'Claude Pro',         '推論・長文'],
        ['調査・Google使用者',     'Gemini Advanced',    'Deep Research'],
        ['デザイン案を出したい',   'Claude Pro',         'Claude Design'],
        ['画像・音声・動画',       'ChatGPT Plus',       '統合の厚さ'],
        ['無料で使い倒したい',     'Gemini Free',        '制限が緩い'],
      ],
    },
    cta: {
      h2: '2026年4月、1本に<em>絞る。</em>',
      steps: ['この投稿を「💾 保存」しておく', '@ai_pedia_jp をフォロー', 'プロフのリンクで詳細比較を読む'],
      url: 'ai-pedia.jp/guides/chatgpt-claude-gemini-2026-04',
    },
  },

  // ─────────────────────────────────────
  // Theme 05: Gemini for Home
  // ─────────────────────────────────────
  {
    dir: 'theme-05-gemini-for-home',
    slug: 'gemini-for-home-japan-2026',
    category: 'トレンド',
    emoji: '🏠',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)',
    issue: 'AIPEDIA / ISSUE №5 / APR 23, 2026',
    cover: {
      eyebrow: 'BREAKING · 2026.04',
      h1: 'AIが、<em>家</em>に<br>やってくる。',
      subtitle: 'Gemini for Home 日本上陸。スマートスピーカー革命・5選で読む未来',
    },
    problem: {
      h2: 'Alexaは古い、Siriは訊けない、けど。',
      items: [
        '既存のスマートスピーカーは「今日の天気」以上の会話ができない。',
        'AIが家にいると便利と聞くが、何ができるかイメージ湧かない。',
        '子ども・親と一緒に使えるAI、プライバシーも気になる。',
      ],
    },
    items: [
      { name: 'Gemini for Home',     vendor: 'BY GOOGLE · 2026.04 日本早期アクセス',    catch: 'Nest Hub/Miniが\n本物の会話パートナーに。', features: ['家族の声を認識、文脈を踏まえた自然な会話', 'Google フォトと連動、「去年の花見」が出る', '家電制御・ルーティン・翻訳まで1台'], price: '対応デバイス購入で利用可', audience: 'Google系家族' },
      { name: 'Alexa+',               vendor: 'BY AMAZON · 次世代Alexa',                  catch: 'ショッピング×AI、\nAmazonの底力。',         features: ['生成AI搭載、長文の指示もこなせる', 'Amazon注文・配送トラッキングを対話で', 'Ring / Eero / Fire TV まで統合'], price: 'Prime会員は基本無料', audience: 'Amazon Prime会員' },
      { name: 'Apple Intelligence',   vendor: 'BY APPLE · iOS/HomePod統合',               catch: 'プライバシー最優先、\n端末内処理の安心感。',  features: ['端末内処理で会話データが外に出にくい', 'iPhone / HomePod / Mac でシームレス', 'ChatGPT 連携で高度な質問も対応'], price: 'Apple端末購入後 無料', audience: 'iPhone / Macユーザー' },
      { name: 'Copilot+ PC',          vendor: 'BY MICROSOFT · WINDOWS 11',                 catch: 'パソコン全体が\n「家族の相談相手」に。', features: ['NPU搭載PCで端末内AI処理、応答が速い', '「Recall」で過去の作業を思い出せる', 'M365ユーザーには最も自然な延長'], price: '対応PC + Copilot ¥3,200', audience: 'M365 + PC中心生活' },
      { name: '中国系（小愛同学ほか）', vendor: 'BY XIAOMI · 参考比較',                      catch: '家電制御の進化、\n海外の先行事例。',       features: ['Xiaomi/Huawei は家電制御が最も進化', '日本での正式展開はまだ限定的', 'AI家電トレンドの先取り事例'], price: '国内正規展開まち', audience: '参考・先取り派' },
    ],
    table: {
      h2: '結論、あなたの家に合う1つは。',
      rows: [
        ['Google Photo / Gmailヘビー', 'Gemini for Home',    '統合最深'],
        ['Amazon Prime会員',           'Alexa+',             '無料＆便利'],
        ['iPhone / Macユーザー',       'Apple Intelligence', 'プライバシー'],
        ['M365使いのPC',               'Copilot+ PC',        '仕事〜家庭'],
        ['子どもと一緒に',             'Gemini for Home',    '日本語自然'],
        ['スマート家電大量',           'Alexa+ or Gemini',   '対応デバイス'],
      ],
    },
    cta: {
      h2: '家庭AI元年、最初の<em>1台</em>を選ぶ。',
      steps: ['この投稿を「💾 保存」しておく', '@ai_pedia_jp をフォロー', 'プロフのリンクで詳細を読む'],
      url: 'ai-pedia.jp/guides/gemini-for-home-japan-2026',
    },
  },
];
