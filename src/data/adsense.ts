/**
 * Google AdSense 設定。公開情報なのでソースコードに直書きする。
 *
 * 各広告枠（AdSlot）のスロットIDは承認後に AdSense 管理画面で発行 →
 * `src/components/AdSlot.astro` の環境変数フォールバックに追加する。
 */

// AdSense クライアントID（審査・広告表示両方に使用）
export const ADSENSE_CLIENT = 'ca-pub-6127755924090747';

/**
 * AdSense スクリプトをサイトに読み込むかどうか。
 *
 * false の間は <script src="adsbygoogle.js"> が一切出力されず、
 * AdSense 経由で芋づる式に呼ばれる Pubmatic / Criteo / AudienceSearch /
 * FundingChoices 等のサードパーティスクリプト全てが読み込まれなくなる。
 *
 * AdSense 審査中は false 推奨（LCP・TBT が大幅に改善し、むしろ審査通過率UP）。
 * AdSense 審査はスクリプト読み込みではなく、ページのコンテンツ品質とサイト公開状態
 * を見るため、スクリプトを外しても審査に影響しない。
 *
 * 承認後は true にして <AdSlot /> の各枠を有効化する。
 */
export const ADSENSE_SCRIPT_ENABLED = false;
