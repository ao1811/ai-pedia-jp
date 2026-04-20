/**
 * Amazon アソシエイト商品推薦の設定。
 *
 * 使い方：
 *   <AmazonProductCard asin="B0..." />
 *
 * このファイルに商品IDとタイトル等を書いておくと、各所で参照可能。
 * Amazon アソシエイトID（トラッキングID）は環境変数 PUBLIC_AMAZON_TRACKING_ID で設定。
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
  // 商品を追加する場合の書式例：
  // 'key': {
  //   asin: 'B0XXXXXXXX',
  //   title: '商品タイトル',
  //   category: 'AI書籍',
  //   description: '短い紹介文',
  //   priceHint: '¥1,650',
  // },
};

export function getAmazonLink(asin: string): string {
  const trackingId =
    (import.meta.env.PUBLIC_AMAZON_TRACKING_ID as string) || AMAZON_TRACKING_ID;
  const base = `https://www.amazon.co.jp/dp/${asin}`;
  return trackingId ? `${base}?tag=${trackingId}` : base;
}
