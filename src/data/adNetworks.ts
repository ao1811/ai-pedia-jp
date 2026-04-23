/**
 * 広告ネットワーク用のタグ設定。
 *
 * 各広告ネットワークから発行された `<script>` タグを slot 名でマッピング。
 * タグ自体は公開情報（フロントエンドHTMLに出力される）なので、リポジトリ内で管理する。
 *
 * 差し替え・追加したい場合はこのファイルを編集して git push。
 */

/**
 * AdSense 審査モード。
 *
 * true の間は忍者AdMax の全枠を非表示にする（PageSpeed Insights でパフォーマンス
 * スコアが 44/100 と低く、LCP 10.5秒・TBT 560ms と重症のため、審査中は広告系
 * スクリプトを完全停止してサイト速度を最優先に改善する方針に切り替え）。
 *
 * ※以前はホーム枠だけ稼働継続させていたが、実測したところホーム枠だけでも
 * shinobi.jp への通信が 2,712ms 発生しており重いため、ホーム枠も含めて停止。
 *
 * AdSense 承認後、かつサイトが落ち着いてから ADSENSE_REVIEW_MODE = false にして
 * 忍者AdMax を AdSense の補完として復活させる。
 */
export const ADSENSE_REVIEW_MODE = true;

const NINJA_HOME_RANKINGS_MID =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/f5f482ca57536e4ad5696bc2cd240814"></script>\n<!-- admax -->';
const NINJA_HOME_BOTTOM =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/b3b0e1f498fa04f1116346f5198ddd3f"></script>\n<!-- admax -->';
const NINJA_IN_ARTICLE_TOP =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/29fc62ea55e0193baa5cd1d7fc8fbfec"></script>\n<!-- admax -->';
const NINJA_IN_ARTICLE_BOTTOM =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/50a4af84e930a3666c094caa0f3e6b72"></script>\n<!-- admax -->';

export const ninjaAdMaxTags: Record<string, string> = {
  // トップページ：ランキング中間
  'home-rankings-mid': ADSENSE_REVIEW_MODE ? '' : NINJA_HOME_RANKINGS_MID,
  // トップページ：最下部
  'home-bottom': ADSENSE_REVIEW_MODE ? '' : NINJA_HOME_BOTTOM,
  // ガイド記事：冒頭
  'in-article-top': ADSENSE_REVIEW_MODE ? '' : NINJA_IN_ARTICLE_TOP,
  // ガイド記事：末尾
  'in-article-bottom': ADSENSE_REVIEW_MODE ? '' : NINJA_IN_ARTICLE_BOTTOM,

  // モバイル下部固定（未発行）
  'mobile-sticky-bottom': '',
};

/**
 * slot 名から忍者AdMax のタグHTMLを取得。
 * 未設定なら undefined を返す。
 */
export function getNinjaTag(slot: string): string | undefined {
  return ninjaAdMaxTags[slot];
}
