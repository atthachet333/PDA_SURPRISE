export type IconName =
  | 'code'
  | 'browser'
  | 'building'
  | 'mobile'
  | 'automation'
  | 'integration'
  | 'analytics'
  | 'cloud'
  | 'support'
  | 'compass';

/** Drives the animated preview shown beside the selected service. */
export type ServicePreview = 'dashboard' | 'table' | 'flow' | 'mobile' | 'chart' | 'nodes';

export interface Service {
  id: string;
  /** English eyebrow, used as a small label only. */
  eyebrow: string;
  /** Thai-first label — this is the headline shown to visitors. */
  title: string;
  /** Technical English name, rendered as a small secondary label under the title. */
  nameEn: string;
  summary: string;
  detail: string;
  deliverables: string[];
  tech: string[];
  icon: IconName;
  preview: ServicePreview;
  /**
   * The seven services the owner sells as the core catalogue. Everything else
   * is a supporting capability that usually ships as part of one of these.
   */
  primary?: boolean;
}

/**
 * ── SERVICE CATALOGUE ───────────────────────────────────────────────────────
 * The first seven entries are the owner's real primary catalogue, in the order
 * they are sold. Each leads with a Thai label (`title`); the technical English
 * name lives in `nameEn` and is rendered as a small secondary label.
 *
 * The remaining entries are supporting capabilities — genuine work, but they
 * usually ship as part of one of the seven above rather than being bought on
 * their own.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const services: Service[] = [
  {
    id: 'business-systems',
    eyebrow: 'ERP',
    title: 'ระบบ ERP / บริหารธุรกิจ',
    nameEn: 'ERP',
    primary: true,
    summary: 'รวมบัญชี คลังสินค้า จัดซื้อ และงานปฏิบัติการไว้ในระบบเดียวที่ตรวจสอบย้อนกลับได้',
    detail:
      'แทนที่ไฟล์ Excel ที่กระจายกันหลายสิบไฟล์ ด้วยข้อมูลชุดเดียวที่ทุกฝ่ายเห็นตรงกัน ทุกเอกสารมีเลขที่อ้างอิง มีสายอนุมัติ และมีประวัติการแก้ไขที่ตรวจสอบได้จริงตอนปิดงบ',
    deliverables: ['ออกแบบโมดูลตามฝ่ายงาน', 'ย้ายข้อมูลจากระบบเดิม', 'กำหนดสิทธิ์ตามบทบาท', 'รายงานและการตรวจสอบย้อนหลัง'],
    tech: ['PostgreSQL', 'Node.js', 'React', 'Docker'],
    icon: 'building',
    preview: 'table'
  },
  {
    id: 'payroll',
    eyebrow: 'PAYROLL',
    title: 'ระบบ Payroll / เงินเดือน',
    nameEn: 'Payroll',
    primary: true,
    summary: 'คิดเงินเดือน เวลาทำงาน กะ และค่าล่วงเวลา ให้จบในระบบเดียวโดยไม่ต้องลุ้นไฟล์ Excel ทุกสิ้นเดือน',
    detail:
      'เก็บรูปแบบกะ ช่วงค่าล่วงเวลา และเงื่อนไขการหักต่าง ๆ ไว้เป็นข้อมูลที่ฝ่ายบุคคลแก้ได้เอง ไม่ใช่ฝังอยู่ในโค้ด รองรับการคำนวณประกันสังคมและภาษี พร้อมพอร์ทัลให้พนักงานดูสลิปและยื่นลาได้เอง',
    deliverables: ['ตั้งกฎกะและค่าล่วงเวลา', 'คำนวณประกันสังคมและภาษี', 'พอร์ทัลพนักงานและสลิปเงินเดือน', 'ตรวจความผิดปกติก่อนปิดรอบ'],
    tech: ['TypeScript', 'Node.js', 'PostgreSQL', 'React'],
    icon: 'analytics',
    preview: 'table'
  },
  {
    id: 'websites',
    eyebrow: 'WEBSITE',
    title: 'เว็บไซต์องค์กรและธุรกิจ',
    nameEn: 'Website',
    primary: true,
    summary: 'เว็บไซต์ที่โหลดเร็ว ค้นหาเจอ และสื่อสารสิ่งที่ธุรกิจคุณทำได้จริงภายในหน้าจอแรก',
    detail:
      'ออกแบบโครงสร้างเนื้อหาให้ลูกค้าเข้าใจบริการของคุณได้เร็ว ดูแลเรื่อง SEO ทางเทคนิค ความเร็วในการโหลด และการแสดงผลบนมือถือตั้งแต่ต้น พร้อมโครงสร้างที่ทีมคุณเข้ามาแก้เนื้อหาเองได้',
    deliverables: ['วางโครงสร้างเนื้อหาและหน้าเว็บ', 'ออกแบบและพัฒนาหน้าจอ', 'SEO ทางเทคนิคและความเร็ว', 'ระบบแก้เนื้อหาและการนำขึ้นใช้งาน'],
    tech: ['Next.js', 'TypeScript', 'Cloudflare'],
    icon: 'browser',
    preview: 'dashboard'
  },
  {
    id: 'web-applications',
    eyebrow: 'WEB APPLICATION',
    title: 'เว็บแอปพลิเคชัน',
    nameEn: 'Web Application',
    primary: true,
    summary: 'เว็บแอปที่เร็ว เข้าถึงง่าย และรองรับผู้ใช้งานจริงได้โดยไม่สะดุด',
    detail:
      'พัฒนาแบบ Type-safe ตั้งแต่ฐานข้อมูลถึงหน้าจอ เรนเดอร์ฝั่งเซิร์ฟเวอร์ในหน้าที่ต้องการ SEO และวัดผลด้วย Core Web Vitals จริง ไม่ใช่แค่ดูสวยในไฟล์ออกแบบ',
    deliverables: ['Design System และชุดคอมโพเนนต์', 'พัฒนา Frontend และ API', 'ตรวจสอบความเร็วและการเข้าถึง', 'ตั้งค่า CI/CD'],
    tech: ['Next.js', 'TypeScript', 'Fastify', 'Cloudflare'],
    icon: 'browser',
    preview: 'dashboard'
  },
  {
    id: 'mobile-applications',
    eyebrow: 'APPLICATION',
    title: 'แอปพลิเคชันมือถือ',
    nameEn: 'Mobile Application',
    primary: true,
    summary: 'แอปสำหรับทีมหน้างานและลูกค้า ทั้ง iOS และ Android',
    detail:
      'ใช้โค้ดชุดเดียวกับ React Native เมื่อเหมาะสม และเขียน Native เฉพาะส่วนที่จำเป็น รองรับการทำงานแบบออฟไลน์สำหรับทีมที่ต้องออกไปหน้างานที่สัญญาณไม่ถึง',
    deliverables: ['พัฒนาแบบ Cross-platform', 'ออกแบบการซิงก์ข้อมูลออฟไลน์', 'นำขึ้น App Store และ Play Store', 'ติดตาม Crash และการใช้งาน'],
    tech: ['React Native', 'TypeScript', 'SQLite'],
    icon: 'mobile',
    preview: 'mobile'
  },
  {
    id: 'hr-line-bot',
    eyebrow: 'HR-LINE-BOT',
    title: 'ระบบ HR ผ่าน LINE',
    nameEn: 'HR LINE Bot',
    primary: true,
    summary: 'ให้พนักงานลงเวลา ยื่นลา และดูข้อมูลตัวเองผ่าน LINE ที่ทุกคนใช้อยู่แล้ว',
    detail:
      'ไม่ต้องให้พนักงานติดตั้งแอปใหม่หรือจำรหัสผ่านเพิ่ม งาน HR ที่ใช้บ่อยที่สุดย้ายมาอยู่บน LINE Official Account ทั้งการลงเวลา การยื่นลา การอนุมัติของหัวหน้า และการแจ้งเตือน โดยข้อมูลยังเชื่อมกลับเข้าระบบ HR หลักชุดเดียวกัน',
    deliverables: ['เชื่อมต่อ LINE Official Account', 'ลงเวลาและยื่นลาผ่าน LINE', 'อนุมัติและแจ้งเตือนถึงหัวหน้างาน', 'เชื่อมข้อมูลกลับเข้าระบบ HR'],
    tech: ['LINE Messaging API', 'Node.js', 'TypeScript', 'PostgreSQL'],
    icon: 'mobile',
    preview: 'mobile'
  },
  {
    id: 'document-management',
    eyebrow: 'DOCUMENT MANAGEMENT',
    title: 'ระบบจัดเก็บเอกสารและไฟล์',
    nameEn: 'Document Management System',
    primary: true,
    summary: 'ที่เก็บเอกสารกลางที่ค้นเจอ กำหนดสิทธิ์ได้ และรู้ว่าใครเปิดหรือแก้ไฟล์ไหนเมื่อไหร่',
    detail:
      'แทนที่โฟลเดอร์แชร์ที่ไม่มีใครกล้าจัดระเบียบ ด้วยที่เก็บเอกสารกลางที่มีหมวดหมู่ เวอร์ชันของไฟล์ สิทธิ์การเข้าถึงตามบทบาท และการค้นหาที่อ่านชื่อเรื่องและข้อมูลกำกับได้ พร้อมบันทึกการเข้าถึงเพื่อการตรวจสอบ',
    deliverables: ['ออกแบบหมวดหมู่และข้อมูลกำกับเอกสาร', 'สิทธิ์การเข้าถึงตามบทบาท', 'เวอร์ชันของไฟล์และการค้นหา', 'บันทึกการเข้าถึงและการสำรองข้อมูล'],
    tech: ['Node.js', 'PostgreSQL', 'Object Storage', 'React'],
    icon: 'cloud',
    preview: 'table'
  },

  // --- supporting capabilities ---------------------------------------------
  {
    id: 'custom-software',
    eyebrow: 'CUSTOM SOFTWARE',
    title: 'พัฒนาซอฟต์แวร์ตามความต้องการ',
    nameEn: 'Custom Software',
    summary: 'ระบบที่ออกแบบตามวิธีทำงานจริงของคุณ ไม่ใช่ให้คุณเปลี่ยนวิธีทำงานตามโปรแกรม',
    detail:
      'เมื่อกระบวนการทำงานคือหัวใจของธุรกิจ โปรแกรมสำเร็จรูปจะกลายเป็นต้นทุนแฝงในทุกธุรกรรม เราออกแบบและพัฒนาระบบที่ตรงกับขั้นตอนจริง ทั้งโครงสร้างข้อมูล สิทธิ์การใช้งาน และรายงานที่ทีมคุณเข้าใจอยู่แล้ว',
    deliverables: ['สำรวจและเขียน Workflow ปัจจุบัน', 'ออกแบบสถาปัตยกรรมและโครงสร้างข้อมูล', 'พัฒนาและนำขึ้นใช้งานจริง', 'ส่งมอบซอร์สโค้ดทั้งหมด'],
    tech: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    icon: 'code',
    preview: 'nodes'
  },
  {
    id: 'internal-tools',
    eyebrow: 'INTERNAL TOOLS',
    title: 'ระบบภายในองค์กร',
    nameEn: 'Internal Tools',
    summary: 'เครื่องมือเล็ก ๆ ที่ทีมใช้ทุกวัน สร้างให้ดีตั้งแต่แรกแทนการต่อกันไปเรื่อย ๆ',
    detail:
      'รวมเครื่องมือที่แต่ละฝ่ายสร้างกันเองให้อยู่ในระบบเดียว มี Login ชุดเดียว มีการบันทึกว่าใครแก้อะไรเมื่อไหร่ และถอนสิทธิ์พนักงานที่ลาออกได้จบในที่เดียว',
    deliverables: ['รวมระบบเข้าเป็นชุดเดียว', 'สิทธิ์ตามบทบาทและการตรวจสอบ', 'งานแบบ Bulk พร้อมยกเลิกได้', 'ประวัติการแก้ไขทุกรายการ'],
    tech: ['React', 'Fastify', 'PostgreSQL'],
    icon: 'code',
    preview: 'table'
  },
  {
    id: 'automation',
    eyebrow: 'AUTOMATION',
    title: 'Automation / ระบบทำงานอัตโนมัติ',
    nameEn: 'Automation',
    summary: 'ตัดงานซ้ำ ๆ ออกก่อนที่มันจะกลายเป็นความผิดพลาดซ้ำ ๆ',
    detail:
      'จัดเส้นทางอนุมัติ ตั้งงานตามเวลา ออกเอกสารอัตโนมัติ ส่งแจ้งเตือน และกระทบยอดข้อมูล งานที่ไม่มีใครอยากทำแต่กินเวลาทั้งแผนกทุกเดือน',
    deliverables: ['ออกแบบเงื่อนไขและกฎการทำงาน', 'ตั้ง Trigger ตามเหตุการณ์และเวลา', 'จัดการกรณีข้อผิดพลาด', 'หน้าจอติดตามการทำงาน'],
    tech: ['Node.js', 'Redis', 'PostgreSQL'],
    icon: 'automation',
    preview: 'flow'
  },
  {
    id: 'integration',
    eyebrow: 'API & INTEGRATION',
    title: 'เชื่อมต่อระบบและ API',
    nameEn: 'API & System Integration',
    summary: 'ทำให้ระบบที่คุณจ่ายเงินซื้อมาแล้ว คุยกันได้จริง',
    detail:
      'เชื่อมต่อระบบบัญชี LINE ช่องทางชำระเงิน e-Tax ผู้ให้บริการขนส่ง และฐานข้อมูลเดิม พร้อมจัดการเรื่องการลองใหม่ การกันข้อมูลซ้ำ และกรณีที่เอกสารของผู้ให้บริการไม่ได้เขียนไว้',
    deliverables: ['ทำแผนผังการเชื่อมต่อ', 'สร้าง API Gateway หรือ Middleware', 'ระบบลองใหม่และกระทบยอด', 'การแจ้งเตือนเมื่อเชื่อมต่อล้มเหลว'],
    tech: ['Node.js', 'Fastify', 'Redis', 'Webhook'],
    icon: 'integration',
    preview: 'nodes'
  },
  {
    id: 'analytics',
    eyebrow: 'DASHBOARD & ANALYTICS',
    title: 'Dashboard และรายงานผู้บริหาร',
    nameEn: 'Dashboard & Analytics',
    summary: 'ตัวเลขชุดเดียวที่ทุกฝ่ายเห็นตรงกัน และพร้อมก่อนเริ่มประชุม',
    detail:
      'กำหนดนิยามของตัวชี้วัดให้ชัดเจน สร้าง Data Pipeline และออกแบบ Dashboard ที่คนเปิดใช้จริง พร้อมเอกสารกำกับว่าตัวเลขแต่ละตัวนับจากอะไร',
    deliverables: ['นิยามตัวชี้วัดร่วมกัน', 'สร้าง Data Pipeline', 'Dashboard ผู้บริหารและฝ่ายปฏิบัติการ', 'รายงานอัตโนมัติตามรอบ'],
    tech: ['PostgreSQL', 'TypeScript', 'React'],
    icon: 'analytics',
    preview: 'chart'
  },
  {
    id: 'cloud',
    eyebrow: 'CLOUD & INFRASTRUCTURE',
    title: 'โครงสร้างพื้นฐานและ Cloud',
    nameEn: 'Cloud & Infrastructure',
    summary: 'โครงสร้างพื้นฐานที่ขยายได้ตามจริง และมีค่าใช้จ่ายตามที่ประเมินไว้',
    detail:
      'ติดตั้งแบบ Container จัดการโครงสร้างด้วยโค้ด แยกสภาพแวดล้อมทดสอบกับใช้งานจริง และสำรองข้อมูลที่ทดสอบกู้คืนจริง ไม่ใช่แค่ตั้งค่าไว้เฉย ๆ',
    deliverables: ['ออกแบบสภาพแวดล้อม', 'Infrastructure as Code', 'ซ้อมกู้คืนข้อมูล', 'ทบทวนค่าใช้จ่าย'],
    tech: ['Docker', 'Cloudflare', 'GitHub Actions'],
    icon: 'cloud',
    preview: 'nodes'
  },
  {
    id: 'support',
    eyebrow: 'MAINTENANCE & SUPPORT',
    title: 'ดูแลระบบหลังส่งมอบ',
    nameEn: 'Maintenance & Support',
    summary: 'มีคนรับผิดชอบที่ระบุชื่อได้ มีเวลาตอบกลับที่ตกลงกันไว้ และระบบที่ยังทำงานต่อได้',
    detail:
      'อัปเดตความปลอดภัย ปรับรุ่น Dependency รับมือเหตุขัดข้อง และมีงบปรับปรุงต่อเนื่อง เพื่อไม่ให้ระบบค่อย ๆ เสื่อมลงทันทีที่โปรเจกต์จบ',
    deliverables: ['ข้อตกลงระดับบริการและสายการแจ้งเหตุ', 'รอบการอัปเดตและแพตช์', 'รายงานเหตุขัดข้อง', 'ทบทวนสุขภาพระบบรายไตรมาส'],
    tech: ['Monitoring', 'Docker', 'CI/CD'],
    icon: 'support',
    preview: 'dashboard'
  },
  {
    id: 'consulting',
    eyebrow: 'IT CONSULTING',
    title: 'ที่ปรึกษาด้านไอที',
    nameEn: 'IT Consulting',
    summary: 'ตัดสินใจว่าอะไรควรสร้าง อะไรควรซื้อ และอะไรควรเลิกทำ',
    detail:
      'ประเมินระบบที่คุณใช้อยู่อย่างตรงไปตรงมา ทั้งต้นทุนในการดูแลต่อ และแผนงานที่เรียงลำดับตามงบประมาณและกำลังคนที่มีจริง',
    deliverables: ['ตรวจสอบระบบปัจจุบัน', 'วิเคราะห์สร้างเองหรือซื้อ', 'แผนงานเรียงลำดับความสำคัญ', 'ประเมินงบและกำลังคน'],
    tech: ['Assessment', 'Roadmap'],
    icon: 'compass',
    preview: 'flow'
  }
];

/** The owner's seven core services, in selling order. */
export const primaryServices = services.filter((service) => service.primary);

export const getService = (id: string): Service | undefined =>
  services.find((service) => service.id === id);

export const servicesIntro = {
  eyebrow: 'OUR SERVICES',
  title: ['บริการซอฟต์แวร์ครบวงจร', 'ตั้งแต่แนวคิดจนถึงระบบที่ใช้งานจริง'],
  lead: 'งานส่วนใหญ่ใช้หลายบริการร่วมกัน เลือกหัวข้อทางซ้ายเพื่อดูรายละเอียดและสิ่งที่ส่งมอบจริง'
} as const;
