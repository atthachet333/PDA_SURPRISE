import { company } from '@/data/company';

/**
 * The public origin, injected at build time.
 *
 * OWNER INPUT: set `VITE_PUBLIC_ORIGIN` when the production hostname is chosen.
 * While it is empty every URL emitted here is relative, which is valid and
 * correct — canonical and Open Graph tags simply carry less weight until a real
 * origin exists. Nothing breaks, and nothing invents a hostname.
 */
export const PUBLIC_ORIGIN: string = (import.meta.env.VITE_PUBLIC_ORIGIN ?? '')
  .toString()
  .replace(/\/$/, '');

export const absoluteUrl = (path: string): string =>
  PUBLIC_ORIGIN ? `${PUBLIC_ORIGIN}${path}` : path;

export interface PageMeta {
  title: string;
  description: string;
  /** Path only, e.g. '/solutions'. Made absolute when an origin is configured. */
  path: string;
  /**
   * Keep this page out of search results. Every private route sets it, and the
   * metadata for those routes is deliberately generic — see `privateMeta`.
   */
  noindex?: boolean;
}

const SITE_NAME = 'PDA BLISS';
const TITLE_SUFFIX = ' — PDA BLISS';

/** Public corporate pages. These are the only routes offered for indexing. */
export const pageMeta = {
  home: {
    title: 'PDA BLISS — พัฒนาซอฟต์แวร์และระบบธุรกิจ',
    description:
      'PDA BLISS COMPANY LIMITED รับพัฒนาซอฟต์แวร์ ระบบธุรกิจ เว็บแอปพลิเคชัน ระบบภายในองค์กร และ Automation ที่ออกแบบจากกระบวนการทำงานจริง',
    path: '/'
  },
  services: {
    title: `บริการของเรา${TITLE_SUFFIX}`,
    description:
      'พัฒนาระบบธุรกิจ ระบบเงินเดือน เว็บไซต์ เว็บแอปพลิเคชัน โมบายแอป ระบบ HR ผ่าน LINE และระบบจัดการเอกสาร ออกแบบจากกระบวนการทำงานจริงขององค์กร',
    path: '/services'
  },
  solutions: {
    title: `โซลูชัน${TITLE_SUFFIX}`,
    description:
      'โซลูชันซอฟต์แวร์สำหรับธุรกิจไทย ตั้งแต่ระบบภายในองค์กร ระบบเอกสาร ไปจนถึงเว็บแอปพลิเคชันที่เชื่อมกับการทำงานเดิมของคุณ',
    path: '/solutions'
  },
  work: {
    title: `ผลงาน${TITLE_SUFFIX}`,
    description:
      'ตัวอย่างระบบและเว็บไซต์ที่ PDA BLISS พัฒนา พร้อมแนวทางการออกแบบและเทคโนโลยีที่เลือกใช้ในแต่ละโปรเจกต์',
    path: '/work'
  },
  insights: {
    title: `บทความและมุมมอง${TITLE_SUFFIX}`,
    description:
      'มุมมองเรื่องการวางระบบ การเลือกเทคโนโลยี และการตัดสินใจเรื่องซอฟต์แวร์สำหรับธุรกิจ จากทีม PDA BLISS',
    path: '/insights'
  },
  about: {
    title: `เกี่ยวกับเรา${TITLE_SUFFIX}`,
    description:
      'PDA BLISS COMPANY LIMITED — ทีมพัฒนาซอฟต์แวร์และระบบธุรกิจ ที่ทำงานร่วมกับลูกค้าตั้งแต่เข้าใจปัญหา ออกแบบ พัฒนา จนถึงดูแลหลังส่งมอบ',
    path: '/about'
  },
  contact: {
    title: `ติดต่อเรา${TITLE_SUFFIX}`,
    description: `คุยกับ PDA BLISS เรื่องระบบหรือซอฟต์แวร์ที่คุณกำลังวางแผน โทร ${company.phoneDisplay} หรืออีเมล ${company.email}`,
    path: '/contact'
  },
  privacy: {
    title: `นโยบายความเป็นส่วนตัว${TITLE_SUFFIX}`,
    description: 'นโยบายความเป็นส่วนตัวของ PDA BLISS COMPANY LIMITED',
    path: '/privacy'
  },
  cookiePolicy: {
    title: `นโยบายคุกกี้${TITLE_SUFFIX}`,
    description: 'นโยบายการใช้คุกกี้บนเว็บไซต์ PDA BLISS',
    path: '/cookie-policy'
  },
  terms: {
    title: `ข้อกำหนดการใช้งาน${TITLE_SUFFIX}`,
    description: 'ข้อกำหนดการใช้งานเว็บไซต์ PDA BLISS',
    path: '/terms'
  },
  notFound: {
    title: `ไม่พบหน้านี้${TITLE_SUFFIX}`,
    description: 'ไม่พบหน้าที่คุณกำลังมองหา',
    path: '/404',
    noindex: true
  }
} as const satisfies Record<string, PageMeta>;

/**
 * PRIVATE ROUTES — /login, /memory-gate, /workspace, /us.
 *
 * One deliberately empty title for all of them, and `noindex, nofollow`.
 *
 * Nothing about the anniversary appears here: no names beyond the company, no
 * dates, no relationship or registration date, no cats, no letter, no mention that there is anything
 * personal behind the route at all. This is what a link preview shows when one
 * of these URLs is pasted into a chat, so it has to give nothing away.
 */
export const privateMeta: PageMeta = {
  title: SITE_NAME,
  description: 'Private workspace.',
  path: '/',
  noindex: true
};

/** The routes offered to search engines. Nothing private is ever listed. */
export const indexablePaths: string[] = [
  '/',
  '/services',
  '/solutions',
  '/work',
  '/about',
  '/contact',
  '/insights',
  '/privacy',
  '/cookie-policy',
  '/terms'
];
