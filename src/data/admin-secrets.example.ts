/**
 * 運営者の個人情報（メール等）を保持する機密モジュール。
 *
 * このファイル本体（admin-secrets.ts）は .gitignore に入れて公開しない。
 * このファイル（admin-secrets.example.ts）はテンプレートとして公開される。
 *
 * リポジトリをクローンした人は：
 *   cp src/data/admin-secrets.example.ts src/data/admin-secrets.ts
 *   → admin-secrets.ts に実際のメール・ID を記入する
 *
 * admin ページは全て noindex で検索エンジンには載らないが、ソースコードを
 * 公開する場合は個人情報がソースに含まれていると漏洩するため、分離している。
 */

export const ADMIN_MAIN_GMAIL = 'your-email@example.com';
export const CLOUDFLARE_ACCOUNT_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
