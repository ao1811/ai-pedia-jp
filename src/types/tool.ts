export type Category =
  | 'chat'
  | 'image'
  | 'video'
  | 'writing'
  | 'coding'
  | 'search'
  | 'productivity'
  | 'voice';

export const CATEGORY_LABELS: Record<Category, { ja: string; emoji: string; accent: string }> = {
  chat: { ja: '対話AI', emoji: '💬', accent: 'from-violet-500 to-fuchsia-500' },
  image: { ja: '画像生成', emoji: '🎨', accent: 'from-pink-500 to-rose-500' },
  video: { ja: '動画生成', emoji: '🎬', accent: 'from-orange-500 to-red-500' },
  writing: { ja: 'ライティング', emoji: '✍️', accent: 'from-blue-500 to-cyan-500' },
  coding: { ja: 'コーディング', emoji: '⚡', accent: 'from-emerald-500 to-teal-500' },
  search: { ja: 'AI検索', emoji: '🔍', accent: 'from-amber-500 to-yellow-500' },
  productivity: { ja: '業務効率', emoji: '📋', accent: 'from-indigo-500 to-blue-500' },
  voice: { ja: '音声・読上', emoji: '🎙️', accent: 'from-purple-500 to-indigo-500' },
};

export type PricePlan = {
  name: string;
  amount: number;
  currency: 'JPY' | 'USD';
  billing: 'monthly' | 'yearly' | 'one-time' | 'free';
};

export type Tool = {
  slug: string;
  name: string;
  vendor: string;
  tagline: string;
  category: Category;
  subCategories?: Category[];
  description: string;
  logoEmoji: string;
  accentGradient: string;
  rating: number;
  reviewCount: number;
  pricing: PricePlan[];
  hasFreePlan: boolean;
  pros: string[];
  cons: string[];
  bestFor: string[];
  officialUrl: string;
  affiliateUrl?: string;
  keyFeatures: string[];
  japanSupport: 'full' | 'partial' | 'none';
  launchedYear: number;
  popularityScore: number;
  trendDelta: number;
};
