/**
 * 広告ネットワーク用のタグ設定。
 *
 * 各広告ネットワークから発行された `<script>` タグを slot 名でマッピング。
 * タグ自体は公開情報（フロントエンドHTMLに出力される）なので、リポジトリ内で管理する。
 *
 * 差し替え・追加したい場合はこのファイルを編集して git push。
 */

export const ninjaAdMaxTags: Record<string, string> = {
  // トップページ：ランキング中間
  'home-rankings-mid':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/f5f482ca57536e4ad5696bc2cd240814"></script>\n<!-- admax -->',

  // トップページ：最下部
  'home-bottom':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/b3b0e1f498fa04f1116346f5198ddd3f"></script>\n<!-- admax -->',

  // ガイド記事：冒頭
  'in-article-top':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/29fc62ea55e0193baa5cd1d7fc8fbfec"></script>\n<!-- admax -->',

  // ガイド記事：末尾
  'in-article-bottom':
    '<!-- admax -->\n<script src="https://adm.shinobi.jp/s/50a4af84e930a3666c094caa0f3e6b72"></script>\n<!-- admax -->',

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
