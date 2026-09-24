import type { Solution, SolutionCategory } from '@/data/solutions';
import type { Locale } from './locales';
import type { LocalizedText } from './text';
import type { ContentPack } from './content/types';

/**
 * ============================================================================
 * SOLUTIONS — EN / ZH overlays for `data/solutions.ts`
 * ============================================================================
 * Faithful to the Thai record, capability for capability.
 *
 * OWNER REVIEW REQUIRED — the Thai HR / Payroll highlight
 * "รองรับประกันสังคมและภาษีไทย" (supports Thai social security and tax)
 * conflicts with the EP38 correction in data/services.ts, which removed every
 * automatic tax or social-security compliance claim. It is translated at the
 * same strength here, not stronger, but the Thai source should be reviewed.
 * The same review applies to the other highlight lists (multi-company, digital
 * signatures, offline mode …), which describe capabilities rather than
 * delivered case studies.
 * ============================================================================
 */

export interface SolutionText {
  title: string;
  summary: string;
  benefits: readonly string[];
  highlights: readonly string[];
}

export function localizeSolution(solution: Solution, pack: ContentPack | null): Solution {
  if (!pack) return solution;
  const text = pack.solutions[solution.id];
  if (!text) return solution;
  return { ...solution, title: text.title, summary: text.summary, benefits: [...text.benefits], highlights: [...text.highlights] };
}

export const solutionCategoryLabel: Record<SolutionCategory | 'all', LocalizedText> = {
  all: { th: 'ทั้งหมด', en: 'All', zh: '全部' },
  operations: { th: 'งานปฏิบัติการ', en: 'Operations', zh: '运营' },
  people: { th: 'บุคคล', en: 'People', zh: '人事' },
  revenue: { th: 'งานขาย', en: 'Sales', zh: '销售' },
  insight: { th: 'ข้อมูลและรายงาน', en: 'Data & reporting', zh: '数据与报表' }
};

/** Home showcase: one line on what each featured solution is for. */
export const solutionPurpose: Record<string, LocalizedText> = {
  erp: { th: 'รวมข้อมูลธุรกิจไว้ในระบบเดียว', en: 'All your business data in one system', zh: '把业务数据集中到一个系统' },
  'hr-payroll': {
    th: 'ลดเวลาจัดทำเงินเดือนและตรวจสอบย้อนหลัง',
    en: 'Less time preparing and auditing payroll',
    zh: '缩短薪资制作与回查时间'
  },
  'document-workflow': {
    th: 'จัดเก็บ ค้นหา และควบคุมเอกสารจากจุดเดียว',
    en: 'Store, find and control documents from one place',
    zh: '在一处存储、查找和管控文档'
  },
  'sales-inventory': {
    th: 'ยอดสต็อกตรงกับของจริงทุกช่องทาง',
    en: 'Stock that matches reality in every channel',
    zh: '所有渠道的库存都与实物一致'
  },
  tracking: {
    th: 'รู้ว่างานอยู่ขั้นตอนไหน โดยไม่ต้องโทรถาม',
    en: 'Know which step the work is at, without calling to ask',
    zh: '无需打电话，就知道工作进行到哪一步'
  },
  automation: {
    th: 'ตัดงานซ้ำที่กินเวลาทุกเดือนออกไป',
    en: 'Remove the repetitive work that eats time every month',
    zh: '去掉每月占用大量时间的重复工作'
  }
};

export const solutionShowcase = {
  title: {
    th: ['ไม่ใช่แค่เขียนโปรแกรม', 'แต่ออกแบบให้ธุรกิจทำงานง่ายขึ้น'],
    en: ['Not just writing code —', 'designing how the business works'],
    zh: ['不只是写程序，', '更是让业务运转得更顺畅']
  },
  viewAll: { th: 'ดูโซลูชันทั้งหมด', en: 'View all solutions', zh: '查看全部方案' },
  choose: { th: 'เลือกโซลูชัน', en: 'Choose a solution', zh: '选择方案' }
} satisfies Record<string, LocalizedText | Record<Locale, readonly string[]>>;
