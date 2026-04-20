/**
 * アフィリエイトリンク管理
 *
 * 各ツールの slug と、ASP 発行のアフィリエイトURLをマッピング。
 * 登録完了したら、下記の`affiliateUrls`を埋めるだけで全ページに反映されます。
 *
 * 推奨ASP:
 *   - a8.net         : https://www.a8.net   (総合最大手、SaaS案件多数)
 *   - もしもアフィリエイト: https://af.moshimo.com
 *   - Amazon アソシエイト  : Amazon商品向け
 *   - 各ベンダー直接    : Anthropic, OpenAI, Notion, Cursor など（単価高、条件厳)
 *
 * 書式例:
 *   'chatgpt': 'https://px.a8.net/svt/ejp?a8mat=XXXXXXX&a8ejpredirect=https%3A%2F%2Fchat.openai.com',
 */

export const affiliateUrls: Record<string, string> = {
  // 'chatgpt': '',
  // 'claude': '',
  // 'gemini': '',
  // 'cursor': '',
  // 'claude-code': '',
  // 'midjourney': '',
  // 'perplexity': '',
  // 'notion-ai': '',
  // 'runway': '',
  // 'elevenlabs': '',
  // 'github-copilot': '',
  // 'v0': '',
};

/**
 * 指定 slug のアフィリエイトリンクを返す。
 * 未登録なら undefined を返し、呼び出し側は公式URLにフォールバックする想定。
 */
export function getAffiliateUrl(slug: string): string | undefined {
  const url = affiliateUrls[slug];
  return url && url.length > 0 ? url : undefined;
}

/**
 * リンク属性（rel）を返す。アフィリエイトリンクは Google 推奨に従い sponsored を付与。
 */
export function getLinkRel(isAffiliate: boolean): string {
  return isAffiliate ? 'sponsored noopener' : 'noopener noreferrer';
}
