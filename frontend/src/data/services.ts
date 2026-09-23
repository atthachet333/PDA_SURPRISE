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

/**
 * What family a service belongs to. Used by the differentiation block so a
 * visitor can tell a website from a web application from an ERP — the single
 * most common confusion on a page like this.
 */
export type ServiceKind = 'business-system' | 'people' | 'documents' | 'application' | 'web';

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
   * The eight services the owner sells as the core catalogue. Everything else
   * is a supporting capability that usually ships as part of one of these.
   */
  primary?: boolean;
}

/**
 * A core service, written so a visitor can answer four questions without
 * decoding technical language:
 *
 *   problems      what business problem does this solve?
 *   deliverables  what does PDA BLISS actually build?
 *   targetUsers   who is this suitable for?
 *   relatedProjects  can I see it working somewhere real?
 *
 * `relatedProjects` holds case-study slugs from `caseStudies.ts` — the single
 * source of project truth. Nothing here restates a project's content, and a
 * service with no public case study simply carries none. We never invent one.
 */
export interface PrimaryService extends Service {
  primary: true;
  kind: ServiceKind;
  /** One line: the situation a business is in before this system exists. */
  problem: string;
  /** The specific symptoms visitors recognise in their own company. */
  problems: string[];
  /** Who this fits, in plain business terms. */
  targetUsers: string[];
  /** Case-study slugs in `caseStudies.ts`. Empty when no public work exists. */
  relatedProjects: string[];
}

/**
 * ── CORE SERVICES ───────────────────────────────────────────────────────────
 * The eight service families PDA BLISS sells, in selling order: business
 * systems first, then people, then documents and files, then applications.
 *
 * COPY RULES THAT THIS FILE IS HELD TO
 *   Lead with the problem, not the stack. No capability is claimed that the
 *   delivered systems in `caseStudies.ts` do not support — in particular no
 *   automatic tax or social-security compliance, no app-store publishing, and
 *   no backup or security guarantee. Where scope varies by project, the copy
 *   says "ตามขอบเขตที่ตกลงกัน" rather than implying it is always included.
 * ────────────────────────────────────────────────────────────────────────────
 */
const CORE: PrimaryService[] = [
  {
    id: 'business-systems',
    eyebrow: 'ERP',
    title: 'ระบบ ERP / บริหารธุรกิจ',
    nameEn: 'ERP / Business Management',
    primary: true,
    kind: 'business-system',
    summary: 'รวมข้อมูลต้นทุน สต็อก และงานหลังบ้านไว้ในระบบเดียวที่ตรวจสอบย้อนกลับได้',
    problem: 'ข้อมูลสต็อก ต้นทุน และการสั่งซื้อ อยู่คนละไฟล์คนละคน ทำให้ไม่มีใครตอบได้ว่าตัวเลขจริงคือเท่าไร',
    problems: [
      'ยอดคงเหลือในไฟล์ไม่ตรงกับของที่อยู่ในคลังจริง',
      'ต้นทุนต่อรายการต้องนั่งรวมเองทุกครั้งที่อยากรู้',
      'ย้อนกลับไปหาว่ารายการนี้มาจากเอกสารไหน ใครเป็นคนบันทึก ทำได้ยาก',
      'แต่ละฝ่ายเก็บข้อมูลชุดของตัวเอง แล้วมาเถียงกันตอนสรุป'
    ],
    detail:
      'แทนที่ไฟล์ที่กระจายกันหลายสิบไฟล์ ด้วยข้อมูลชุดเดียวที่ทุกฝ่ายเห็นตรงกัน ทุกการเคลื่อนไหวของสต็อกมีเอกสารต้นทาง มีสายอนุมัติ และมีประวัติการแก้ไข ทำให้รายงานต้นทุนและยอดคงเหลือตรวจย้อนกลับไปถึงรายการจริงได้',
    deliverables: [
      'รับเข้า จ่ายออก และโอนย้ายสินค้าและวัตถุดิบ',
      'คำนวณต้นทุนจากรายการจริง และดูย้อนหลังตามช่วงเวลา',
      'รายการจัดซื้อและการรับของ',
      'สิทธิ์ตามบทบาท และ Audit trail ของทุกรายการ',
      'รายงานยอดคงเหลือ ต้นทุน และกำไรจากเอกสารต้นทาง'
    ],
    targetUsers: [
      'ธุรกิจที่มีคลังสินค้าหรือวัตถุดิบต้องดูแล',
      'ร้านอาหารและโรงงานที่ต้องคุมต้นทุนต่อเมนูหรือต่อชิ้น',
      'บริษัทที่ยังใช้ Excel หลายไฟล์เป็นระบบหลัก'
    ],
    relatedProjects: ['erp-inventory-costing'],
    tech: ['TypeScript', 'React', 'Node.js', 'MySQL'],
    icon: 'building',
    preview: 'table'
  },
  {
    id: 'payroll',
    eyebrow: 'PAYROLL',
    title: 'ระบบ Payroll / เงินเดือน',
    nameEn: 'Payroll',
    primary: true,
    kind: 'people',
    summary: 'ลดเวลาคำนวณเงินเดือนและตรวจสอบข้อมูลการทำงานในแต่ละรอบ',
    problem: 'ทุกสิ้นเดือนต้องรวมเวลาทำงาน ตรวจข้อยกเว้น แล้วคำนวณใหม่ด้วยมือ และแก้ไขย้อนหลังได้ตลอดเวลา',
    problems: [
      'ข้อมูลเวลาเข้า-ออกต้องนำเข้าและตรวจหลายรอบกว่าจะใช้ได้',
      'รายการผิดปกติ เช่น ลืมสแกนออก ปนอยู่กับรายการปกติ',
      'คำนวณเสร็จแล้วข้อมูลยังถูกแก้ย้อนหลังได้ ทำให้ตัวเลขไม่นิ่ง',
      'ไม่รู้ว่าใครเป็นคนอนุมัติรอบไหน เมื่อไหร่'
    ],
    detail:
      'ออกแบบรอบเงินเดือนให้เป็นลำดับสถานะที่ชัดเจน ตั้งแต่นำเข้าเวลา ตรวจข้อยกเว้น คำนวณ อนุมัติ จ่าย และล็อกรอบ แต่ละขั้นมีผู้รับผิดชอบและผลลัพธ์ของตัวเอง เมื่อล็อกแล้วข้อมูลของรอบนั้นจะไม่ถูกแก้เงียบ ๆ อีก',
    deliverables: [
      'นำเข้าข้อมูลเวลาทำงานเข้าสู่รอบประจำเดือน',
      'แยกรายการผิดปกติออกมาตรวจก่อนคำนวณ',
      'คำนวณตามกฎกะ ค่าล่วงเวลา และเงื่อนไขการหักที่ตกลงกัน',
      'สายอนุมัติและการล็อกรอบเมื่อตรวจเสร็จ',
      'ประวัติว่าใครทำอะไรกับรอบไหน'
    ],
    targetUsers: [
      'ฝ่ายบุคคลที่ปิดรอบเงินเดือนด้วย Excel ทุกเดือน',
      'ธุรกิจที่มีกะ ค่าล่วงเวลา หรือเงื่อนไขการหักหลายแบบ',
      'องค์กรที่ต้องการให้ตัวเลขแต่ละรอบตรวจย้อนกลับได้'
    ],
    relatedProjects: ['payroll-monthly-control'],
    tech: ['TypeScript', 'React', 'Node.js', 'MySQL'],
    icon: 'analytics',
    preview: 'table'
  },
  {
    id: 'hr-line-bot',
    eyebrow: 'HR · LINE',
    title: 'ระบบ HR ผ่าน LINE',
    nameEn: 'HR LINE Workflow',
    primary: true,
    kind: 'people',
    summary: 'เปลี่ยนขั้นตอนลา อนุมัติ และแจ้งเตือน ให้ทำผ่าน LINE ที่พนักงานใช้อยู่แล้ว',
    problem: 'การลาและการอนุมัติยังวิ่งผ่านกระดาษหรือแชทส่วนตัว ทำให้ตกหล่นและตามสถานะไม่ได้',
    problems: [
      'พนักงานไม่อยากติดตั้งแอปใหม่และจำรหัสผ่านเพิ่ม',
      'ใบลาหายอยู่ในแชท ไม่รู้ว่าอนุมัติแล้วหรือยัง',
      'หัวหน้าต้องเปิดคอมพิวเตอร์เพื่ออนุมัติเรื่องเล็ก ๆ',
      'ข้อมูลวันลาไม่ได้ไหลต่อไปถึงฝ่ายบุคคลโดยอัตโนมัติ'
    ],
    detail:
      'LINE ทำหน้าที่เป็นช่องทางเข้าใช้งาน ไม่ใช่ตัวระบบทั้งหมด งาน HR ที่ใช้บ่อยที่สุดย้ายมาอยู่บน LINE Official Account ทั้งการยื่นคำขอ การอนุมัติของหัวหน้า และการแจ้งเตือน ส่วนข้อมูลจริงยังเก็บและตรวจสอบได้ในระบบหลังบ้านชุดเดียวกัน',
    deliverables: [
      'ยื่นคำขอลาและดูสถานะผ่าน LINE',
      'อนุมัติหรือไม่อนุมัติจากมือถือของหัวหน้างาน',
      'แจ้งเตือนอัตโนมัติเมื่อสถานะเปลี่ยน',
      'หน้าหลังบ้านสำหรับฝ่ายบุคคลดูภาพรวมและประวัติ',
      'เชื่อมข้อมูลวันลากลับเข้าระบบ HR'
    ],
    targetUsers: [
      'องค์กรที่พนักงานส่วนใหญ่ใช้ LINE อยู่แล้ว',
      'ทีมที่มีพนักงานหน้างานซึ่งไม่ได้นั่งหน้าคอมพิวเตอร์',
      'ฝ่ายบุคคลที่อยากลดงานตามเอกสารด้วยมือ'
    ],
    relatedProjects: ['hr-line-leave-approval'],
    tech: ['LINE Messaging API', 'TypeScript', 'Node.js', 'MySQL'],
    icon: 'mobile',
    preview: 'mobile'
  },
  {
    id: 'document-management',
    eyebrow: 'DOCUMENT WORKFLOW',
    title: 'ระบบเอกสารและการอนุมัติ',
    nameEn: 'Document & Approval System',
    primary: true,
    kind: 'documents',
    summary: 'ลดเอกสารตกหล่น ด้วยขั้นตอนอนุมัติและการติดตามสถานะที่ชัดเจน',
    problem: 'เอกสารที่ต้องผ่านหลายคนวิ่งอยู่ในอีเมลและแชท จนไม่มีใครรู้ว่าตอนนี้ค้างอยู่ที่ใคร',
    problems: [
      'ไม่รู้ว่าเอกสารอยู่ขั้นไหน และใครเป็นคนถัดไป',
      'เอกสารถูกตีกลับแล้วแก้ใหม่ จนไม่แน่ใจว่าไฟล์ไหนคือฉบับล่าสุด',
      'เรื่องเร่งด่วนเงียบหายเพราะไม่มีใครถูกเตือน',
      'ตรวจย้อนหลังว่าใครอนุมัติเมื่อไหร่ ทำได้ยาก'
    ],
    detail:
      'กำหนดเส้นทางของเอกสารแต่ละประเภทให้ชัดตั้งแต่ต้น ทั้งผู้ตรวจ ผู้อนุมัติ การตีกลับเพื่อแก้ไข และการส่งใหม่ ทุกเอกสารมีสถานะที่มองเห็นได้ และมีประวัติว่าเกิดอะไรขึ้นบ้างระหว่างทาง',
    deliverables: [
      'อัปโหลดเอกสารพร้อมข้อมูลกำกับ',
      'เส้นทางตรวจและอนุมัติตามประเภทเอกสาร',
      'ตีกลับเพื่อแก้ไขและส่งใหม่โดยไม่เสียประวัติเดิม',
      'ติดตามสถานะและแจ้งเตือนผู้เกี่ยวข้อง',
      'ประวัติการอนุมัติที่ตรวจย้อนกลับได้'
    ],
    targetUsers: [
      'องค์กรที่มีเอกสารต้องผ่านหลายลำดับการอนุมัติ',
      'ทีมที่ยังส่งเอกสารต่อกันทางอีเมลหรือแชท',
      'ฝ่ายที่ต้องตอบได้ว่าเรื่องนี้ค้างอยู่ที่ใคร'
    ],
    relatedProjects: ['document-file-workflow'],
    tech: ['TypeScript', 'React', 'Node.js', 'MySQL'],
    /* The routed two-node glyph reads as a hand-off between steps; the gear
       reads as settings, which is not what an approval flow is. */
    icon: 'integration',
    preview: 'flow'
  },
  {
    id: 'file-management',
    eyebrow: 'NAS · FILE STORAGE',
    title: 'ระบบจัดเก็บไฟล์กลาง (NAS)',
    nameEn: 'NAS / File Management',
    primary: true,
    kind: 'documents',
    summary: 'รวมไฟล์บริษัทไว้เป็นที่เดียว ค้นหาและกำหนดสิทธิ์ได้ง่ายขึ้น',
    problem: 'ไฟล์งานกระจายอยู่ตามเครื่องของแต่ละคน ทำให้หาไม่เจอและไม่รู้ว่าฉบับไหนใหม่ที่สุด',
    problems: [
      'ไฟล์สำคัญอยู่บนเครื่องของคนที่ไม่อยู่วันนี้',
      'ชื่อไฟล์ซ้ำกันหลายเวอร์ชัน จนไม่แน่ใจว่าอันไหนล่าสุด',
      'ไม่มีโครงสร้างโฟลเดอร์ที่ทุกคนเข้าใจตรงกัน',
      'ให้สิทธิ์เข้าถึงเฉพาะบางฝ่ายทำได้ยาก'
    ],
    detail:
      'วางโครงสร้างที่เก็บไฟล์กลางขององค์กร ทั้งการจัดหมวดหมู่ การตั้งชื่อ และสิทธิ์การเข้าถึงตามฝ่ายหรือบทบาท เพื่อให้ไฟล์ที่ทีมต้องใช้ร่วมกันอยู่ในที่เดียวและค้นหาเจอ ขอบเขตการสำรองข้อมูลและความปลอดภัยกำหนดร่วมกันเป็นรายโครงการ',
    deliverables: [
      'ออกแบบโครงสร้างโฟลเดอร์และการตั้งชื่อ',
      'สิทธิ์การเข้าถึงตามฝ่ายหรือบทบาท',
      'ย้ายไฟล์จากเครื่องแต่ละคนเข้าสู่ที่เก็บกลาง',
      'ค้นหาไฟล์จากชื่อและข้อมูลกำกับ',
      'แนวปฏิบัติการใช้งานสำหรับทีม'
    ],
    targetUsers: [
      'บริษัทที่ไฟล์งานยังอยู่กระจายตามเครื่องพนักงาน',
      'ทีมที่ต้องใช้ไฟล์ชุดเดียวกันร่วมกันหลายฝ่าย',
      'องค์กรที่ต้องการคุมว่าใครเข้าถึงไฟล์ไหนได้บ้าง'
    ],
    relatedProjects: ['nas-file-storage'],
    tech: ['NAS', 'Directory Service', 'Network Share'],
    icon: 'cloud',
    preview: 'nodes'
  },
  {
    id: 'web-applications',
    eyebrow: 'WEB APPLICATION',
    title: 'เว็บแอปพลิเคชัน',
    nameEn: 'Web Application',
    primary: true,
    kind: 'application',
    summary: 'เปลี่ยนขั้นตอนงานภายในที่ทำด้วยมือ ให้เป็นระบบออนไลน์ที่ทุกคนใช้ร่วมกัน',
    problem: 'งานประจำยังทำผ่านไฟล์ที่ส่งต่อกันไปมา ทำให้ข้อมูลซ้ำ ตกหล่น และตรวจย้อนหลังไม่ได้',
    problems: [
      'ทุกคนแก้ไฟล์เดียวกันคนละสำเนา',
      'ต้องคีย์ข้อมูลเดิมซ้ำในหลายจุด',
      'ไม่มีหน้าจอกลางที่บอกสถานะของงานทั้งหมด',
      'โปรแกรมสำเร็จรูปในตลาดไม่ตรงกับวิธีทำงานจริง'
    ],
    detail:
      'เว็บแอปพลิเคชันคือระบบที่เปิดผ่านเบราว์เซอร์แล้วทำงานได้จริง ไม่ใช่หน้าเว็บที่ไว้อ่านอย่างเดียว มีการเข้าสู่ระบบ สิทธิ์ผู้ใช้ แบบฟอร์ม เส้นทางอนุมัติ และหน้าสรุปสถานะ ออกแบบตามขั้นตอนที่ทีมคุณทำอยู่จริง',
    deliverables: [
      'ออกแบบ Workflow และหน้าจอตามงานจริง',
      'ระบบเข้าสู่ระบบและสิทธิ์ตามบทบาท',
      'แบบฟอร์ม การอนุมัติ และการติดตามสถานะ',
      'หน้าสรุปข้อมูลสำหรับหัวหน้างาน',
      'เชื่อมต่อกับระบบหรือข้อมูลเดิมตามขอบเขตที่ตกลงกัน'
    ],
    targetUsers: [
      'ทีมที่ยังใช้ Excel หรือกระดาษเป็นเครื่องมือหลัก',
      'ธุรกิจที่มีขั้นตอนเฉพาะตัวจนซื้อโปรแกรมสำเร็จรูปไม่ได้',
      'องค์กรที่ต้องการให้หลายฝ่ายทำงานบนข้อมูลชุดเดียวกัน'
    ],
    relatedProjects: [],
    tech: ['TypeScript', 'React', 'Node.js', 'MySQL'],
    icon: 'code',
    preview: 'dashboard'
  },
  {
    id: 'mobile-applications',
    eyebrow: 'MOBILE APPLICATION',
    title: 'แอปพลิเคชันมือถือ',
    nameEn: 'Mobile Application',
    primary: true,
    kind: 'application',
    summary: 'นำระบบหรือบริการของธุรกิจไปอยู่บนมือถือของพนักงานและลูกค้า',
    problem: 'คนที่ต้องใช้ข้อมูลอยู่หน้างาน ไม่ได้นั่งอยู่หน้าคอมพิวเตอร์',
    problems: [
      'ทีมหน้างานต้องกลับมาคีย์ข้อมูลที่ออฟฟิศทีหลัง',
      'ข้อมูลจากหน้างานมาถึงช้าจนตัดสินใจไม่ทัน',
      'ลูกค้าอยากดูสถานะเองแต่ไม่มีช่องทาง',
      'หน้าจอที่ทำไว้สำหรับเดสก์ท็อปใช้บนมือถือไม่สะดวก'
    ],
    detail:
      'ออกแบบการใช้งานสำหรับมือถือโดยเฉพาะ ไม่ใช่ย่อหน้าจอเดสก์ท็อปลงมา เลือกระหว่างแอปบนมือถือหรือเว็บที่ทำงานบนมือถือได้ดี ตามลักษณะงานและกลุ่มผู้ใช้ ส่วนการนำขึ้นสโตร์และการดูแลบัญชีผู้พัฒนากำหนดขอบเขตร่วมกันเป็นรายโครงการ',
    deliverables: [
      'ออกแบบหน้าจอและขั้นตอนสำหรับการใช้งานบนมือถือ',
      'ฟังก์ชันสำหรับทีมหน้างานหรือลูกค้า ตามโจทย์',
      'เชื่อมข้อมูลกับระบบหลังบ้านที่มีอยู่',
      'แจ้งเตือนถึงผู้ใช้เมื่อมีเรื่องต้องดำเนินการ',
      'ทดสอบการใช้งานจริงบนอุปกรณ์'
    ],
    targetUsers: [
      'ธุรกิจที่มีทีมออกหน้างานหรือทีมขนส่ง',
      'บริการที่ลูกค้าต้องเช็กสถานะด้วยตัวเอง',
      'องค์กรที่มีระบบหลังบ้านอยู่แล้วและอยากต่อยอดไปมือถือ'
    ],
    relatedProjects: [],
    tech: ['TypeScript', 'React', 'REST API'],
    icon: 'mobile',
    preview: 'mobile'
  },
  {
    id: 'websites',
    eyebrow: 'WEBSITE',
    title: 'เว็บไซต์องค์กรและธุรกิจ',
    nameEn: 'Corporate Website',
    primary: true,
    kind: 'web',
    summary: 'สร้างเว็บไซต์ที่อธิบายธุรกิจได้ชัด ดูน่าเชื่อถือ และติดต่อกลับได้ง่าย',
    problem: 'ลูกค้าที่สนใจหาข้อมูลไม่เจอ หรือเจอแล้วยังไม่เข้าใจว่าบริษัททำอะไรและติดต่ออย่างไร',
    problems: [
      'เว็บไซต์เดิมอธิบายบริการไม่ชัด ลูกค้าต้องโทรมาถาม',
      'เปิดบนมือถือแล้วอ่านยาก',
      'ไม่มีที่แสดงผลงานให้ลูกค้าใหม่ดูก่อนตัดสินใจ',
      'ช่องทางติดต่อกระจัดกระจาย ไม่รู้ว่าเรื่องไปถึงใคร'
    ],
    detail:
      'เริ่มจากการจัดโครงสร้างเนื้อหาให้ลูกค้าเข้าใจบริการของคุณได้เร็ว แล้วจึงออกแบบหน้าจอรอบเนื้อหานั้น ดูแลการแสดงผลตั้งแต่มือถือถึงจอใหญ่ ความเร็วในการโหลด Metadata สำหรับการค้นหา และแบบฟอร์มติดต่อที่ส่งถึงคนรับจริง',
    deliverables: [
      'วางโครงสร้างเนื้อหาและผังหน้าเว็บ',
      'ออกแบบและพัฒนาหน้าจอแบบ Responsive',
      'หน้าบริการและหน้าผลงานสำหรับลูกค้าใหม่',
      'แบบฟอร์มติดต่อที่ตรวจข้อมูลทั้งหน้าเว็บและฝั่งเซิร์ฟเวอร์',
      'Metadata และโครงสร้างที่พร้อมสำหรับการค้นหา'
    ],
    targetUsers: [
      'บริษัทที่ต้องการช่องทางกลางอธิบายบริการของตัวเอง',
      'ธุรกิจบริการที่ลูกค้าค้นหาข้อมูลก่อนติดต่อ',
      'องค์กรที่มีเว็บไซต์เดิมแต่สื่อสารไม่ตรงกับงานที่ทำจริง'
    ],
    relatedProjects: ['corporate-website-system', 's2-accounting-website'],
    tech: ['React', 'TypeScript', 'Vite', 'Next.js'],
    icon: 'browser',
    preview: 'dashboard'
  }
];

/**
 * ── SUPPORTING CAPABILITIES ─────────────────────────────────────────────────
 * Genuine work, but it usually ships as part of one of the eight above rather
 * than being bought on its own. Kept separate so the catalogue does not read
 * as sixteen equally-weighted offerings.
 * ────────────────────────────────────────────────────────────────────────────
 */
const SUPPORTING: Service[] = [
  {
    id: 'custom-software',
    eyebrow: 'CUSTOM SOFTWARE',
    title: 'พัฒนาซอฟต์แวร์ตามความต้องการ',
    nameEn: 'Custom Software',
    summary: 'ระบบที่ออกแบบตามวิธีทำงานจริงของคุณ ไม่ใช่ให้คุณเปลี่ยนวิธีทำงานตามโปรแกรม',
    detail:
      'เมื่อกระบวนการทำงานคือหัวใจของธุรกิจ โปรแกรมสำเร็จรูปจะกลายเป็นต้นทุนแฝงในทุกธุรกรรม เราออกแบบและพัฒนาระบบที่ตรงกับขั้นตอนจริง ทั้งโครงสร้างข้อมูล สิทธิ์การใช้งาน และรายงานที่ทีมคุณเข้าใจอยู่แล้ว',
    deliverables: ['สำรวจและเขียน Workflow ปัจจุบัน', 'ออกแบบโครงสร้างข้อมูลและระบบ', 'พัฒนาและนำขึ้นใช้งานจริง', 'ส่งมอบซอร์สโค้ดทั้งหมด'],
    tech: ['TypeScript', 'React', 'Node.js', 'MySQL'],
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
    tech: ['React', 'Node.js', 'MySQL'],
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
    tech: ['Node.js', 'MySQL', 'Webhook'],
    icon: 'automation',
    preview: 'flow'
  },
  {
    id: 'integration',
    eyebrow: 'API & INTEGRATION',
    title: 'เชื่อมต่อระบบและ API',
    nameEn: 'API & System Integration',
    summary: 'ทำให้ระบบที่คุณใช้อยู่แล้ว ส่งข้อมูลถึงกันได้',
    detail:
      'เชื่อมต่อระบบที่มีอยู่เดิม LINE ช่องทางแจ้งเตือน และฐานข้อมูลเก่า พร้อมจัดการเรื่องการลองใหม่ การกันข้อมูลซ้ำ และกรณีที่เอกสารของผู้ให้บริการไม่ได้เขียนไว้',
    deliverables: ['ทำแผนผังการเชื่อมต่อ', 'สร้าง API หรือ Middleware', 'ระบบลองใหม่และกระทบยอด', 'การแจ้งเตือนเมื่อเชื่อมต่อล้มเหลว'],
    tech: ['Node.js', 'REST API', 'Webhook'],
    icon: 'integration',
    preview: 'nodes'
  },
  {
    id: 'analytics',
    eyebrow: 'DASHBOARD & REPORTING',
    title: 'Dashboard และรายงานผู้บริหาร',
    nameEn: 'Dashboard & Reporting',
    summary: 'ตัวเลขชุดเดียวที่ทุกฝ่ายเห็นตรงกัน และพร้อมก่อนเริ่มประชุม',
    detail:
      'กำหนดนิยามของตัวชี้วัดให้ชัดเจน ดึงข้อมูลจากระบบต้นทาง และออกแบบ Dashboard ที่คนเปิดใช้จริง พร้อมเอกสารกำกับว่าตัวเลขแต่ละตัวนับจากอะไร',
    deliverables: ['นิยามตัวชี้วัดร่วมกัน', 'ดึงข้อมูลจากระบบต้นทาง', 'Dashboard ผู้บริหารและฝ่ายปฏิบัติการ', 'รายงานตามรอบ'],
    tech: ['MySQL', 'TypeScript', 'React'],
    icon: 'analytics',
    preview: 'chart'
  },
  {
    id: 'cloud',
    eyebrow: 'HOSTING & INFRASTRUCTURE',
    title: 'ติดตั้งและดูแลโครงสร้างระบบ',
    nameEn: 'Hosting & Infrastructure',
    summary: 'นำระบบขึ้นใช้งานจริง พร้อมสภาพแวดล้อมทดสอบที่แยกจากของจริง',
    detail:
      'ติดตั้งระบบขึ้นเซิร์ฟเวอร์ แยกสภาพแวดล้อมทดสอบกับใช้งานจริง ตั้งค่าโดเมนและใบรับรองความปลอดภัย และวางรอบการสำรองข้อมูลตามขอบเขตที่ตกลงกันในแต่ละโครงการ',
    deliverables: ['ออกแบบสภาพแวดล้อมทดสอบและใช้งานจริง', 'ติดตั้งและนำระบบขึ้นใช้งาน', 'ตั้งค่าโดเมนและใบรับรอง', 'วางรอบการสำรองข้อมูลตามขอบเขตที่ตกลง'],
    tech: ['Docker', 'Nginx', 'PM2'],
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
    deliverables: ['ข้อตกลงระดับบริการและสายการแจ้งเหตุ', 'รอบการอัปเดตและแพตช์', 'รายงานเหตุขัดข้อง', 'ทบทวนสุขภาพระบบตามรอบ'],
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

export const services: Service[] = [...CORE, ...SUPPORTING];

/** The owner's eight core services, in selling order. */
export const primaryServices: PrimaryService[] = CORE;

/**
 * Homepage preview: one service per family, so the strip answers "เราทำอะไรได้บ้าง"
 * without reproducing the whole /services page. NAS and mobile are covered
 * there rather than here.
 */
export const homeServicePreview: PrimaryService[] = CORE.filter((service) =>
  ['business-systems', 'payroll', 'hr-line-bot', 'document-management', 'web-applications', 'websites'].includes(service.id)
);

/** Capabilities that ship inside a core service rather than on their own. */
export const supportingServices: Service[] = SUPPORTING;

export const getService = (id: string): Service | undefined =>
  services.find((service) => service.id === id);

/**
 * "These are not all the same thing."
 *
 * The four families visitors most often confuse, stated side by side. Kept as
 * data so the page renders one row per family instead of prose nobody reads.
 */
export const serviceDistinctions: readonly {
  id: string;
  label: string;
  nameEn: string;
  is: string;
  forWhom: string;
  serviceId: string;
}[] = [
  {
    id: 'website',
    label: 'เว็บไซต์',
    nameEn: 'Website',
    is: 'หน้าสาธารณะที่อธิบายบริษัท บริการ และผลงาน ให้คนนอกเข้ามาอ่านและติดต่อกลับ',
    forWhom: 'ลูกค้าใหม่และคนที่กำลังหาข้อมูล',
    serviceId: 'websites'
  },
  {
    id: 'web-app',
    label: 'เว็บแอปพลิเคชัน',
    nameEn: 'Web Application',
    is: 'ระบบที่เปิดผ่านเบราว์เซอร์แล้วใช้ทำงานได้จริง มีผู้ใช้ สิทธิ์ แบบฟอร์ม และสถานะของงาน',
    forWhom: 'ทีมงานภายใน หรือผู้ใช้ที่ต้องล็อกอินเข้ามาทำรายการ',
    serviceId: 'web-applications'
  },
  {
    id: 'erp',
    label: 'ระบบ ERP',
    nameEn: 'ERP',
    is: 'ระบบที่เชื่อมงานหลายฝ่ายเข้าด้วยกันบนข้อมูลชุดเดียว ทั้งสต็อก ต้นทุน และรายงาน',
    forWhom: 'ทั้งองค์กร โดยเฉพาะฝ่ายที่ต้องใช้ตัวเลขชุดเดียวกัน',
    serviceId: 'business-systems'
  },
  {
    id: 'mobile',
    label: 'แอปมือถือ',
    nameEn: 'Mobile Application',
    is: 'การใช้งานที่ออกแบบสำหรับมือถือโดยเฉพาะ สำหรับคนที่ไม่ได้อยู่หน้าคอมพิวเตอร์',
    forWhom: 'ทีมหน้างาน พนักงานนอกออฟฟิศ หรือลูกค้า',
    serviceId: 'mobile-applications'
  },
  {
    id: 'files',
    label: 'ระบบไฟล์กลาง',
    nameEn: 'NAS / File Storage',
    is: 'โครงสร้างที่เก็บไฟล์ของบริษัท ไม่ใช่ระบบที่มีหน้าจอทำรายการ แต่เป็นฐานให้ทีมใช้ไฟล์ร่วมกัน',
    forWhom: 'ทุกฝ่ายที่ต้องใช้ไฟล์ชุดเดียวกัน',
    serviceId: 'file-management'
  }
];

export const servicesIntro = {
  eyebrow: 'OUR SERVICES',
  title: ['เราเปลี่ยนงานที่ซับซ้อน', 'ให้กลายเป็นระบบที่ใช้งานจริง'],
  lead: 'ตั้งแต่ระบบหลังบ้าน เว็บไซต์ ไปจนถึงเครื่องมือเฉพาะสำหรับทีมของคุณ'
} as const;
