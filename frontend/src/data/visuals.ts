/**
 * ============================================================================
 * VISUAL ASSET MAP — one place that decides what image every slot shows
 * ============================================================================
 * Every product visual on the corporate site resolves through this file. A slot
 * names a mock to draw TODAY and, optionally, a reviewed screenshot to use
 * INSTEAD once one exists.
 *
 * HOW TO SWAP IN A REAL SCREENSHOT
 *   1. Clear the image through `docs/SCREENSHOT_PRIVACY.md` — mask employee
 *      names, salaries, client names, login fields and browser chrome.
 *   2. Put the file in `frontend/public/images/work/`.
 *   3. Set `screenshot` on the slot below.
 *   That is the whole change. No component is touched, and the layout is
 *   identical either way because both paths render into the same frame.
 *
 * WHY MOCKS AT ALL
 *   A software company's site has to show software. No capture has cleared
 *   review yet — payroll and document systems cannot be published without
 *   masking first — so `SystemMock` stands in. The mocks use plainly generic
 *   sample data (EMP-001, DOC-2401) and are never captioned as client work.
 *
 * NEVER put a fabricated business result in here. Descriptions say what a
 * system does, never what it earned or saved.
 * ============================================================================
 */

import type { MockKind } from '@/lib/systemMocks';

export interface VisualSlot {
  id: string;
  /**
   * Portfolio item this visual belongs to, when it represents real work.
   * Lets a showreel card link to the right case study instead of a generic
   * "see all work" destination.
   */
  portfolioId?: string;
  /** Mock drawn while no reviewed screenshot exists. */
  mock: MockKind;
  /** Short caption / frame label. Describes the SCREEN, not an outcome. */
  label: string;
  /** Thai title, used where the slot is presented as a product. */
  titleTh?: string;
  /**
   * Reviewed, public-safe screenshot under /public. When set, this is rendered
   * instead of the mock. Must have passed docs/SCREENSHOT_PRIVACY.md.
   */
  screenshot?: string;
  /** Alt text for the screenshot. Required whenever `screenshot` is set. */
  alt?: string;
}

/** True when a slot has a reviewed screenshot ready to publish. */
export const hasRealImage = (slot: VisualSlot): boolean => Boolean(slot.screenshot);

// --- hero ------------------------------------------------------------------

/**
 * The hero rig. Order matters: [0] is the large primary plane, [1] the phone
 * in front, [2] the panel set back, [3] the small floating status card.
 */
export const heroVisuals: VisualSlot[] = [
  { id: 'hero-erp', mock: 'erp', label: 'erp.pdabliss.app', titleTh: 'ระบบ ERP' },
  { id: 'hero-hr', mock: 'hrLine', label: 'HR · LINE', titleTh: 'ระบบ HR ผ่าน LINE' },
  { id: 'hero-docs', mock: 'documents', label: 'docs', titleTh: 'ระบบจัดเก็บเอกสาร' },
  { id: 'hero-payroll', mock: 'payroll', label: 'payroll', titleTh: 'ระบบเงินเดือน' }
];

// --- showreel --------------------------------------------------------------

/** The interface showreel, left to right. */
export const showreelVisuals: VisualSlot[] = [
  {
    id: 'reel-payroll',
    mock: 'payroll',
    label: 'payroll',
    titleTh: 'ระบบเงินเดือน',
    portfolioId: 'payroll-management-system'
  },
  {
    id: 'reel-erp',
    mock: 'erp',
    label: 'erp',
    titleTh: 'ระบบ ERP / การผลิต',
    portfolioId: 'production-inventory-costing-erp'
  },
  {
    id: 'reel-nas',
    mock: 'nas',
    label: 'nas',
    titleTh: 'พื้นที่จัดเก็บเอกสาร',
    portfolioId: 's2-nas-document-storage'
  },
  {
    id: 'reel-website',
    mock: 'website',
    label: 'website',
    titleTh: 'เว็บไซต์องค์กร',
    portfolioId: 's2-accounting-consultant-website'
  },
  // No portfolio entry yet — these two are capability demonstrations, so they
  // link to the services that describe them rather than to a case study.
  { id: 'reel-hr', mock: 'hrLine', label: 'HR · LINE', titleTh: 'HR ผ่าน LINE' },
  { id: 'reel-workflow', mock: 'workflow', label: 'workflow', titleTh: 'เส้นทางอนุมัติเอกสาร' }
];

/** Where a showreel card should go when clicked. */
export const showreelDestination: Record<string, string> = {
  'reel-hr': '/services#hr-line-bot',
  'reel-workflow': '/services#document-management'
};

// --- services --------------------------------------------------------------

/** Keyed by service id in `data/services.ts`. */
export const serviceVisuals: Record<string, VisualSlot> = {
  'business-systems': { id: 'svc-erp', mock: 'erp', label: 'erp', titleTh: 'ระบบ ERP' },
  payroll: { id: 'svc-payroll', mock: 'payroll', label: 'payroll', titleTh: 'ระบบเงินเดือน' },
  websites: { id: 'svc-web', mock: 'website', label: 'website', titleTh: 'เว็บไซต์องค์กร' },
  'web-applications': { id: 'svc-webapp', mock: 'analytics', label: 'app', titleTh: 'เว็บแอปพลิเคชัน' },
  'mobile-applications': { id: 'svc-mobile', mock: 'hrLine', label: 'mobile', titleTh: 'แอปมือถือ' },
  'hr-line-bot': { id: 'svc-hr', mock: 'hrLine', label: 'HR · LINE', titleTh: 'HR ผ่าน LINE' },
  'document-management': { id: 'svc-docs', mock: 'documents', label: 'docs', titleTh: 'ระบบเอกสาร' },
  'custom-software': { id: 'svc-custom', mock: 'workflow', label: 'workflow', titleTh: 'ระบบเฉพาะทาง' },
  'internal-tools': { id: 'svc-internal', mock: 'analytics', label: 'tools', titleTh: 'ระบบภายใน' },
  automation: { id: 'svc-auto', mock: 'workflow', label: 'automation', titleTh: 'Automation' },
  integration: { id: 'svc-api', mock: 'tracking', label: 'api', titleTh: 'เชื่อมต่อระบบ' },
  analytics: { id: 'svc-analytics', mock: 'analytics', label: 'dashboard', titleTh: 'Dashboard' },
  cloud: { id: 'svc-cloud', mock: 'nas', label: 'infra', titleTh: 'โครงสร้างพื้นฐาน' },
  support: { id: 'svc-support', mock: 'analytics', label: 'monitoring', titleTh: 'ดูแลระบบ' },
  consulting: { id: 'svc-consult', mock: 'workflow', label: 'assessment', titleTh: 'ที่ปรึกษา' }
};

/** Falls back to a neutral dashboard rather than rendering nothing. */
export const visualForService = (serviceId: string): VisualSlot =>
  serviceVisuals[serviceId] ?? { id: `svc-${serviceId}`, mock: 'analytics', label: 'system' };

// --- solutions -------------------------------------------------------------

/** Keyed by solution id in `data/solutions.ts`. */
export const solutionVisuals: Record<string, VisualSlot> = {
  erp: { id: 'sol-erp', mock: 'erp', label: 'erp' },
  'hr-payroll': { id: 'sol-payroll', mock: 'payroll', label: 'payroll' },
  crm: { id: 'sol-crm', mock: 'analytics', label: 'crm' },
  'sales-inventory': { id: 'sol-inventory', mock: 'erp', label: 'inventory' },
  'document-workflow': { id: 'sol-docflow', mock: 'workflow', label: 'workflow' },
  approval: { id: 'sol-approval', mock: 'workflow', label: 'approval' },
  tracking: { id: 'sol-tracking', mock: 'tracking', label: 'tracking' },
  booking: { id: 'sol-booking', mock: 'analytics', label: 'booking' },
  'internal-tools': { id: 'sol-internal', mock: 'analytics', label: 'tools' },
  automation: { id: 'sol-auto', mock: 'workflow', label: 'automation' },
  analytics: { id: 'sol-analytics', mock: 'analytics', label: 'dashboard' },
  'customer-portal': { id: 'sol-portal', mock: 'website', label: 'portal' }
};

export const visualForSolution = (solutionId: string): VisualSlot =>
  solutionVisuals[solutionId] ?? { id: `sol-${solutionId}`, mock: 'analytics', label: 'system' };

// --- portfolio -------------------------------------------------------------

/**
 * Keyed by portfolio item id in `data/portfolio.ts`. This is where reviewed
 * screenshots of the REAL systems land — the highest-value swap on the site.
 */
export const portfolioVisuals: Record<string, VisualSlot> = {
  'payroll-management-system': {
    id: 'pf-payroll',
    mock: 'payroll',
    label: 'payroll · pay run',
    titleTh: 'ระบบบริหารงานเงินเดือน'
  },
  'production-inventory-costing-erp': {
    id: 'pf-erp',
    mock: 'erp',
    label: 'erp · production',
    titleTh: 'ระบบ ERP การผลิตและต้นทุน'
  },
  's2-accounting-consultant-website': {
    id: 'pf-s2web',
    mock: 'website',
    label: 's2 · website',
    titleTh: 'เว็บไซต์ S2 Accounting Consultant'
  },
  's2-nas-document-storage': {
    id: 'pf-nas',
    mock: 'nas',
    label: 's2 · nas',
    titleTh: 'ระบบจัดเก็บเอกสาร S2 NAS'
  },
  'pdabliss-corporate-website': {
    id: 'pf-pdabliss',
    mock: 'website',
    label: 'pdabliss.com',
    titleTh: 'เว็บไซต์องค์กร PDA BLISS'
  }
};

export const visualForPortfolio = (itemId: string): VisualSlot =>
  portfolioVisuals[itemId] ?? { id: `pf-${itemId}`, mock: 'analytics', label: 'system' };

/** Slots still waiting on a reviewed screenshot — useful for an owner checklist. */
export function slotsAwaitingScreenshots(): VisualSlot[] {
  const all = [
    ...heroVisuals,
    ...showreelVisuals,
    ...Object.values(serviceVisuals),
    ...Object.values(solutionVisuals),
    ...Object.values(portfolioVisuals)
  ];
  return all.filter((slot) => !slot.screenshot);
}
