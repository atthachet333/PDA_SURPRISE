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

  /**
   * ─── OWNER INPUT REQUIRED ──────────────────────────────────────────────────
   * No registration year has been supplied, so none is published. The hero
   * badge falls back to `heroBadge` while `foundedVerified` is false. Set the
   * real year and flip the flag to show "SINCE <year>".
   * ──────────────────────────────────────────────────────────────────────────
   */
  foundedVerified: false,
  founded: null as number | null,
  heroBadge: 'CUSTOM SOFTWARE',


  // --- contact -------------------------------------------------------------
  phone: '0638693614',
  /** Pretty form for display only. */
  phoneDisplay: '063 869 3614',
  email: 'pdablissoffice@gmail.com',
  lineOA: '@593oiwec',
  /** Replace with the real LINE OA link when it is issued. */
  lineUrl: 'https://line.me/R/ti/p/@593oiwec',
  /** Add a verified Google Maps or other map URL here to make the address actionable. */
  mapUrl: '',

  /** Registered address — the only place it is defined. */
  address: {
    lines: [
      '14/14 ซอยกรุงเทพ-นนท์ 21',
      'ถนนกรุงเทพ-นนท์',
      'แขวงบางซื่อ เขตบางซื่อ',
      'กรุงเทพมหานคร 10800'
    ],
    district: 'บางซื่อ',
    province: 'กรุงเทพมหานคร',
    postalCode: '10800',
    country: 'ประเทศไทย'
  },
  /** One-line form for tight spaces (footer, meta tags, structured data). */
  addressOneLine:
    '14/14 ซอยกรุงเทพ-นนท์ 21 ถนนกรุงเทพ-นนท์ แขวงบางซื่อ เขตบางซื่อ กรุงเทพมหานคร 10800',
  addressNote: 'กรุงเทพมหานคร ประเทศไทย',

  businessHours: {
    days: 'จันทร์ – เสาร์',
    time: '08:30 – 17:30 น.',
    note: 'ตอบกลับภายใน 1 วันทำการ'
  },

  /** Only rendered when `href` is a real URL. */
  socials: [
    { label: 'Facebook', href: '', icon: 'facebook' },
    { label: 'LINE', href: 'https://line.me/R/ti/p/@593oiwec', icon: 'line' },
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
  { label: 'ระบบของเรา', to: '/solutions' },
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
 * ─── VERIFIED NUMBERS ────────────────────────────────────────────────────────
 * `metrics` holds ONLY figures the owner has confirmed. Everything that cannot
 * be substantiated — client counts, satisfaction percentages, years of
 * experience, revenue impact — is deliberately absent rather than estimated.
 *
 * `metricsVerified` gated these figures during the content lock only because
 * the old homepage strip was a four-column grid that two numbers could not
 * fill. The redesign replaced it with `VerifiedMetrics`, a section designed
 * around exactly two figures, so the layout reason is gone and the flag is now
 * true. The VALUES are unchanged and still owner-supplied.
 *
 * Setting this back to false is still safe: VerifiedMetrics then renders the
 * qualitative `capabilityMarkers` alone and publishes no figure at all.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const metricsVerified = true;

export const metrics = [
  {
    value: 6,
    suffix: '',
    label: 'ระบบซอฟต์แวร์',
    detail: 'ระบบธุรกิจที่พัฒนาและส่งมอบแล้ว'
  },
  {
    value: 4,
    suffix: '',
    label: 'เว็บไซต์',
    detail: 'เว็บไซต์องค์กรและธุรกิจที่เปิดใช้งานแล้ว'
  }
] as const;

/**
 * Figures that must NOT be published until the owner supplies real data.
 * Listed here so nobody re-invents them in a component later.
 */
export const unverifiedMetricKeys = [
  'จำนวนลูกค้า',
  'เปอร์เซ็นต์ความพึงพอใจ',
  'จำนวนปีที่ดำเนินกิจการ',
  'ผลกระทบต่อรายได้ของลูกค้า'
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
    title: 'พัฒนา',
    body: 'ส่งงานที่ใช้ได้จริงทุก 2 สัปดาห์บนระบบทดสอบ ให้ทีมคุณลองใช้และให้ความเห็นก่อนรอบถัดไป'
  },
  {
    step: '05',
    title: 'ทดสอบ',
    body: 'ทดสอบกฎทางธุรกิจ ตัวเลขเงิน และสิทธิ์การเข้าถึงด้วยชุดทดสอบอัตโนมัติ พร้อมให้ผู้ใช้จริงลองใช้ก่อนเปิดระบบ'
  },
  {
    step: '06',
    title: 'ส่งมอบ',
    body: 'ติดตั้งระบบจริง ย้ายข้อมูล อบรมผู้ใช้งาน และส่งมอบซอร์สโค้ดพร้อมเอกสารทั้งหมดให้คุณ'
  },
  {
    step: '07',
    title: 'ดูแลต่อ',
    body: 'มีผู้รับผิดชอบที่ระบุชื่อได้ ระยะเวลาตอบกลับที่ตกลงกันไว้ และงบพัฒนาต่อเนื่องตามการเติบโตของธุรกิจ'
  }
] as const;

// --- footer ----------------------------------------------------------------

export const footer = {
  menuHeading: 'เมนูหลัก',
  servicesHeading: 'บริการของเรา',
  contactHeading: 'ติดต่อเรา',
  /** Mirrors the seven primary services in data/services.ts. */
  servicesLinks: [
    { label: 'ระบบ ERP / บริหารธุรกิจ', to: '/services#business-systems' },
    { label: 'ระบบ Payroll / เงินเดือน', to: '/services#payroll' },
    { label: 'เว็บไซต์องค์กรและธุรกิจ', to: '/services#websites' },
    { label: 'เว็บแอปพลิเคชัน', to: '/services#web-applications' },
    { label: 'แอปพลิเคชันมือถือ', to: '/services#mobile-applications' },
    { label: 'ระบบ HR ผ่าน LINE', to: '/services#hr-line-bot' },
    { label: 'ระบบจัดเก็บเอกสารและไฟล์', to: '/services#document-management' }
  ],
  legalLinks: [
    { label: 'นโยบายความเป็นส่วนตัว', to: '/privacy' },
    { label: 'นโยบายคุกกี้', to: '/cookie-policy' },
    { label: 'เงื่อนไขการใช้งาน', to: '/terms' },
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

// --- target customers ------------------------------------------------------

/**
 * Positioning. The market is intentionally broad, but the copy never says
 * "everyone" — it says what kind of need we are the right fit for. Edit the
 * groups freely; nothing else in the codebase hardcodes them.
 */
export const targetMarket = {
  eyebrow: 'WHO WE WORK WITH',
  headline: ['เหมาะสำหรับธุรกิจทุกขนาด', 'ที่ต้องการพัฒนาระบบเฉพาะตาม Workflow จริงขององค์กร'],
  lead: 'เราไม่ได้เลือกลูกค้าจากขนาดหรืออุตสาหกรรม แต่เลือกจากโจทย์ ถ้าธุรกิจของคุณมีขั้นตอนการทำงานที่เป็นของตัวเอง และโปรแกรมสำเร็จรูปเริ่มบังคับให้คุณทำงานย้อนศร นั่นคือจุดที่เราช่วยได้',
  groups: [
    { label: 'SME', note: 'ธุรกิจที่โตเร็วกว่าระบบที่มีอยู่' },
    { label: 'สำนักงานบัญชี', note: 'งานเอกสารและงานปิดงบที่ต้องแม่นยำและตรวจย้อนได้' },
    { label: 'โรงงาน', note: 'การผลิต คลังสินค้า ต้นทุน และการตรวจสอบย้อนกลับ' },
    { label: 'ธุรกิจบริการ', note: 'คิว ตารางงาน และทีมงานที่กระจายหลายจุด' },
    { label: 'ธุรกิจค้าปลีก', note: 'สต็อกหลายช่องทางที่ต้องตรงกันตลอดเวลา' },
    { label: 'บริษัทที่มีระบบภายใน', note: 'ระบบเดิมที่ต้องต่อยอดหรือเชื่อมเข้าด้วยกัน' },
    { label: 'ธุรกิจที่ใช้ Spreadsheet จำนวนมาก', note: 'ไฟล์ที่กระจายกันจนไม่มีใครรู้ว่าไฟล์ไหนคือฉบับจริง' },
    { label: 'องค์กรที่ต้องการ Automation', note: 'งานซ้ำตามรอบที่กินเวลาทั้งแผนกทุกเดือน' }
  ]
} as const;

// --- strengths -------------------------------------------------------------

/**
 * Written from the owner's own list, phrased as commitments we can stand
 * behind. Absolute claims ("ไม่มีข้อผิดพลาด", "ดีที่สุด", "เร็วที่สุด") are
 * avoided on purpose — they are not verifiable and they read as advertising.
 */
export const strengths = [
  {
    icon: 'automation',
    title: 'พัฒนาอย่างรวดเร็ว',
    body: 'ทีมเล็กและตัดสินใจได้เอง ทำให้ไม่ต้องรอผ่านหลายชั้นก่อนเริ่มงาน คุณเห็นระบบที่กดใช้ได้จริงตั้งแต่รอบแรก ๆ'
  },
  {
    icon: 'compass',
    title: 'ราคาเหมาะสมกับขอบเขตงาน',
    body: 'เสนอราคาตามขอบเขตที่ตกลงกันชัดเจน ไม่มีค่าใช้จ่ายที่โผล่มากลางทาง และบอกตรง ๆ ถ้าฟีเจอร์ไหนยังไม่คุ้มที่จะทำตอนนี้'
  },
  {
    icon: 'support',
    title: 'ส่งมอบตามแผน',
    body: 'แบ่งงานเป็นรอบสั้น ๆ พร้อมกำหนดส่งที่ตกลงไว้ล่วงหน้า ถ้ามีอะไรกระทบกำหนดการ คุณจะรู้ก่อน ไม่ใช่รู้ตอนถึงวันส่ง'
  },
  {
    icon: 'analytics',
    title: 'ใส่ใจคุณภาพและลดข้อผิดพลาด',
    body: 'ตรวจสอบกฎทางธุรกิจ ตัวเลขเงิน และสิทธิ์การเข้าถึงด้วยการทดสอบอัตโนมัติ เพื่อให้ข้อผิดพลาดถูกเจอก่อนถึงมือผู้ใช้'
  },
  {
    icon: 'code',
    title: 'ดูแลโดยทีมงานที่มีประสบการณ์',
    body: 'คนที่คุยขอบเขตงานกับคุณคือคนเดียวกับที่เขียนโค้ดและดูแลระบบต่อ ไม่มีการส่งต่อให้ทีมที่ไม่เคยเห็นงานนี้'
  }
] as const;
