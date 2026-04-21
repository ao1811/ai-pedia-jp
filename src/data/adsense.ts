/**
 * Google AdSense 設定。公開情報なのでソースコードに直書きする。
 *
 * 各広告枠（AdSlot）のスロットIDは承認後に AdSense 管理画面で発行 →
 * `src/components/AdSlot.astro` の環境変数フォールバックに追加する。
 */

// AdSense クライアントID（審査・広告表示両方に使用）
export const ADSENSE_CLIENT = 'ca-pub-6127755924090747';
