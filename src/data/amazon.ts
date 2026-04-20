/**
 * Amazon アソシエイト商品の登録とリンク生成。
 *
 * 商品を追加：`amazonProducts` にキーとASIN・タグを追加
 * 記事に配置：記事の frontmatter に `amazonProducts: ["key1", "key2"]` を追加
 *            → ガイド記事末尾の「関連書籍・ガジェット」セクションに自動表示
 *
 * タグベース自動レコメンド：`AmazonRecommendations` コンポーネントが記事の
 *   タグ・関連ツール・カテゴリから近似商品を自動選定して並列表示
 */

export type AmazonProduct = {
  asin: string;
  title: string;
  category: string;
  description?: string;
  priceHint?: string;
  /**
   * マッチング用タグ。記事の tags・relatedTools・category と部分一致でレコメンドされる。
   * 例：['chatgpt', 'writing', 'beginner', 'book']
   */
  tags: string[];
  /** 優先度（高いほど上位表示されやすい）。0〜100 */
  priority?: number;
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
    tags: ['chatgpt', 'ai', 'book', 'business', 'productivity', 'beginner'],
    priority: 80,
  },
  'chatgpt-gpts-book': {
    asin: '4815625530',
    title: 'ChatGPT GPTsが作れるようになる本',
    category: 'AIビジネス書',
    description: 'ノーコードで独自GPTを作る方法を基礎から解説。',
    priceHint: '¥2,200',
    tags: ['chatgpt', 'gpts', 'ai', 'book', 'no-code'],
    priority: 60,
  },
  'chatgpt-business-future': {
    asin: '4295016381',
    title: '先読み！IT×ビジネス講座 ChatGPT 対話型AIが生み出す未来',
    category: 'AIビジネス書',
    description: '対話型AIがビジネスに与える影響を包括的に解説。',
    priceHint: '¥1,650',
    tags: ['chatgpt', 'ai', 'book', 'business', 'trend'],
    priority: 50,
  },

  // === プロンプトエンジニアリング ===
  'prompt-engineering-oreilly': {
    asin: '4814401248',
    title: '生成AIのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: '信頼できる生成AIの出力を得るための普遍的な入力の原則（O\'Reilly）',
    priceHint: '¥3,520',
    tags: ['prompt', 'ai', 'book', 'oreilly', 'advanced', 'engineering'],
    priority: 90,
  },
  'prompt-textbook': {
    asin: '4839985006',
    title: '大規模言語モデルを使いこなすためのプロンプトエンジニアリングの教科書',
    category: 'プロンプト本',
    description: 'LLMを使いこなすための体系的な教科書。',
    priceHint: '¥2,860',
    tags: ['prompt', 'ai', 'llm', 'book', 'engineering'],
    priority: 70,
  },
  'prompt-beginner': {
    asin: '4866367296',
    title: 'ChatGPT はじめてのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: '生成AIを自在に使いこなして仕事を効率化。',
    priceHint: '¥1,980',
    tags: ['prompt', 'chatgpt', 'beginner', 'book', 'productivity'],
    priority: 75,
  },
  'llm-prompt-github': {
    asin: '4814401132',
    title: 'LLMのプロンプトエンジニアリング',
    category: 'プロンプト本',
    description: 'GitHub Copilotを生んだ開発者が教える生成AIアプリケーション開発。',
    priceHint: '¥3,520',
    tags: ['prompt', 'llm', 'github', 'copilot', 'coding', 'book', 'engineer'],
    priority: 65,
  },
  'prompt-midjourney-intro': {
    asin: '4798181986',
    title: '生成AIプロンプトエンジニアリング入門 ChatGPTとMidjourneyで学ぶ基本的な手法',
    category: 'プロンプト本',
    description: 'ChatGPTとMidjourneyの両方を学べる入門書。',
    priceHint: '¥2,640',
    tags: ['prompt', 'chatgpt', 'midjourney', 'image-generation', 'book', 'beginner'],
    priority: 60,
  },
  'prompt-zero-programming': {
    asin: '4798071307',
    title: 'プログラミング知識ゼロでもわかる プロンプトエンジニアリング入門',
    category: 'プロンプト本',
    description: '初心者向け、プログラミング不要で使える。',
    priceHint: '¥2,310',
    tags: ['prompt', 'beginner', 'no-programming', 'book'],
    priority: 55,
  },

  // === Claude Code ===
  'claude-code-ai-driven': {
    asin: '4297152754',
    title: 'Claude CodeによるAI駆動開発入門',
    category: 'Claude Code本',
    description: 'Anthropic のCLI型AIエージェントを体系的に学べる定番書。',
    priceHint: '¥2,860',
    tags: ['claude-code', 'claude', 'ai', 'coding', 'engineer', 'book', 'cli'],
    priority: 85,
  },
  'claude-code-practical': {
    asin: '4297153548',
    title: '実践Claude Code入門―現場で活用するためのAIコーディングの思考法',
    category: 'Claude Code本',
    description: '現場目線でClaude Codeを使いこなすための実践書。',
    priceHint: '¥2,860',
    tags: ['claude-code', 'claude', 'coding', 'engineer', 'book', 'mcp', 'advanced'],
    priority: 80,
  },
  'claude-code-nonengineer': {
    asin: 'B0GX2XWVNM',
    title: 'AIがあなたの右腕になる！Claude Code超入門',
    category: 'Claude Code本',
    description: '非エンジニア向けのClaude Code活用術（Kindle版）。',
    priceHint: 'Kindle',
    tags: ['claude-code', 'claude', 'ai', 'agent', 'beginner', 'kindle', 'non-engineer'],
    priority: 50,
  },

  // === Midjourney / 画像生成 ===
  'midjourney-basics': {
    asin: '4295017922',
    title: 'はじめてでも迷わないMidjourneyのきほん デザインに差がつく画像生成AI活用術',
    category: '画像生成AI本',
    description: 'Midjourney の操作と活用を図解で解説する最新入門書。',
    priceHint: '¥1,980',
    tags: ['midjourney', 'image-generation', 'design', 'book', 'beginner', 'creator'],
    priority: 85,
  },

  // === AI副業 ===
  'ai-side-10man': {
    asin: '4299045408',
    title: '毎月10万円をAIに稼いでもらう! ChatGPT 副業の教科書',
    category: 'AI副業',
    description: 'ChatGPTで副業収入を得るための具体的手順集。',
    priceHint: '¥1,650',
    tags: ['side-business', 'chatgpt', 'ai', 'book', 'beginner', 'income'],
    priority: 75,
  },
  'note-ai-sidework': {
    asin: '4046077735',
    title: '2億円を売り上げたプロが教える note×AI 最強の副業',
    category: 'AI副業',
    description: 'note+AIで収益化する最前線ノウハウ。',
    priceHint: '¥1,760',
    tags: ['side-business', 'note', 'ai', 'blog', 'writing', 'income', 'book'],
    priority: 70,
  },
  'ai-side-30man': {
    asin: '4046071877',
    title: '2ヶ月で月30万円を実現する 超初心者でも稼げるAI活用法',
    category: 'AI副業',
    description: '初心者目線で実践しやすい副業指南書。',
    priceHint: '¥1,650',
    tags: ['side-business', 'ai', 'beginner', 'income', 'book'],
    priority: 70,
  },
  'ai-thinking-techniques': {
    asin: '4478119481',
    title: 'AIを使って考えるための全技術「最高の発想」を一瞬で生み出す56の技法',
    category: 'AI活用書',
    description: 'アイデア発想・企画立案にAIを使うための技法集。',
    priceHint: '¥1,980',
    tags: ['ai', 'thinking', 'productivity', 'idea', 'business', 'book'],
    priority: 55,
  },

  // === Notion ===
  'notion-strongest-work': {
    asin: '4863543913',
    title: 'Notion最強の仕事術',
    category: 'Notion本',
    description: 'Notionで仕事術を体系化。メモ・タスク・議事録・資料作成まで。',
    priceHint: '¥2,200',
    tags: ['notion', 'productivity', 'business', 'book', 'task-management'],
    priority: 75,
  },
  'notion-creative': {
    asin: '4295013358',
    title: 'Notionで実現する新クリエイティブ仕事術',
    category: 'Notion本',
    description: '万能メモツールによる最高のインプット&アウトプット。',
    priceHint: '¥2,200',
    tags: ['notion', 'productivity', 'writing', 'creator', 'book'],
    priority: 60,
  },
  'notion-encyclopedia': {
    asin: '4297146517',
    title: 'Notion なんでも事典',
    category: 'Notion本',
    description: '288の技を集めた、リファレンス型の徹底ガイド。',
    priceHint: '¥2,640',
    tags: ['notion', 'reference', 'advanced', 'book'],
    priority: 55,
  },

  // === ガジェット（AIボイスレコーダー） ===
  'plaud-note': {
    asin: 'B0D1XZWHD6',
    title: 'PLAUD NOTE AIボイスレコーダー',
    category: 'AIガジェット',
    description: 'ワンタッチ録音・自動文字起こし・要約に対応。会議議事録の定番デバイス。',
    priceHint: '¥27,500',
    tags: ['gadget', 'transcription', 'meeting', 'voice-recorder', 'ai', 'plaud'],
    priority: 90,
  },
  'plaud-note-pro': {
    asin: 'B0FQ5J7HFQ',
    title: 'PLAUD NOTE Pro AIボイスレコーダー',
    category: 'AIガジェット',
    description: 'ディスプレイ搭載・50時間連続録音の上位機。プロ仕様。',
    priceHint: '¥30,800',
    tags: ['gadget', 'transcription', 'meeting', 'voice-recorder', 'ai', 'plaud', 'pro'],
    priority: 85,
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

/**
 * タグベースで商品を推薦する。
 * 一致するタグが多いほどスコアが上がり、優先度と合算して上位N件を返す。
 *
 * @param targetTags 記事側の tags / relatedTools / category を混合した配列
 * @param excludeKeys 除外するキー（既に表示済の商品を避ける）
 * @param limit 返す件数（デフォルト3）
 */
export function recommendProducts(
  targetTags: string[],
  excludeKeys: string[] = [],
  limit = 3,
): { key: string; product: AmazonProduct; score: number }[] {
  const normalized = targetTags
    .map((t) => t.toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean);

  const scored = Object.entries(amazonProducts)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, product]) => {
      let score = (product.priority ?? 0) * 0.5;
      for (const tag of product.tags) {
        if (normalized.includes(tag)) score += 30;
        else if (normalized.some((t) => t.includes(tag) || tag.includes(t))) score += 10;
      }
      return { key, product, score };
    })
    .filter((r) => r.score > 20)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
