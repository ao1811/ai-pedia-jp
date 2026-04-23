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
 * true の間は記事本文内の忍者AdMax（in-article-*）を一時非表示にする。
 * 記事本文内に他社広告ネットワークが並んでいると AdSense 審査で不利になる
 * 場合があるため、承認が下りるまで記事内枠のみ外しておく。
 *
 * トップページの枠（home-rankings-mid / home-bottom）は記事本文ではないため
 * 審査に影響しにくいと判断し、稼働を継続する。
 *
 * AdSense 承認後は false に戻すと、AdSense が埋められなかった枠を忍者AdMax が
 * 補完する構成（AdSense メイン + 忍者が補完）に自動復帰する。
 */
export const ADSENSE_REVIEW_MODE = true;

const NINJA_IN_ARTICLE_TOP =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/29fc62ea55e0193baa5cd1d7fc8fbfec"></script>\n<!-- admax -->';
const NINJA_IN_ARTICLE_BOTTOM =
  '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/50a4af84e930a3666c094caa0f3e6b72"></script>\n<!-- admax -->';

export const ninjaAdMaxTags: Record<string, string> = {
  // トップページ：ランキング中間（記事外なので審査対象外、稼働継続）
  'home-rankings-mid':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/f5f482ca57536e4ad5696bc2cd240814"></script>\n<!-- admax -->',

  // トップページ：最下部（記事外なので審査対象外、稼働継続）
  'home-bottom':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/b3b0e1f498fa04f1116346f5198ddd3f"></script>\n<!-- admax -->',

  // ガイド記事：冒頭（AdSense 審査中は非表示）
  'in-article-top': ADSENSE_REVIEW_MODE ? '' : NINJA_IN_ARTICLE_TOP,

  // ガイド記事：末尾（AdSense 審査中は非表示）
  'in-article-bottom': ADSENSE_REVIEW_MODE ? '' : NINJA_IN_ARTICLE_BOTTOM,

  // モバイル下部固定（スクロールで表示、×で閉じる）。忍者AdMax で別枠のタグを発行して差し替え推奨。
  // 未発行の間は空文字にして非表示にする（空だと StickyMobileAd は一切レンダリングしない）
  'mobile-sticky-bottom': '',
};

/**
 * slot 名から忍者AdMax のタグHTMLを取得。
 * 未設定なら undefined を返す。
 */
export function getNinjaTag(slot: string): string | undefined {
  return ninjaAdMaxTags[slot];
}
