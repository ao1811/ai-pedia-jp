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
  // a8.net 承認済 (2026-04-20)
  'value-ai-writer': 'https://px.a8.net/svt/ejp?a8mat=4B1PLS+F2DWVM+1JUK+1HL85U',
  'conoha-ai-canvas': 'https://px.a8.net/svt/ejp?a8mat=4B1PLS+F4RNAQ+50+7RZINL',

  // a8.net 承認済 (2026-04-22 追加)
  'notta': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+10BGOI+5988+5ZU29',
  'notta-memo': 'https://px.a8.net/svt/ejp?a8mat=4B1PLS+F6JY42+5988+BWVTE',
  'zenchord': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+10WWAA+5QLS+HW2Q9',
  'plaud': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+4620I+5J4W+5YZ76',
  'bun-ken': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+J1W4Y+3Q2O+HZ2R6',
  'aiarty': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+WQV1U+428G+HVFKY',
  'languise': 'https://px.a8.net/svt/ejp?a8mat=4B1PLT+3KMEQ+5L4K+5Z6WY',

  // 以下は審査中 / 未登録。ASP承認後にURLを記入すると全ページ自動反映。
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
