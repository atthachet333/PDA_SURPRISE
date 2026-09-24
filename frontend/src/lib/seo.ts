import { company } from '@/data/company';
import type { LocalizedText } from '@/i18n/text';
import { localizedPaths } from '@/i18n/seo';

/**
 * The public origin, injected at build time.
 *
 * OWNER INPUT: set `VITE_PUBLIC_ORIGIN` when the production hostname is chosen.
 * While it is empty every URL emitted here is relative, which is valid and
 * correct — canonical and Open Graph tags simply carry less weight until a real
 * origin exists. Nothing breaks, and nothing invents a hostname.
 */
/* `?.` only so node tests can import this module; Vite always defines env. */
export const PUBLIC_ORIGIN: string = (import.meta.env?.VITE_PUBLIC_ORIGIN ?? '')
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
  /**
   * A public page whose title and description are already in the active
   * locale (built from a record, like a case study). Gets the same per-locale
   * canonical and hreflang treatment as a `LocalizedPageMeta`.
   */
  localizedRoute?: boolean;
}

/**
 * A public corporate page, in all three languages. `path` is locale-neutral;
 * `usePageMeta` resolves the canonical and hreflang routes for the active
 * locale. Each language is written for its reader, not transliterated.
 */
export interface LocalizedPageMeta {
  title: LocalizedText;
  description: LocalizedText;
  path: string;
  noindex?: boolean;
}

const SITE_NAME = 'PDA BLISS';
const TITLE_SUFFIX = ' — PDA BLISS';

/** Public corporate pages. These are the only routes offered for indexing. */
export const pageMeta = {
  home: {
    title: {
      th: 'PDA BLISS — พัฒนาซอฟต์แวร์และระบบธุรกิจ',
      en: 'PDA BLISS — Custom Software & Business Systems',
      zh: 'PDA BLISS — 定制软件与企业系统开发'
    },
    description: {
      th: 'PDA BLISS COMPANY LIMITED รับพัฒนาซอฟต์แวร์ ระบบธุรกิจ เว็บแอปพลิเคชัน ระบบภายในองค์กร และ Automation ที่ออกแบบจากกระบวนการทำงานจริง',
      en: 'PDA BLISS COMPANY LIMITED builds custom software, business systems, web applications, internal tools and automation, designed around how your business actually works.',
      zh: 'PDA BLISS COMPANY LIMITED 为企业开发定制软件、业务系统、Web 应用、内部系统和自动化工具，一切从真实的工作流程出发。'
    },
    path: '/'
  },
  services: {
    title: {
      th: `บริการพัฒนาระบบ เว็บไซต์ และซอฟต์แวร์${TITLE_SUFFIX}`,
      en: `Services: Business Systems, Web Apps & Websites${TITLE_SUFFIX}`,
      zh: `服务：企业系统、Web 应用与网站开发${TITLE_SUFFIX}`
    },
    description: {
      th: 'บริการพัฒนา ERP, Payroll, HR ผ่าน LINE, ระบบเอกสารและการอนุมัติ, ระบบไฟล์กลาง (NAS), เว็บแอปพลิเคชัน, แอปมือถือ และเว็บไซต์องค์กร อธิบายจากปัญหาธุรกิจและสิ่งที่เราสร้างจริง',
      en: 'ERP, payroll, HR on LINE, document and approval workflows, central file storage (NAS), web applications, mobile apps and corporate websites — explained through the business problem and what we actually build.',
      zh: 'ERP、Payroll 薪资、基于 LINE 的 HR、文档审批、集中文件存储（NAS）、Web 应用、移动应用和企业网站——从业务问题和我们实际交付的内容讲起。'
    },
    path: '/services'
  },
  solutions: {
    title: {
      th: `ระบบของเรา${TITLE_SUFFIX}`,
      en: `Our Systems${TITLE_SUFFIX}`,
      zh: `我们的系统${TITLE_SUFFIX}`
    },
    description: {
      th: 'สำรวจระบบของ PDA BLISS ตั้งแต่ ERP, Payroll, HR LINE BOT, ระบบเอกสารและไฟล์ ไปจนถึงเว็บและโมบายแอปที่ออกแบบให้ทำงานร่วมกันได้',
      en: 'Explore the systems PDA BLISS builds — ERP, payroll, HR LINE bot, document and file systems, through to web and mobile apps designed to work together.',
      zh: '了解 PDA BLISS 构建的系统：ERP、Payroll、HR LINE BOT、文档与文件系统，以及可以相互协作的 Web 和移动应用。'
    },
    path: '/solutions'
  },
  work: {
    title: {
      th: `ผลงานระบบและเว็บไซต์${TITLE_SUFFIX}`,
      en: `Work: Systems & Websites We Have Delivered${TITLE_SUFFIX}`,
      zh: `案例：已交付的系统与网站${TITLE_SUFFIX}`
    },
    description: {
      th: 'ผลงานจริงของ PDA BLISS: ระบบ ERP ต้นทุนและสต็อก, Payroll, HR ผ่าน LINE, ระบบเอกสารและจัดเก็บไฟล์ และเว็บไซต์องค์กร พร้อมปัญหา สิ่งที่เราสร้าง และวิธีที่ระบบทำงาน',
      en: 'Real PDA BLISS projects: ERP for inventory and costing, payroll, HR on LINE, document and file storage systems, and corporate websites — the problem, what we built and how it works.',
      zh: 'PDA BLISS 的真实项目：库存与成本 ERP、Payroll、基于 LINE 的 HR、文档与文件存储系统以及企业网站——包括问题、我们构建的内容和系统的运作方式。'
    },
    path: '/work'
  },
  insights: {
    title: {
      th: `บทความและมุมมอง${TITLE_SUFFIX}`,
      en: `Insights${TITLE_SUFFIX}`,
      zh: `观点与文章${TITLE_SUFFIX}`
    },
    description: {
      th: 'มุมมองเรื่องการวางระบบ การเลือกเทคโนโลยี และการตัดสินใจเรื่องซอฟต์แวร์สำหรับธุรกิจ จากทีม PDA BLISS',
      en: 'Notes from the PDA BLISS team on planning systems, choosing technology and making software decisions for a business.',
      zh: 'PDA BLISS 团队关于系统规划、技术选型和企业软件决策的观点。'
    },
    path: '/insights'
  },
  about: {
    title: {
      th: `เกี่ยวกับเรา${TITLE_SUFFIX}`,
      en: `About Us${TITLE_SUFFIX}`,
      zh: `关于我们${TITLE_SUFFIX}`
    },
    description: {
      th: 'PDA BLISS COMPANY LIMITED — ทีมพัฒนาซอฟต์แวร์และระบบธุรกิจ ที่ทำงานร่วมกับลูกค้าตั้งแต่เข้าใจปัญหา ออกแบบ พัฒนา จนถึงดูแลหลังส่งมอบ',
      en: 'PDA BLISS COMPANY LIMITED is a software and business-systems team that works with clients from understanding the problem through design, development and support after handover.',
      zh: 'PDA BLISS COMPANY LIMITED 是一支软件与企业系统开发团队，从理解问题、设计、开发到交付后的维护，全程与客户协作。'
    },
    path: '/about'
  },
  contact: {
    title: {
      th: `ติดต่อเรา${TITLE_SUFFIX}`,
      en: `Contact Us${TITLE_SUFFIX}`,
      zh: `联系我们${TITLE_SUFFIX}`
    },
    description: {
      th: `คุยกับ PDA BLISS เรื่องระบบหรือซอฟต์แวร์ที่คุณกำลังวางแผน โทร ${company.phoneDisplay} หรืออีเมล ${company.email}`,
      en: `Talk to PDA BLISS about the system or software you are planning. Call ${company.phoneDisplay} or email ${company.email}.`,
      zh: `与 PDA BLISS 沟通您正在规划的系统或软件。电话 ${company.phoneDisplay}，邮箱 ${company.email}。`
    },
    path: '/contact'
  },
  privacy: {
    title: {
      th: `นโยบายความเป็นส่วนตัว${TITLE_SUFFIX}`,
      en: `Privacy Policy${TITLE_SUFFIX}`,
      zh: `隐私政策${TITLE_SUFFIX}`
    },
    description: {
      th: 'นโยบายความเป็นส่วนตัวของ PDA BLISS COMPANY LIMITED',
      en: 'Privacy policy of PDA BLISS COMPANY LIMITED.',
      zh: 'PDA BLISS COMPANY LIMITED 的隐私政策。'
    },
    path: '/privacy'
  },
  cookiePolicy: {
    title: {
      th: `นโยบายคุกกี้${TITLE_SUFFIX}`,
      en: `Cookie Policy${TITLE_SUFFIX}`,
      zh: `Cookie 政策${TITLE_SUFFIX}`
    },
    description: {
      th: 'นโยบายการใช้คุกกี้บนเว็บไซต์ PDA BLISS',
      en: 'How the PDA BLISS website uses cookies.',
      zh: 'PDA BLISS 网站如何使用 Cookie。'
    },
    path: '/cookie-policy'
  },
  terms: {
    title: {
      th: `ข้อกำหนดการใช้งาน${TITLE_SUFFIX}`,
      en: `Terms of Use${TITLE_SUFFIX}`,
      zh: `使用条款${TITLE_SUFFIX}`
    },
    description: {
      th: 'ข้อกำหนดการใช้งานเว็บไซต์ PDA BLISS',
      en: 'Terms of use for the PDA BLISS website.',
      zh: 'PDA BLISS 网站使用条款。'
    },
    path: '/terms'
  },
  notFound: {
    title: {
      th: `ไม่พบหน้านี้${TITLE_SUFFIX}`,
      en: `Page Not Found${TITLE_SUFFIX}`,
      zh: `找不到页面${TITLE_SUFFIX}`
    },
    description: {
      th: 'ไม่พบหน้าที่คุณกำลังมองหา',
      en: 'The page you are looking for could not be found.',
      zh: '找不到您要访问的页面。'
    },
    path: '/404',
    noindex: true
  }
} as const satisfies Record<string, LocalizedPageMeta>;

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

/**
 * The locale-neutral routes offered to search engines. Nothing private is ever
 * listed. Each is published in all three languages — see `indexableUrls`.
 */
export const indexablePaths: string[] = [
  '/',
  '/services',
  '/solutions',
  '/work',
  '/work/erp-inventory-costing',
  '/work/payroll-monthly-control',
  '/work/hr-line-leave-approval',
  '/work/document-file-workflow',
  '/work/nas-file-storage',
  '/work/corporate-website-system',
  '/work/s2-accounting-website',
  '/about',
  '/contact',
  '/insights',
  '/privacy',
  '/cookie-policy',
  '/terms'
];

/** Every indexable route in every locale: /services, /en/services, /zh/services … */
export const indexableUrls: string[] = localizedPaths(indexablePaths);
