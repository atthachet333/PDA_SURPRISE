/**
 * ============================================================================
 * PDA BLISS — portfolio manifest (real systems)
 * ============================================================================
 * This file is the record of work that ACTUALLY EXISTS, kept separate from the
 * case-study records in `caseStudies.ts`. Nothing here is rendered publicly
 * yet: the redesign pass owns the Work showcase, and each item must clear two
 * gates first.
 *
 *   verified    The owner has confirmed the description is accurate. Items with
 *               `verified: false` may be shown as a system NAME only — never
 *               with outcome claims.
 *   publicSafe  Every screenshot has been reviewed and contains no login
 *               emails, passwords, employee data or client-confidential
 *               records. Until this is true the item must not be rendered with
 *               imagery of any kind.
 *
 * NO OUTCOME NUMBERS APPEAR IN THIS FILE. `problem` and `solution` describe
 * what the system does; results, savings and percentages are deliberately
 * absent because none have been measured or supplied.
 *
 * SCREENSHOTS
 *   Place reviewed, masked images in `frontend/public/images/work/` and list
 *   them in `screenshots[]`. See `docs/SCREENSHOT_PRIVACY.md` for the review
 *   and masking checklist that must be completed before an image is added.
 * ============================================================================
 */

export type PortfolioCategory =
  | 'erp'
  | 'payroll'
  | 'website'
  | 'web-application'
  | 'application'
  | 'hr-line-bot'
  | 'document-storage';

export interface PortfolioScreenshot {
  /** Path under /public, e.g. '/images/work/payroll-dashboard.png' */
  src: string;
  caption: string;
  /**
   * What was masked, cropped or replaced before this image was added. An empty
   * string means "nothing needed masking" and still requires a real review.
   */
  redactions: string;
  /** Set true only after a human has looked at the final file. */
  reviewed: boolean;
}

/**
 * How openly a system can be shown.
 *
 *   public    a live site anyone may visit
 *   client    a client's system; may be described, never linked
 *   internal  an internal tool; described only, no link, no screenshots
 */
export type PortfolioVisibility = 'public' | 'client' | 'internal';

export interface PortfolioItem {
  id: string;
  titleTh: string;
  titleEn: string;
  category: PortfolioCategory;
  summary: string;
  problem: string;
  solution: string;
  features: string[];
  stack: string[];
  screenshots: PortfolioScreenshot[];
  /** Preferred privacy-reviewed hero image for this project. */
  approvedScreenshot?: PortfolioScreenshot;
  /** Optional capture of the public marketing site, used after approvedScreenshot. */
  publicWebsiteImage?: PortfolioScreenshot;
  /** True only when every screenshot is reviewed and free of private data. */
  publicSafe: boolean;
  /** True only when the owner has confirmed this description is accurate. */
  verified: boolean;
  /** Owner-facing note about what is still needed for this item. */
  pending?: string;

  // --- public presence -----------------------------------------------------
  /**
   * How openly this system may be presented. Drives the badge a visitor sees
   * and whether a live link can ever be rendered.
   */
  visibility: PortfolioVisibility;
  /**
   * The live, publicly reachable URL — a marketing site or a public app only.
   *
   * ─── OWNER INPUT REQUIRED ─────────────────────────────────────────────────
   * NOTHING is guessed here. A domain is only added once the owner confirms it,
   * because a wrong or dead link is worse than no link. Leave undefined and the
   * UI simply shows no live action.
   *
   * NEVER put an admin panel, a staging host, an internal hostname or anything
   * behind a login in this field. `canShowLiveLink()` additionally requires
   * `visibility === 'public'` and `publicSafe`, so an internal system cannot be
   * linked even if a URL is set by mistake.
   * ──────────────────────────────────────────────────────────────────────────
   */
  publicUrl?: string;
  /** Public source repository, when one exists. Same rules as `publicUrl`. */
  repositoryUrl?: string;
}

/**
 * The single gate for rendering a live link. Three conditions, all required:
 * the owner marked it public, the media passed privacy review, and a URL
 * actually exists.
 */
export function canShowLiveLink(item: PortfolioItem): boolean {
  return item.visibility === 'public' && item.publicSafe === true && Boolean(item.publicUrl);
}

/** Badge text for how a system may be shown. */
export function visibilityLabel(item: PortfolioItem): string {
  if (canShowLiveLink(item)) return 'เปิดใช้งานจริง';
  if (item.visibility === 'public') return 'เว็บไซต์สาธารณะ';
  if (item.visibility === 'client') return 'ระบบของลูกค้า';
  return 'ระบบภายในองค์กร';
}

export const portfolio: PortfolioItem[] = [
  {
    id: 'payroll-management-system',
    titleTh: 'ระบบบริหารงานเงินเดือน',
    titleEn: 'Payroll Management System',
    category: 'payroll',
    summary: 'ระบบคำนวณเงินเดือน เวลาทำงาน และค่าล่วงเวลา สำหรับใช้งานภายในองค์กร',
    problem:
      'งานเงินเดือนเดิมอาศัยไฟล์ Excel ต่อกันหลายชั้น การแก้เงื่อนไขแต่ละครั้งต้องทำด้วยมือ และการตรวจย้อนหลังว่าตัวเลขมาจากอะไรทำได้ยาก',
    solution:
      'รวมข้อมูลพนักงาน เวลาทำงาน และเงื่อนไขการคำนวณไว้ในระบบเดียว ให้ฝ่ายบุคคลตั้งกฎได้เอง และเก็บที่มาของตัวเลขในทุกรอบการจ่าย',
    features: ['ข้อมูลพนักงานและโครงสร้างเงินเดือน', 'เวลาทำงาน กะ และค่าล่วงเวลา', 'คำนวณรอบเงินเดือนและออกสลิป', 'รายงานสำหรับงานบัญชี'],
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'React'],
    screenshots: [],
    publicSafe: false,
    verified: false,
    // Payroll holds employee salary data: never linkable, screenshots need masking.
    visibility: 'internal',
    pending: 'ต้องการคำยืนยันขอบเขตงานจากเจ้าของ และภาพหน้าจอที่ปิดข้อมูลส่วนบุคคลแล้ว'
  },
  {
    id: 'production-inventory-costing-erp',
    titleTh: 'ระบบ ERP การผลิต คลังสินค้า และต้นทุน',
    titleEn: 'Production & Inventory / Costing ERP',
    category: 'erp',
    summary: 'ระบบ ERP ที่ครอบคลุมการผลิต การจัดการคลังสินค้า และการคิดต้นทุน',
    problem:
      'ข้อมูลการผลิต ยอดคงเหลือในคลัง และต้นทุนอยู่แยกไฟล์กัน ทำให้ตัวเลขไม่ตรงกันและคิดต้นทุนต่อหน่วยได้ช้า',
    solution:
      'บันทึกธุรกรรมการผลิตและการเคลื่อนไหวของสินค้าไว้ในชุดข้อมูลเดียว แล้วคิดต้นทุนจากข้อมูลเดียวกันนั้น เพื่อให้ยอดคลังและต้นทุนอ้างอิงกลับไปที่เอกสารต้นทางได้',
    features: ['ใบสั่งผลิตและการบันทึกผล', 'รับเข้า จ่ายออก และโอนย้ายสินค้า', 'คิดต้นทุนการผลิต', 'รายงานคลังสินค้าและต้นทุน'],
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'React'],
    screenshots: [],
    publicSafe: false,
    verified: false,
    visibility: 'client',
    pending: 'ต้องการคำยืนยันขอบเขตงาน ชื่อที่ใช้เรียกต่อสาธารณะ และภาพหน้าจอที่ตรวจแล้ว'
  },
  {
    id: 's2-accounting-consultant-website',
    titleTh: 'เว็บไซต์ S2 Accounting Consultant',
    titleEn: 'S2 Accounting Consultant Website',
    category: 'website',
    summary: 'เว็บไซต์องค์กรสำหรับสำนักงานที่ปรึกษาบัญชี',
    problem: 'ต้องการช่องทางออนไลน์ที่อธิบายบริการและทำให้ลูกค้าติดต่อเข้ามาได้โดยตรง',
    solution: 'ออกแบบโครงสร้างเนื้อหาตามบริการจริงของสำนักงาน พร้อมช่องทางติดต่อและการแสดงผลบนมือถือ',
    features: ['หน้าบริการและรายละเอียด', 'ช่องทางติดต่อ', 'รองรับการแสดงผลบนมือถือ'],
    stack: ['React', 'TypeScript'],
    screenshots: [],
    publicSafe: false,
    verified: false,
    /*
      A public marketing site, so a live link is possible in principle — but
      `publicUrl` stays undefined until the owner confirms the domain. Guessing
      it would risk linking somewhere wrong, and `canShowLiveLink()` returns
      false without it, so no dead button is rendered.
    */
    visibility: 'public',
    pending:
      'ต้องการอนุญาตจากลูกค้าก่อนเปิดเผยชื่อและภาพ และต้องการ URL จริงจากเจ้าของก่อนแสดงลิงก์'
  },
  {
    id: 's2-nas-document-storage',
    titleTh: 'ระบบจัดเก็บเอกสาร S2 NAS',
    titleEn: 'S2 NAS / Document Storage',
    category: 'document-storage',
    summary: 'ระบบจัดเก็บและเข้าถึงเอกสารภายในองค์กร',
    problem: 'เอกสารกระจายอยู่หลายที่ ค้นหายาก และไม่มีการกำหนดสิทธิ์การเข้าถึงที่ชัดเจน',
    solution: 'รวมเอกสารไว้ในที่เก็บกลางที่มีหมวดหมู่ สิทธิ์การเข้าถึง และการค้นหา',
    features: ['จัดหมวดหมู่เอกสาร', 'สิทธิ์การเข้าถึงตามผู้ใช้', 'ค้นหาและเรียกดูไฟล์'],
    stack: ['Node.js', 'React'],
    screenshots: [],
    publicSafe: false,
    verified: false,
    visibility: 'internal',
    pending: 'ระบบภายในของลูกค้า — ต้องการอนุญาตก่อนเผยแพร่ และต้องปิดชื่อไฟล์/ชื่อผู้ใช้ในภาพทุกภาพ'
  },
  {
    id: 'pdabliss-corporate-website',
    titleTh: 'เว็บไซต์องค์กร PDA BLISS',
    titleEn: 'PDA BLISS Corporate Website',
    category: 'website',
    summary: 'เว็บไซต์องค์กรของ PDA BLISS พร้อมพื้นที่สำหรับลูกค้าที่เข้าสู่ระบบ',
    problem: 'ต้องการเว็บไซต์ที่อธิบายบริการได้ครบ และมีทางเข้าสำหรับลูกค้าแยกจากส่วนสาธารณะ',
    solution: 'พัฒนาเว็บไซต์องค์กรที่มีข้อมูลบริการ ผลงาน และช่องทางติดต่อ พร้อมส่วนเข้าสู่ระบบสำหรับลูกค้า',
    features: ['หน้าบริการและโซลูชัน', 'หน้าผลงาน', 'แบบฟอร์มติดต่อที่เชื่อมกับ API', 'ส่วนเข้าสู่ระบบสำหรับลูกค้า'],
    stack: ['React', 'TypeScript', 'Vite', 'Fastify'],
    screenshots: [],
    publicSafe: true,
    verified: true,
    /*
      This site. Public and verified, but `publicUrl` waits on the owner
      confirming the production domain — the site is not deployed from here and
      no domain has been supplied, so there is nothing truthful to link to yet.
    */
    visibility: 'public',
    pending: 'ต้องการโดเมนจริงจากเจ้าของ เพื่อแสดงปุ่ม "เปิดเว็บไซต์จริง"'
  }
];

/**
 * Systems the owner has referred to but not yet documented. Kept as a list of
 * names only so the count of real work stays honest and nothing gets invented
 * to fill the gap.
 */
export const portfolioBacklog = [
  'ระบบภายในอื่น ๆ ที่มีอยู่ในเอกสารโปรเจกต์ — รอเจ้าของระบุรายการและขอบเขต'
] as const;

/** Items safe to render with imagery. */
export const publicPortfolio = portfolio.filter((item) => item.publicSafe && item.verified);

/** Items that may be named but must not show screenshots or outcome claims. */
export const pendingPortfolio = portfolio.filter((item) => !item.publicSafe || !item.verified);

export const getPortfolioItem = (id: string): PortfolioItem | undefined =>
  portfolio.find((item) => item.id === id);
