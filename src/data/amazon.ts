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

export const amazonProducts: Record<string, AmazonProduct> = {
  // サンプル。実際のASINに差し替えてください。
  // 'chatgpt-book': {
  //   asin: 'B0XXXXXXXX',
  //   title: 'ChatGPT 仕事術大全',
  //   category: 'AI書籍',
  //   priceHint: '¥1,650',
  // },
};

export function getAmazonLink(asin: string): string {
  const trackingId = (import.meta.env.PUBLIC_AMAZON_TRACKING_ID as string) || '';
  const base = `https://www.amazon.co.jp/dp/${asin}`;
  return trackingId ? `${base}?tag=${trackingId}` : base;
}
