import type { CaseStudy, CaseStudyCategory, CaseStudyStatus, WorkFilter } from '@/data/caseStudies';
import type { LocalizedText } from './text';
import type { ContentPack } from './content/types';

/**
 * ============================================================================
 * CASE STUDIES — EN / ZH overlays for `data/caseStudies.ts`
 * ============================================================================
 * The Thai records stay the single source of project truth. The EN / ZH
 * overlays (content/en.ts, content/zh.ts) replace ONLY the customer-facing
 * text; slug, visibility, featured, liveUrl,
 * filters, service relationships and screenshots are never restated here and
 * cannot drift.
 *
 * Every array mirrors its Thai counterpart item-for-item, and
 * tests/i18n.test.mjs fails if a field or an item is missing. Outcomes stay
 * qualitative in every language — no language claims a measured result the
 * Thai record does not.
 *
 * Feature-group titles (OPERATIONS, COSTING …) are English design labels on
 * the Thai page too, so they are shared, not translated.
 * ============================================================================
 */

export interface CaseFlowText {
  title: string;
  actor: string;
  description: string;
  output: string;
}

export interface CaseStudyText {
  title: string;
  subtitle: string;
  projectType: string;
  tags: readonly string[];
  delivered: string;
  problem: string;
  context: string;
  solution: string;
  before: readonly string[];
  after: readonly string[];
  /** Items per feature group, in the Thai group order. */
  features: readonly (readonly string[])[];
  flow: readonly CaseFlowText[];
  outcomes: readonly string[];
  technicalNotes: readonly string[];
  /** Only for records with a reviewed screenshot. */
  screenshotAlt?: string;
}

export type CaseSlug =
  | 'erp-inventory-costing'
  | 'payroll-monthly-control'
  | 'hr-line-leave-approval'
  | 'document-file-workflow'
  | 'nas-file-storage'
  | 'corporate-website-system'
  | 's2-accounting-website';

/**
 * The record with its customer-facing text from `pack`. Without a pack (Thai,
 * or before the EN/ZH pack has loaded) the Thai record returns as-is.
 */
export function localizeCaseStudy(study: CaseStudy, pack: ContentPack | null): CaseStudy {
  if (!pack) return study;
  const text = pack.caseStudies[study.slug as CaseSlug];
  if (!text) return study;
  return {
    ...study,
    title: text.title,
    subtitle: text.subtitle,
    projectType: text.projectType,
    tags: text.tags,
    delivered: text.delivered,
    problem: text.problem,
    context: text.context,
    solution: text.solution,
    before: text.before,
    after: text.after,
    features: study.features.map((group, index) => ({ title: group.title, items: text.features[index] ?? group.items })),
    flow: study.flow.map((step, index) => ({ ...step, ...text.flow[index] })),
    outcomes: text.outcomes,
    technicalNotes: text.technicalNotes,
    screenshot: study.screenshot && text.screenshotAlt ? { ...study.screenshot, alt: text.screenshotAlt } : study.screenshot
  };
}

/* ------------------------------------------------------------ labels -- */

export const caseCategoryLabel: Record<CaseStudyCategory | 'all', LocalizedText> = {
  all: { th: 'ทั้งหมด', en: 'All', zh: '全部' },
  'business-system': { th: 'ระบบธุรกิจ', en: 'Business systems', zh: '业务系统' },
  people: { th: 'งานบุคคล', en: 'People & HR', zh: '人事' },
  'document-data': { th: 'เอกสารและข้อมูล', en: 'Documents & data', zh: '文档与数据' },
  web: { th: 'เว็บไซต์และเว็บแอป', en: 'Websites & web apps', zh: '网站与 Web 应用' }
};

/** Filter ids stay stable; only the display label is localised. */
export const workFilterLabel: Record<WorkFilter | 'all', LocalizedText> = {
  all: { th: 'ทั้งหมด', en: 'All', zh: '全部' },
  erp: { th: 'ERP', en: 'ERP', zh: 'ERP' },
  'hr-payroll': { th: 'HR / Payroll', en: 'HR / Payroll', zh: 'HR / Payroll' },
  documents: { th: 'เอกสาร', en: 'Documents', zh: '文档' },
  web: { th: 'เว็บไซต์', en: 'Websites', zh: '网站' },
  automation: { th: 'Automation', en: 'Automation', zh: '自动化' },
  'internal-tools': { th: 'ระบบภายใน', en: 'Internal tools', zh: '内部系统' }
};

/** Mono status badges — English on every locale, as on the Thai page. */
export const caseStatusLabel: Record<CaseStudyStatus, string> = {
  'internal-system': 'INTERNAL SYSTEM',
  'custom-system': 'CUSTOM SYSTEM',
  'built-system': 'BUILT SYSTEM'
};

export const projectLinkText = {
  liveWebsite: { th: 'ดูเว็บไซต์จริง', en: 'View the live website', zh: '查看线上网站' },
  liveSystem: { th: 'ดูระบบจริง', en: 'View the live system', zh: '查看线上系统' },
  caseStudy: { th: 'ดู Case Study', en: 'View case study', zh: '查看案例详情' },
  accessPublic: { th: 'เปิดดูได้สาธารณะ', en: 'Publicly accessible', zh: '可公开访问' },
  accessInternal: { th: 'ระบบภายในองค์กร · ไม่เปิดสาธารณะ', en: 'Internal system · not public', zh: '企业内部系统 · 不对外公开' },
  accessClient: { th: 'ระบบของลูกค้า · ไม่เปิดสาธารณะ', en: 'Client system · not public', zh: '客户系统 · 不对外公开' },
  accessWebsite: { th: 'เว็บไซต์สาธารณะ', en: 'Public website', zh: '公开网站' }
} satisfies Record<string, LocalizedText>;
