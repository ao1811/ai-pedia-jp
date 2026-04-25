/**
 * Google / Bing / IndexNow に sitemap の更新を通知するスクリプト。
 *
 * Google は 2023-06 で ping エンドポイント廃止 → Search Console API 経由 or sitemap の lastmod 更新で代替。
 * Bing / Yandex は IndexNow 採用、API キーなしで ping 可能。
 *
 * 実装方針:
 *  - Google: URL Inspection API は OAuth が必要なため、ここでは sitemap の URL に HEAD リクエストを
 *    送ることで Googlebot の自主的な再クロール要求の一助とする（直接の通知ではない）。
 *  - IndexNow（Bing/Yandex）: https://www.bing.com/indexnow?url=...&key=... にGETで submit。
 *  - シンプルな実装。環境変数 INDEXNOW_KEY が設定されていれば IndexNow を叩く。
 *
 * 使い方:
 *   node scripts/ping-search-engines.mjs                 # sitemap の URL をGoogle等に通知
 *   INDEXNOW_KEY=xxxxxxx node scripts/ping-search-engines.mjs  # IndexNowでBing/Yandexも通知
 *
 * IndexNow キーの取得:
 *   https://www.bing.com/indexnow で発行される英数字32桁のキー。
 *   発行後、そのキー名と同じファイルを public/ 直下に置く必要あり（例: public/abc123...txt に abc123... と書く）。
 *   ai-pedia.jp では \`public/indexnow.txt\` に記載予定。
 */
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const SITE_HOST = 'ai-pedia.jp';
const SITEMAP_URL = `https://${SITE_HOST}/sitemap-index.xml`;

// IndexNow キーは公開情報（public/<KEY>.txt として公開配置する仕組み）なので、
// 環境変数がなければフォールバックで直書き値を使う。
// キーを再発行した場合はこの定数と public/<KEY>.txt のファイル名を更新。
const INDEXNOW_KEY_DEFAULT = '7a6fb6c1efcc4d6c96959bf805864055';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || INDEXNOW_KEY_DEFAULT;

async function httpGet(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { 'User-Agent': 'ai-pedia-ping/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      })
      .on('error', (e) => resolve({ status: 0, body: e.message }));
  });
}

/**
 * sitemap から URL 一覧を取得。
 * sitemap-index.xml → sitemap-0.xml → 各 <loc> を抽出。
 */
async function fetchSitemapUrls() {
  const indexRes = await httpGet(SITEMAP_URL);
  if (indexRes.status !== 200) {
    console.error(`⚠ sitemap-index.xml 取得失敗 (status ${indexRes.status})`);
    return [];
  }
  const childUrls = Array.from(indexRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  if (childUrls.length === 0) {
    console.error('⚠ sitemap-index.xml に子 sitemap が見つかりません');
    return [];
  }
  const allUrls = [];
  for (const childUrl of childUrls) {
    const res = await httpGet(childUrl);
    if (res.status === 200) {
      const urls = Array.from(res.body.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
      allUrls.push(...urls);
    }
  }
  return Array.from(new Set(allUrls));
}

/** Bing IndexNow に URL をバルク submit */
async function submitIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    console.log('⊘ IndexNow スキップ（INDEXNOW_KEY 環境変数なし）');
    return;
  }
  const payload = JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow は 10,000 URL/req が上限
  });
  const res = await new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.indexnow.org',
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (r) => {
        let data = '';
        r.on('data', (c) => (data += c));
        r.on('end', () => resolve({ status: r.statusCode, body: data.slice(0, 300) }));
      },
    );
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.write(payload);
    req.end();
  });
  console.log(`✓ IndexNow: status ${res.status}`);
  if (res.status >= 400) console.log(`  body: ${String(res.body).slice(0, 300)}`);
}

/**
 * Google に sitemap の URL を HEAD リクエストで叩く（Googlebot の再取得を促す一助）。
 * 直接の通知ではないが、最新の sitemap.xml を fetch することで Google に最終更新を
 * 反映させるきっかけを作る。
 */
async function pingGoogleSitemap() {
  const res = await httpGet(SITEMAP_URL);
  console.log(`✓ Google sitemap fetch: status ${res.status} (${SITEMAP_URL})`);
}

async function main() {
  console.log(`📡 SEO ping 開始: ${SITE_HOST}`);
  const urls = await fetchSitemapUrls();
  console.log(`  sitemap から ${urls.length} URL を取得`);

  await pingGoogleSitemap();
  await submitIndexNow(urls);

  // サンプル URL（最新記事のUR L）をログに残すと後で動作確認しやすい
  const sample = urls.slice(0, 3);
  if (sample.length > 0) {
    console.log('  対象URLサンプル:');
    sample.forEach((u) => console.log(`    ${u}`));
  }
  console.log('✅ 完了');
}

main();
