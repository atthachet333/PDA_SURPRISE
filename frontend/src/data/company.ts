/**
 * ============================================================================
 * PDA BLISS COMPANY LIMITED — single source of truth for business data
 * ============================================================================
 * Contact details, navigation, CTAs and footer content all live here. No
 * component should contain a literal phone number, email address or LINE id.
 * ============================================================================
 */

export interface SocialLink {
  label: string;
  href: string;
  icon: 'facebook' | 'line' | 'youtube' | 'linkedin';
}

export const company = {
  companyName: 'PDA BLISS',
  legalName: 'PDA BLISS COMPANY LIMITED',
  legalNameTh: 'บริษัท พีดีเอ บลิส จำกัด',

  tagline: 'เปลี่ยนไอเดียของคุณให้กลายเป็นซอฟต์แวร์ที่ใช้งานได้จริง',
  description:
    'รับพัฒนาซอฟต์แวร์ ระบบธุรกิจ เว็บแอปพลิเคชัน ระบบภายในองค์กร และ Automation ที่ออกแบบจากกระบวนการทำงานจริงของธุรกิจ',
  footerBlurb:
    'พัฒนาซอฟต์แวร์และระบบธุรกิจที่ออกแบบจากการทำงานจริง เพื่อให้เทคโนโลยีช่วยธุรกิจได้จริง',

  founded: 2020,

  // --- contact -------------------------------------------------------------
  phone: '0638693614',
  /** Pretty form for display only. */
  phoneDisplay: '063 869 3614',
  email: 'pdablissoffice@gmail.com',
  lineOA: '@pdabliss',
  /** Replace with the real LINE OA link when it is issued. */
  lineUrl: 'https://line.me/R/ti/p/@pdabliss',

  /** OWNER INPUT REQUIRED: set a full registered address to show it publicly. */
  address: '',
  addressNote: 'ประเทศไทย',

  businessHours: {
    days: 'จันทร์ – ศุกร์',
    time: '09:00 – 18:00 น.',
    note: 'ตอบกลับภายใน 1 วันทำการ'
  },

  /** Only rendered when `href` is a real URL. */
  socials: [
    { label: 'Facebook', href: '', icon: 'facebook' },
    { label: 'LINE', href: 'https://line.me/R/ti/p/@pdabliss', icon: 'line' },
    { label: 'YouTube', href: '', icon: 'youtube' },
    { label: 'LinkedIn', href: '', icon: 'linkedin' }
  ] as SocialLink[]
} as const;

/** Only socials with a real URL are rendered anywhere. */
export const activeSocials = company.socials.filter((social) => social.href.length > 0);

// --- navigation ------------------------------------------------------------

export const navigation = [
  { label: 'หน้าแรก', to: '/' },
  { label: 'บริการของเรา', to: '/services' },
  { label: 'โซลูชัน', to: '/solutions' },
  { label: 'ผลงาน', to: '/work' },
  { label: 'เกี่ยวกับเรา', to: '/about' },
  { label: 'บทความ', to: '/insights' },
  { label: 'ติดต่อเรา', to: '/contact' }
] as const;

export const cta = {
  primary: { label: 'เริ่มโปรเจกต์', to: '/contact' },
  secondary: { label: 'ดูผลงานของเรา', to: '/work' },
  login: { label: 'เข้าสู่ระบบลูกค้า', to: '/login' },
  talk: { label: 'พูดคุยกับเรา', to: '/contact' },
  consult: { label: 'ปรึกษาโปรเจกต์นี้', to: '/contact' }
} as const;

// --- hero trust strip ------------------------------------------------------

/**
 * ─── OWNER INPUT REQUIRED ────────────────────────────────────────────────────
 * Numeric metrics are NOT published while `metricsVerified` is false. The hero
 * strip shows the qualitative capability markers below instead, so the site
 * never presents invented numbers as fact. Fill in figures you can
 * substantiate, then flip the flag.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const metricsVerified = false;

export const metrics = [
  { value: 0, suffix: '+', label: 'โปรเจกต์ที่ส่งมอบ', detail: 'ครอบคลุม ERP ระบบปฏิบัติการ และระบบสำหรับลูกค้า' },
  { value: 0, suffix: '%', label: 'ความพึงพอใจของลูกค้า', detail: 'วัดจากการรีวิวหลังส่งมอบและการต่อสัญญา' },
  { value: 0, suffix: '+', label: 'โมดูลที่นำกลับมาใช้ได้', detail: 'ทำให้ระบบใหม่เริ่มต้นได้เร็วขึ้น' },
  { value: 0, suffix: '+', label: 'ปีที่ดูแลระบบจริง', detail: 'ทั้งพัฒนาและดูแลระบบใน Production' }
] as const;

/** Shown in place of metrics until real figures exist. */
export const capabilityMarkers = [
  {
    icon: 'compass',
    label: 'ออกแบบตามธุรกิจจริง',
    detail: 'เริ่มจากการเข้าใจขั้นตอนการทำงานของคุณ ไม่ใช่จากฟีเจอร์สำเร็จรูป'
  },
  {
    icon: 'cloud',
    label: 'รองรับการขยายระบบ',
    detail: 'วางโครงสร้างให้เพิ่มผู้ใช้ สาขา และโมดูลใหม่ได้โดยไม่ต้องรื้อ'
  },
  {
    icon: 'integration',
    label: 'เชื่อมต่อระบบเดิมได้',
    detail: 'ทำงานร่วมกับบัญชี คลังสินค้า LINE และระบบที่คุณใช้อยู่แล้ว'
  },
  {
    icon: 'support',
    label: 'ดูแลและพัฒนาต่อเนื่อง',
    detail: 'มีทีมที่รู้จักระบบของคุณ พร้อมแก้ไขและต่อยอดหลังส่งมอบ'
  }
] as const;

// --- technology ------------------------------------------------------------

export const techStack = [
  {
    group: 'Frontend',
    groupTh: 'ส่วนหน้า',
    items: [
      { name: 'React', note: 'UI ที่ยืดหยุ่นและดูแลต่อได้' },
      { name: 'Next.js', note: 'เรนเดอร์ฝั่งเซิร์ฟเวอร์เพื่อ SEO และความเร็ว' },
      { name: 'TypeScript', note: 'ตรวจจับข้อผิดพลาดตั้งแต่ตอนเขียนโค้ด' }
    ]
  },
  {
    group: 'Backend',
    groupTh: 'ส่วนหลังบ้าน',
    items: [
      { name: 'Node.js', note: 'รันบริการฝั่งเซิร์ฟเวอร์ด้วยภาษาเดียวกับหน้าเว็บ' },
      { name: 'Fastify', note: 'API ที่เบาและเร็ว พร้อม Validation ในตัว' }
    ]
  },
  {
    group: 'Data',
    groupTh: 'ฐานข้อมูล',
    items: [
      { name: 'PostgreSQL', note: 'ธุรกรรมที่เชื่อถือได้สำหรับงานการเงินและสต็อก' },
      { name: 'MariaDB', note: 'รองรับระบบเดิมที่ใช้ MySQL อยู่แล้ว' }
    ]
  },
  {
    group: 'Infrastructure',
    groupTh: 'โครงสร้างพื้นฐาน',
    items: [
      { name: 'Cloudflare', note: 'CDN และการป้องกันระดับขอบเครือข่าย' },
      { name: 'Docker', note: 'สภาพแวดล้อมเดียวกันตั้งแต่เครื่องพัฒนาถึง Production' }
    ]
  }
] as const;

// --- process ---------------------------------------------------------------

export const process = [
  {
    step: '01',
    title: 'ทำความเข้าใจธุรกิจ',
    body: 'คุยกับคนที่ทำงานจริง ดูเอกสารจริง และเข้าใจว่าเวลาหายไปกับขั้นตอนไหน ก่อนจะพูดถึงเทคโนโลยี'
  },
  {
    step: '02',
    title: 'วิเคราะห์ Workflow',
    body: 'เขียนขั้นตอนการทำงานปัจจุบันออกมาเป็นแผนภาพ ระบุจุดที่ซ้ำซ้อน จุดที่ข้อมูลตกหล่น และจุดที่ต้องรออนุมัติ'
  },
  {
    step: '03',
    title: 'ออกแบบระบบ',
    body: 'กำหนดโครงสร้างข้อมูล สิทธิ์การใช้งาน การเชื่อมต่อ และกรณีข้อยกเว้น พร้อมขอบเขตงานและราคาที่ชัดเจน'
  },
  {
    step: '04',
    title: 'พัฒนาและทดสอบ',
    body: 'ส่งงานที่ใช้ได้จริงทุก 2 สัปดาห์บนระบบทดสอบ ให้ทีมคุณลองใช้และให้ความเห็นก่อนรอบถัดไป'
  },
  {
    step: '05',
    title: 'ส่งมอบและอบรม',
    body: 'ติดตั้งระบบจริง ย้ายข้อมูล อบรมผู้ใช้งาน และส่งมอบซอร์สโค้ดพร้อมเอกสารทั้งหมดให้คุณ'
  },
  {
    step: '06',
    title: 'ดูแลและพัฒนาต่อ',
    body: 'มีผู้รับผิดชอบที่ระบุชื่อได้ ระยะเวลาตอบกลับที่ตกลงกันไว้ และงบพัฒนาต่อเนื่องตามการเติบโตของธุรกิจ'
  }
] as const;

// --- footer ----------------------------------------------------------------

export const footer = {
  menuHeading: 'เมนูหลัก',
  servicesHeading: 'บริการของเรา',
  contactHeading: 'ติดต่อ',
  servicesLinks: [
    { label: 'พัฒนาซอฟต์แวร์', to: '/services#custom-software' },
    { label: 'ระบบธุรกิจ / ERP', to: '/services#business-systems' },
    { label: 'เว็บแอปพลิเคชัน', to: '/services#web-applications' },
    { label: 'Automation', to: '/services#automation' },
    { label: 'ระบบภายในองค์กร', to: '/solutions' },
    { label: 'ที่ปรึกษาด้านไอที', to: '/services#consulting' }
  ],
  legalLinks: [
    { label: 'นโยบายความเป็นส่วนตัว', to: '/privacy' },
    { label: 'เงื่อนไขการใช้งาน', to: '/terms' },
    { label: 'Sitemap', to: '/sitemap' }
  ]
} as const;

// --- shared CTA copy -------------------------------------------------------

export const ctaSection = {
  eyebrow: 'READY WHEN YOU ARE',
  title: ['พร้อมเปลี่ยนไอเดีย', 'ให้เป็นระบบที่ใช้งานได้จริงหรือยัง?'],
  body: 'คุยกันสั้น ๆ เพื่อประเมินขอบเขตงานและงบประมาณอย่างตรงไปตรงมา ถ้าเราไม่ใช่ทีมที่เหมาะกับงานนี้ เราจะบอกคุณตั้งแต่ต้น'
} as const;

export const capabilities = [
  {
    title: 'ซอร์สโค้ดเป็นของคุณ',
    body: 'ทุก Repository, Pipeline และ Credential ถูกส่งมอบให้คุณเมื่อจบงาน ไม่มีเงื่อนไขผูกมัด'
  },
  {
    title: 'มีเอกสารประกอบระบบ',
    body: 'บันทึกการตัดสินใจ โครงสร้างข้อมูล และคู่มือการดูแล อยู่คู่กับโค้ด ไม่ใช่อยู่ในหัวใครคนเดียว'
  },
  {
    title: 'ตรวจสอบระบบได้ตลอด',
    body: 'Health check, Log ที่อ่านได้ และการแจ้งเตือน ตั้งแต่วันแรก ไม่ใช่หลังเกิดปัญหาครั้งแรก'
  },
  {
    title: 'ผ่านการตรวจความปลอดภัย',
    body: 'ตรวจสอบข้อมูลนำเข้า จำกัดสิทธิ์เท่าที่จำเป็น เข้ารหัสการรับส่ง และตรวจสอบ Dependency ทุกรอบที่ปล่อย'
  }
] as const;
