/**
 * Amazon アソシエイト商品の登録とリンク生成。
 *
 * 商品を追加：`amazonProducts` にキーとASINを追加
 * 記事に配置：記事の frontmatter に `amazonProducts: ["key1", "key2"]` を追加
 *            → ガイド記事末尾の「関連商品」セクションに自動表示
 */

export type AmazonProduct = {
  asin: string;
  title: string;
  category: string;
  description?: string;
  priceHint?: string;
};

// Amazon アソシエイト トラッキングID（公開情報、リンクに埋め込まれる）
export const AMAZON_TRACKING_ID = 'ai-pedia-22';

export const amazonProducts: Record<string, AmazonProduct> = {
  // === AIビジネス書 ===
  'chatgpt-strongest-work': {
    asin: '4866802367',
    title: 'ChatGPT最強の仕事術',
    category: 'AIビジネス書',
    description: '実務で即使えるChatGPT活用術を体系化。業務効率を劇的に変える1冊。',
    priceHint: '¥1,760',
  },
  'chatgpt-gpts-book': {
    asin: '4815625530',
    title: 'ChatGPT GPTsが作れるようになる本',
    category: 'AIビジネス書',
    description: 'ノーコードで独自GPTを作る方法を基礎から解説。',
    priceHint: '¥2,200',
  },
  'chatgpt-business-future': {
    asin: '4295016381',
    title: '先読み！IT×ビジネス講座 ChatGPT 対話型AIが生み出す未来',
    category: 'AIビジネス書',
    description: '対話型AIがビジネスに与える影響を包括的に解説。',
    priceHint: '¥1,650',
  },

  // === プロンプトエンジニアリング ===
  'prompt-engineering-oreilly': {
    asin: '4814401248',
    title: '生成AIのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: '信頼できる生成AIの出力を得るための普遍的な入力の原則（O\'Reilly）',
    priceHint: '¥3,520',
  },
  'prompt-textbook': {
    asin: '4839985006',
    title: '大規模言語モデルを使いこなすためのプロンプトエンジニアリングの教科書',
    category: 'プロンプト本',
    description: 'LLMを使いこなすための体系的な教科書。',
    priceHint: '¥2,860',
  },
  'prompt-beginner': {
    asin: '4866367296',
    title: 'ChatGPT はじめてのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: '生成AIを自在に使いこなして仕事を効率化。',
    priceHint: '¥1,980',
  },
  'llm-prompt-github': {
    asin: '4814401132',
    title: 'LLMのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: 'GitHub Copilotを生んだ開発者が教える生成AIアプリケーション開発。',
    priceHint: '¥3,520',
  },
  'prompt-midjourney-intro': {
    asin: '4798181986',
    title: '生成AIプロンプトエンジニアリング入門 ChatGPTとMidjourneyで学ぶ基本的な手法',
    category: 'プロンプト本',
    description: 'ChatGPTとMidjourneyの両方を学べる入門書。',
    priceHint: '¥2,640',
  },
  'prompt-zero-programming': {
    asin: '4798071307',
    title: 'プログラミング知識ゼロでもわかる プロンプトエンジニアリング入門',
    category: 'プロンプト本',
    description: '初心者向け、プログラミング不要で使える。',
    priceHint: '¥2,310',
  },

  // === Claude Code ===
  'claude-code-ai-driven': {
    asin: '4297152754',
    title: 'Claude CodeによるAI駆動開発入門',
    category: 'Claude Code本',
    description: 'Anthropic のCLI型AIエージェントを体系的に学べる定番書。',
    priceHint: '¥2,860',
  },
  'claude-code-practical': {
    asin: '4297153548',
    title: '実践Claude Code入門―現場で活用するためのAIコーディングの思考法',
    category: 'Claude Code本',
    description: '現場目線でClaude Codeを使いこなすための実践書。',
    priceHint: '¥2,860',
  },
  'claude-code-nonengineer': {
    asin: 'B0GX2XWVNM',
    title: 'AIがあなたの右腕になる！Claude Code超入門',
    category: 'Claude Code本',
    description: '非エンジニア向けのClaude Code活用術（Kindle版）。',
    priceHint: 'Kindle',
  },

  // === Midjourney / 画像生成 ===
  'midjourney-basics': {
    asin: '4295017922',
    title: 'はじめてでも迷わないMidjourneyのきほん デザインに差がつく画像生成AI活用術',
    category: '画像生成AI本',
    description: 'Midjourney の操作と活用を図解で解説する最新入門書。',
    priceHint: '¥1,980',
  },

  // === AI副業 ===
  'ai-side-10man': {
    asin: '4299045408',
    title: '毎月10万円をAIに稼いでもらう! ChatGPT 副業の教科書',
    category: 'AI副業',
    description: 'ChatGPTで副業収入を得るための具体的手順集。',
    priceHint: '¥1,650',
  },
  'note-ai-sidework': {
    asin: '4046077735',
    title: '2億円を売り上げたプロが教える note×AI 最強の副業',
    category: 'AI副業',
    description: 'note+AIで収益化する最前線ノウハウ。',
    priceHint: '¥1,760',
  },
  'ai-side-30man': {
    asin: '4046071877',
    title: '2ヶ月で月30万円を実現する 超初心者でも稼げるAI活用法',
    category: 'AI副業',
    description: '初心者目線で実践しやすい副業指南書。',
    priceHint: '¥1,650',
  },
  'ai-thinking-techniques': {
    asin: '4478119481',
    title: 'AIを使って考えるための全技術「最高の発想」を一瞬で生み出す56の技法',
    category: 'AI活用書',
    description: 'アイデア発想・企画立案にAIを使うための技法集。',
    priceHint: '¥1,980',
  },

  // === ガジェット（AIボイスレコーダー） ===
  'plaud-note': {
    asin: 'B0D1XZWHD6',
    title: 'PLAUD NOTE AIボイスレコーダー',
    category: 'AIガジェット',
    description: 'ワンタッチ録音・自動文字起こし・要約に対応。会議議事録の定番デバイス。',
    priceHint: '¥27,500',
  },
  'plaud-note-pro': {
    asin: 'B0FQ5J7HFQ',
    title: 'PLAUD NOTE Pro AIボイスレコーダー',
    category: 'AIガジェット',
    description: 'ディスプレイ搭載・50時間連続録音の上位機。プロ仕様。',
    priceHint: '¥30,800',
  },
};

export function getAmazonLink(asin: string): string {
  const trackingId =
    (import.meta.env.PUBLIC_AMAZON_TRACKING_ID as string) || AMAZON_TRACKING_ID;
  const base = `https://www.amazon.co.jp/dp/${asin}`;
  return trackingId ? `${base}?tag=${trackingId}` : base;
}

export function getProduct(key: string): AmazonProduct | undefined {
  return amazonProducts[key];
}
