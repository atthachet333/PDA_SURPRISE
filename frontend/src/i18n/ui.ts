import type { ThemeMode } from '@/lib/theme';
import type { LocalizedList, LocalizedText } from './text';

/**
 * ============================================================================
 * GLOBAL CHROME — header, footer, menus, dock, banner, errors
 * ============================================================================
 * Strings every corporate page shares. Recurring actions live in `cta` below
 * and are reused everywhere, so "Start a project" is never phrased two ways.
 *
 * Tone
 *   EN  clear, concrete, modern software house — no transformation jargon.
 *   ZH  natural Simplified Chinese B2B wording; English acronyms (ERP, LINE,
 *       NAS) kept where they are what a reader recognises.
 * ============================================================================
 */

/* ------------------------------------------------------------ navigation -- */

export const nav = {
  home: { th: 'หน้าแรก', en: 'Home', zh: '首页' },
  services: { th: 'บริการของเรา', en: 'Services', zh: '服务' },
  solutions: { th: 'ระบบของเรา', en: 'Solutions', zh: '系统方案' },
  work: { th: 'ผลงาน', en: 'Work', zh: '案例' },
  about: { th: 'เกี่ยวกับเรา', en: 'About', zh: '关于我们' },
  insights: { th: 'บทความ', en: 'Insights', zh: '观点' },
  contact: { th: 'ติดต่อเรา', en: 'Contact', zh: '联系我们' }
} satisfies Record<string, LocalizedText>;

/* ------------------------------------------------------------------- CTA -- */

/** Recurring actions. Reuse these rather than re-translating a label. */
export const cta = {
  /** EP42: THE primary action, site-wide. Always leads to /contact. */
  discussProject: { th: 'คุยเรื่องโปรเจกต์', en: 'Discuss a project', zh: '咨询项目' },
  viewWork: { th: 'ดูผลงานของเรา', en: 'View our work', zh: '查看案例' },
  viewAllWork: { th: 'ดูผลงานทั้งหมด', en: 'View all work', zh: '查看全部案例' },
  viewAllServices: { th: 'ดูบริการทั้งหมด', en: 'View all services', zh: '查看全部服务' },
  clientLogin: { th: 'เข้าสู่ระบบลูกค้า', en: 'Client login', zh: '客户登录' },
  contactUs: { th: 'ติดต่อเรา', en: 'Contact us', zh: '联系我们' },
  seeRelatedWork: { th: 'ดูผลงานที่เกี่ยวข้อง', en: 'See related work', zh: '查看相关案例' },
  viewCaseStudy: { th: 'ดูกรณีศึกษา', en: 'View case study', zh: '查看案例详情' },
  visitWebsite: { th: 'เยี่ยมชมเว็บไซต์', en: 'Visit website', zh: '访问网站' },
  back: { th: 'ย้อนกลับ', en: 'Back', zh: '返回' },
  nextCase: { th: 'ผลงานถัดไป', en: 'Next case', zh: '下一个案例' },
  learnMore: { th: 'ดูรายละเอียด', en: 'Learn more', zh: '了解更多' },
  backHome: { th: 'กลับหน้าแรก', en: 'Back to home', zh: '返回首页' }
} satisfies Record<string, LocalizedText>;

/* ----------------------------------------------------------------- theme -- */

export const themeLabel: Record<ThemeMode, LocalizedText> = {
  light: { th: 'สว่าง', en: 'Light', zh: '浅色' },
  dark: { th: 'มืด', en: 'Dark', zh: '深色' },
  system: { th: 'ตามระบบ', en: 'System', zh: '跟随系统' }
};

export const theme = {
  group: { th: 'ธีมของเว็บไซต์', en: 'Site theme', zh: '网站主题' },
  /** "System — currently dark". The resolved label is appended. */
  systemNow: { th: 'ตามระบบ — ขณะนี้', en: 'System — currently ', zh: '跟随系统 — 当前为' }
} satisfies Record<string, LocalizedText>;

/* ---------------------------------------------------------------- header -- */

export const header = {
  skipToContent: { th: 'ข้ามไปที่เนื้อหา', en: 'Skip to content', zh: '跳至正文' },
  homeLink: { th: 'PDA BLISS — หน้าแรก', en: 'PDA BLISS — Home', zh: 'PDA BLISS — 首页' },
  mainNav: { th: 'เมนูหลัก', en: 'Main navigation', zh: '主导航' },
  mobileNav: { th: 'เมนูมือถือ', en: 'Mobile navigation', zh: '移动端导航' },
  openMenu: { th: 'เปิดเมนู', en: 'Open menu', zh: '打开菜单' },
  closeMenu: { th: 'ปิดเมนู', en: 'Close menu', zh: '关闭菜单' },
  language: { th: 'ภาษา', en: 'Language', zh: '语言' }
} satisfies Record<string, LocalizedText>;

/* ---------------------------------------------------------------- footer -- */

export const footer = {
  blurb: {
    th: 'พัฒนาซอฟต์แวร์และระบบธุรกิจที่ออกแบบจากกระบวนการทำงานจริง',
    en: 'Software and business systems designed around how your team actually works.',
    zh: '根据真实业务流程设计的软件与企业系统。'
  },
  menuHeading: { th: 'เมนูหลัก', en: 'Menu', zh: '菜单' },
  servicesHeading: { th: 'บริการของเรา', en: 'Services', zh: '服务' },
  contactHeading: { th: 'ติดต่อเรา', en: 'Contact', zh: '联系方式' },
  legalNav: { th: 'นโยบายและข้อกำหนด', en: 'Policies and terms', zh: '政策与条款' },
  privacy: { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy policy', zh: '隐私政策' },
  cookies: { th: 'นโยบายคุกกี้', en: 'Cookie policy', zh: 'Cookie 政策' },
  terms: { th: 'เงื่อนไขการใช้งาน', en: 'Terms of use', zh: '使用条款' }
} satisfies Record<string, LocalizedText | LocalizedList>;

/**
 * Footer service links, in selling order, anchored to the eight canonical
 * service ids on /services. Labels mirror the service titles.
 */
export const footerServiceLinks: readonly { id: string; label: LocalizedText }[] = [
  { id: 'business-systems', label: { th: 'ระบบ ERP / บริหารธุรกิจ', en: 'ERP / Business management', zh: 'ERP / 企业管理系统' } },
  { id: 'payroll', label: { th: 'ระบบ Payroll / เงินเดือน', en: 'Payroll system', zh: 'Payroll 薪资系统' } },
  { id: 'hr-line-bot', label: { th: 'ระบบ HR ผ่าน LINE', en: 'HR on LINE', zh: '基于 LINE 的 HR 系统' } },
  { id: 'document-management', label: { th: 'ระบบเอกสารและการอนุมัติ', en: 'Documents & approvals', zh: '文档与审批系统' } },
  { id: 'file-management', label: { th: 'ระบบจัดเก็บไฟล์กลาง (NAS)', en: 'Central file storage (NAS)', zh: '集中文件存储（NAS）' } },
  { id: 'web-applications', label: { th: 'เว็บแอปพลิเคชัน', en: 'Web applications', zh: 'Web 应用' } },
  { id: 'mobile-applications', label: { th: 'แอปพลิเคชันมือถือ', en: 'Mobile applications', zh: '移动应用' } },
  { id: 'websites', label: { th: 'เว็บไซต์องค์กรและธุรกิจ', en: 'Corporate websites', zh: '企业与商业网站' } }
];

/* --------------------------------------------------------- contact dock -- */

export const dock = {
  open: { th: 'เปิดช่องทางติดต่อ', en: 'Open contact options', zh: '打开联系方式' },
  close: { th: 'ปิดช่องทางติดต่อ', en: 'Close contact options', zh: '关闭联系方式' },
  closeShort: { th: 'ปิด', en: 'Close', zh: '关闭' },
  dialog: { th: 'ช่องทางติดต่อ PDA BLISS', en: 'Contact PDA BLISS', zh: '联系 PDA BLISS' },
  title: { th: 'ติดต่อ PDA BLISS', en: 'Contact PDA BLISS', zh: '联系 PDA BLISS' },
  button: { th: 'ติดต่อเรา', en: 'Contact', zh: '联系我们' },
  callEyebrow: { th: 'โทรหาเรา', en: 'Call us', zh: '致电我们' },
  lineEyebrow: { th: 'LINE OA', en: 'LINE OA', zh: 'LINE 官方账号' },
  mailEyebrow: { th: 'ส่งอีเมล', en: 'Email us', zh: '发送邮件' },
  /** The form, not a booking: PDA BLISS has no booking system. */
  formEyebrow: { th: 'ส่งรายละเอียดผ่านแบบฟอร์ม', en: 'Send details through the form', zh: '通过表单发送详情' },
  channels: { th: 'ติดต่อโดยตรง', en: 'Contact directly', zh: '直接联系' }
} satisfies Record<string, LocalizedText>;

/** Short channel hints used beside contact details. */
export const channel = {
  phone: { th: 'โทร', en: 'Phone', zh: '电话' },
  email: { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  line: { th: 'LINE OA', en: 'LINE OA', zh: 'LINE 官方账号' }
} satisfies Record<string, LocalizedText>;

/* ---------------------------------------------------------------- BigCTA -- */

export const bigCta = {
  lines: {
    th: ['มีไอเดียอยู่แล้ว?', 'มาทำให้มัน', 'ใช้งานได้จริงกัน'],
    en: ['Already have an idea?', "Let's make it", 'work for real.'],
    zh: ['已经有想法了？', '一起把它', '变成可用的系统。']
  },
  lead: { th: 'คุยกับเราก่อนได้', en: 'Start with a conversation', zh: '先和我们聊聊' },
  body: {
    th: 'เราช่วยประเมินแนวทางและขอบเขตงานก่อนเริ่มโปรเจกต์ ถ้าเราไม่ใช่ทีมที่เหมาะกับงานนี้ เราจะบอกคุณตั้งแต่ต้น',
    en: "We help you assess the approach and scope before a project begins. If we are not the right team for the job, we will tell you at the start.",
    zh: '项目开始前，我们会协助您评估方案和工作范围。如果我们不是合适的团队，会在一开始就坦诚告知。'
  }
} satisfies Record<string, LocalizedText | LocalizedList>;

/* ---------------------------------------------------------------- cookie -- */

export const cookie = {
  region: { th: 'การตั้งค่าคุกกี้', en: 'Cookie settings', zh: 'Cookie 设置' },
  title: {
    th: 'เราใช้คุกกี้เพื่อให้เว็บไซต์ทำงานได้ดีขึ้น',
    en: 'We use cookies to help this site work well',
    zh: '我们使用 Cookie 让网站更好地运行'
  },
  body: {
    th: 'เราใช้คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ และคุกกี้เพิ่มเติมเมื่อคุณอนุญาต เพื่อช่วยปรับปรุงประสบการณ์การใช้งาน',
    en: 'We use cookies that the site needs to work, and additional cookies only if you allow them, to help improve your experience.',
    zh: '我们使用网站运行所必需的 Cookie；只有在您允许时，才会使用其他 Cookie 来改善使用体验。'
  },
  acceptAll: { th: 'ยอมรับทั้งหมด', en: 'Accept all', zh: '全部接受' },
  necessaryOnly: { th: 'เฉพาะที่จำเป็น', en: 'Necessary only', zh: '仅必要 Cookie' },
  settings: { th: 'ตั้งค่าคุกกี้', en: 'Cookie settings', zh: 'Cookie 设置' },
  policy: { th: 'นโยบายคุกกี้', en: 'Cookie policy', zh: 'Cookie 政策' },
  settingsTitle: { th: 'ตั้งค่าคุกกี้', en: 'Cookie settings', zh: 'Cookie 设置' },
  closeSettings: { th: 'ปิดการตั้งค่าคุกกี้', en: 'Close cookie settings', zh: '关闭 Cookie 设置' },
  essentialTitle: { th: 'คุกกี้ที่จำเป็น', en: 'Necessary cookies', zh: '必要 Cookie' },
  essentialBody: {
    th: 'ใช้สำหรับจดจำความยินยอมและการทำงานพื้นฐานของเว็บไซต์',
    en: 'Used to remember your consent and to keep the basic functions of the site working.',
    zh: '用于记录您的同意选择，并保证网站基本功能正常运行。'
  },
  analyticsTitle: { th: 'คุกกี้วิเคราะห์', en: 'Analytics cookies', zh: '分析类 Cookie' },
  analyticsBody: {
    th: 'ยังไม่มีระบบวิเคราะห์ติดตั้ง การอนุญาตนี้เก็บไว้สำหรับการเชื่อมต่อในอนาคต',
    en: 'No analytics tool is installed yet. This permission is kept for a future connection.',
    zh: '目前尚未安装任何分析工具。此项授权仅为将来接入而保留。'
  },
  preferencesTitle: { th: 'คุกกี้การตั้งค่า', en: 'Preference cookies', zh: '偏好设置 Cookie' },
  preferencesBody: {
    th: 'อนุญาตให้เว็บไซต์จดจำการตั้งค่าที่ไม่จำเป็นในอนาคต',
    en: 'Allows the site to remember non-essential settings in the future.',
    zh: '允许网站在将来记住非必要的设置。'
  },
  cancel: { th: 'ยกเลิก', en: 'Cancel', zh: '取消' },
  save: { th: 'บันทึกการตั้งค่า', en: 'Save settings', zh: '保存设置' }
} satisfies Record<string, LocalizedText>;

/* --------------------------------------------------------------- general -- */

export const ui = {
  loading: { th: 'กำลังโหลด', en: 'Loading', zh: '加载中' },
  backToTop: { th: 'กลับด้านบน', en: 'Back to top', zh: '返回顶部' },
  /** The label inside the custom cursor over project cards. */
  viewProject: { th: 'ดูโปรเจกต์', en: 'View project', zh: '查看项目' },
  opensInNewTab: { th: '(เปิดในแท็บใหม่)', en: '(opens in a new tab)', zh: '（在新标签页中打开）' },
  errorTitle: { th: 'หน้านี้มีปัญหาชั่วคราว', en: 'This page is having a temporary problem', zh: '此页面暂时出现问题' },
  errorBody: {
    th: 'ลองโหลดหน้านี้ใหม่อีกครั้ง หากยังไม่ได้ กรุณาติดต่อเราโดยตรง',
    en: 'Please try reloading the page. If that does not help, contact us directly.',
    zh: '请尝试重新加载页面。如果仍无法打开，请直接与我们联系。'
  },
  reload: { th: 'โหลดใหม่', en: 'Reload', zh: '重新加载' },
  notFoundTitle: { th: 'ไม่พบหน้านี้', en: 'This page does not exist.', zh: '找不到此页面。' },
  notFoundBody: {
    th: 'ลิงก์อาจไม่เป็นปัจจุบันแล้ว หรือหน้านี้อาจถูกย้ายไปที่อื่น',
    en: 'The link may be out of date, or the page may have moved.',
    zh: '链接可能已经过期，或者页面已被移动。'
  }
} satisfies Record<string, LocalizedText>;
