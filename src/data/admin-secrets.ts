/**
 * 運営者の操作用メタデータ。/admin/* ページは noindex なので公開検索には載らない。
 * メアドは git のコミット作者情報にも入っているため、ここで隠しても実効性が薄い。
 * Cloudflare Pages のビルドにも必要なため、リポジトリに含めて運用する方針。
 */

export const ADMIN_MAIN_GMAIL = 'naokimiyamoto02@gmail.com';
export const CLOUDFLARE_ACCOUNT_ID = '91a62e813cd1b61c40842055c40151ed';
