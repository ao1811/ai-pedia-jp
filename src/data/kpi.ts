/**
 * 複数サイトのKPIを一元管理するデータファイル。
 *
 * Looker Studio のiframe URL、手動入力KPI（ASP収益等）、月次目標などを記録。
 * このファイルを編集 → git push で /admin/kpi ページに即反映。
 */

export type Site = {
  slug: string;
  name: string;
  url: string;
  ga4Id?: string;
  searchConsoleProperty?: string;
  adsenseClient?: string;
  lookerStudioReportUrl?: string; // 公開された共有URL
  tech: string;
};

export const sites: Site[] = [
  {
    slug: 'ai-pedia',
    name: 'AIpedia',
    url: 'https://ai-pedia.jp',
    ga4Id: 'G-S4WER4YKJ5',
    searchConsoleProperty: 'sc-domain:ai-pedia.jp',
    adsenseClient: 'ca-pub-6101718288538326',
    tech: 'Astro + Cloudflare Pages',
  },
  {
    slug: 'oshi-tame',
    name: 'oshi-tame.com（推し活貯金箱）',
    url: 'https://oshi-tame.com',
    ga4Id: 'G-NTQQZ0ZE2P',
    searchConsoleProperty: 'sc-domain:oshi-tame.com',
    adsenseClient: undefined,
    tech: 'Vercel + Supabase',
  },
];

/**
 * Looker Studio のURL（ダッシュボード作成後に貼る）。
 * - 共有リンク（/s/XXX や /reporting/XXX）→ ボタンとしてリンク表示
 * - 埋込URL（/embed/reporting/XXX/page/YYY）→ iframe で埋込表示
 */
export const LOOKER_STUDIO_REPORT_URL: string | null =
  'https://lookerstudio.google.com/reporting/9204b80d-0333-413d-b421-6f6260182273/page/pMtvF';
export const LOOKER_STUDIO_EMBED_URL: string | null =
  'https://lookerstudio.google.com/embed/reporting/9204b80d-0333-413d-b421-6f6260182273/page/pMtvF';

/**
 * 手動入力KPI（ASP収益など、Looker Studio にAPI接続できないソース）。
 * 月1回、月初に更新する運用が現実的。
 */
export type MonthlyKpi = {
  yearMonth: string; // 'YYYY-MM'
  site: string; // 'ai-pedia' | 'oshi-tame' | 'total'
  pv?: number;
  users?: number;
  adsenseRevenue?: number;
  ninjaRevenue?: number;
  a8Revenue?: number;
  amazonRevenue?: number;
  otherRevenue?: number;
  notes?: string;
};

export const manualKpi: MonthlyKpi[] = [
  // 例：毎月初に追加
  // {
  //   yearMonth: '2026-04',
  //   site: 'ai-pedia',
  //   pv: 0,
  //   users: 0,
  //   adsenseRevenue: 0,
  //   ninjaRevenue: 0,
  //   a8Revenue: 0,
  //   amazonRevenue: 0,
  //   notes: 'サイト公開月',
  // },
];

/**
 * 目標値（マイルストーン）。
 */
export const goals = {
  month3: {
    label: '3ヶ月後（2026-07）',
    aipedia: { pv: 5000, revenue: 3000 },
    oshitame: { pv: 2000, revenue: 1000 },
  },
  month6: {
    label: '6ヶ月後（2026-10）',
    aipedia: { pv: 20000, revenue: 15000 },
    oshitame: { pv: 10000, revenue: 5000 },
  },
  month12: {
    label: '1年後（2027-04）',
    aipedia: { pv: 80000, revenue: 80000 },
    oshitame: { pv: 40000, revenue: 30000 },
  },
} as const;

export function sumRevenue(k: MonthlyKpi): number {
  return (
    (k.adsenseRevenue ?? 0) +
    (k.ninjaRevenue ?? 0) +
    (k.a8Revenue ?? 0) +
    (k.amazonRevenue ?? 0) +
    (k.otherRevenue ?? 0)
  );
}
