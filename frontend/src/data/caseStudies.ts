import { isSafePublicUrl, displayHost } from '@/lib/externalLinks';

export type CaseStudyCategory = 'business-system' | 'people' | 'document-data' | 'web';
export type CaseStudyStatus = 'internal-system' | 'custom-system' | 'built-system';
export type CaseStudyVisual = 'erp' | 'payroll' | 'hrLine' | 'documents' | 'website';

/** Filters on /work. A project may sit under more than one. */
export type WorkFilter = 'erp' | 'hr-payroll' | 'documents' | 'web' | 'automation' | 'internal-tools';

/**
 * How openly a project may be shown.
 *   public    a public website — may carry a live link once its URL is verified
 *   client    a client's system — described, never linked
 *   internal  an internal tool — described, never linked
 */
export type ProjectVisibility = 'public' | 'client' | 'internal';

export interface CaseFlowStep {
  id: string;
  title: string;
  actor: string;
  description: string;
  output: string;
}

export interface CaseFeatureGroup {
  title: string;
  items: readonly string[];
}

export interface CaseStudyScreen {
  src: string;
  alt: string;
  caption: string;
  reviewed: boolean;
}

/** A real, privacy-reviewed capture of the project (never a mock). */
export interface ProjectScreenshot {
  src: string;
  /** Smaller variant for cards. */
  srcSmall?: string;
  alt: string;
  width: number;
  height: number;
  reviewed: boolean;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CaseStudyCategory;
  status: CaseStudyStatus;
  /** Short type label, e.g. "ERP · สต็อกและต้นทุน". */
  projectType: string;
  filters: readonly WorkFilter[];
  /** 2–4 capability tags. Capabilities, not a tool list. */
  tags: readonly string[];
  /** One line: what PDA BLISS actually built. */
  delivered: string;
  problem: string;
  context: string;
  solution: string;
  before: readonly string[];
  after: readonly string[];
  features: readonly CaseFeatureGroup[];
  flow: readonly CaseFlowStep[];
  outcomes: readonly string[];
  screens: readonly CaseStudyScreen[];
  screenshot?: ProjectScreenshot;
  relatedSystems: readonly string[];
  serviceRoute: string;
  featured: boolean;
  visual: CaseStudyVisual;
  technicalNotes: readonly string[];
  visibility: ProjectVisibility;
  /**
   * The ONE canonical live URL field. Set only after the owner confirms the
   * production address; it is ignored unless `visibility === 'public'` and it
   * passes `isSafePublicUrl` (https, public host, no credentials or tokens).
   */
  liveUrl?: string;
}

export const caseStudyCategories: { id: CaseStudyCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'business-system', label: 'ระบบธุรกิจ' },
  { id: 'people', label: 'งานบุคคล' },
  { id: 'document-data', label: 'เอกสารและข้อมูล' },
  { id: 'web', label: 'เว็บไซต์และเว็บแอป' }
];

export const workFilters: { id: WorkFilter | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'erp', label: 'ERP' },
  { id: 'hr-payroll', label: 'HR / Payroll' },
  { id: 'documents', label: 'เอกสาร' },
  { id: 'web', label: 'เว็บไซต์' },
  { id: 'automation', label: 'Automation' },
  { id: 'internal-tools', label: 'ระบบภายใน' }
];

export const caseStudyStatusLabels: Record<CaseStudyStatus, string> = {
  'internal-system': 'INTERNAL SYSTEM',
  'custom-system': 'CUSTOM SYSTEM',
  'built-system': 'BUILT SYSTEM'
};

/**
 * Real projects only, written from established repository and owner truth.
 * Client systems are described without client data; outcomes are qualitative
 * because no measured result dataset exists. No URL is guessed: `liveUrl`
 * stays empty until the owner supplies it.
 */
export const caseStudies: readonly CaseStudy[] = [
  {
    id: 'case-erp-inventory',
    slug: 'erp-inventory-costing',
    title: 'ระบบ ERP ต้นทุนอาหารและคลังวัตถุดิบ',
    subtitle: 'ทำให้การรับสินค้า การเคลื่อนไหวสต็อก ต้นทุน และรายงานอ้างอิงข้อมูลชุดเดียวกัน',
    category: 'business-system',
    status: 'custom-system',
    projectType: 'ERP · Food costing & Inventory',
    filters: ['erp'],
    tags: ['Food costing', 'สต็อกและคลัง', 'วัตถุดิบ', 'รายงานต้นทุน'],
    delivered: 'เว็บแอป ERP สำหรับรับเข้า จ่ายออก วัตถุดิบ คลัง และรายงานต้นทุน',
    problem: 'ข้อมูลสต็อก วัตถุดิบ และต้นทุนกระจายอยู่หลายจุด ทำให้ตรวจสอบยอดคงเหลือและต้นทุนย้อนหลังได้ยาก',
    context: 'ระบบต้องรองรับงานรับเข้า จ่ายออก การจัดการวัตถุดิบและส่วนประกอบ ตลอดจนการดูต้นทุนในแต่ละช่วงเวลา โดยผู้ใช้แต่ละบทบาทเห็นและทำงานได้ตามสิทธิ์ของตน',
    solution: 'ออกแบบธุรกรรมให้ทุกการเคลื่อนไหวมีเอกสารต้นทาง เชื่อมยอดสต็อกกับการคำนวณต้นทุน และเก็บประวัติการเปลี่ยนแปลงเพื่อให้รายงานต้นทุนและกำไรตรวจสอบย้อนกลับได้',
    before: ['ข้อมูลอยู่หลายไฟล์หรือหลายจุด', 'ตรวจยอดและต้นทุนด้วยมือ', 'ย้อนหาที่มาของรายการได้ยาก'],
    after: ['ใช้รายการต้นทางชุดเดียวกัน', 'เห็นสต็อกและต้นทุนเป็นลำดับ', 'ตรวจสอบผู้ทำรายการและประวัติได้'],
    features: [
      { title: 'OPERATIONS', items: ['รับเข้า จ่ายออก และโอนย้าย', 'วัตถุดิบและส่วนประกอบ', 'รายการจัดซื้อและรับสินค้า'] },
      { title: 'COSTING', items: ['คำนวณต้นทุนจากรายการจริง', 'ดูต้นทุนย้อนหลังตามช่วงเวลา'] },
      { title: 'CONTROL', items: ['สิทธิ์ตามบทบาท', 'Audit trail ของรายการ'] },
      { title: 'REPORTING', items: ['รายงานยอดคงเหลือ', 'รายงานต้นทุนและกำไรจากรายการต้นทาง'] }
    ],
    flow: [
      { id: 'receive', title: 'รับสินค้า', actor: 'คลังสินค้า', description: 'บันทึกเอกสารรับเข้าและรายการวัตถุดิบหรือสินค้า', output: 'เอกสารรับสินค้า' },
      { id: 'inventory', title: 'อัปเดตสต็อก', actor: 'ระบบ ERP', description: 'เพิ่มยอดคงเหลือจากธุรกรรมที่ยืนยันแล้ว', output: 'ยอดสต็อกปัจจุบัน' },
      { id: 'cost', title: 'คำนวณต้นทุน', actor: 'ระบบ ERP', description: 'นำรายการรับและการใช้วัตถุดิบไปประกอบต้นทุน', output: 'ต้นทุนตามช่วงเวลา' },
      { id: 'report', title: 'ตรวจสอบรายงาน', actor: 'ผู้จัดการ / บัญชี', description: 'ดูยอดและย้อนกลับไปยังเอกสารต้นทาง', output: 'รายงานที่ตรวจสอบที่มาได้' }
    ],
    outcomes: ['ข้อมูลสต็อกและต้นทุนถูกรวมเป็น Workflow เดียว', 'ลดการบันทึกรายการซ้ำระหว่างจุดทำงาน', 'ตรวจสอบรายการย้อนหลังได้ชัดเจนขึ้น'],
    screens: [],
    relatedSystems: ['erp', 'documents', 'webapp'],
    serviceRoute: '/services#business-systems',
    featured: true,
    visual: 'erp',
    technicalNotes: ['เว็บแอปสำหรับงานภายในองค์กร', 'กำหนดสิทธิ์ตามบทบาท', 'เก็บประวัติการเปลี่ยนแปลงของธุรกรรม'],
    visibility: 'client'
  },
  {
    id: 'case-payroll-control',
    slug: 'payroll-monthly-control',
    title: 'ระบบ Payroll และการควบคุมรอบเงินเดือน',
    subtitle: 'เปลี่ยนข้อมูลเวลาและข้อยกเว้นให้เป็นรอบคำนวณที่ตรวจ ทบทวน อนุมัติ และล็อกได้',
    category: 'people',
    status: 'internal-system',
    projectType: 'HR · Payroll',
    filters: ['hr-payroll', 'internal-tools'],
    tags: ['ตรวจเวลาทำงาน', 'คำนวณเงินเดือน', 'อนุมัติ', 'จ่ายและล็อกรอบ'],
    delivered: 'เว็บแอปรอบเงินเดือน ตั้งแต่ตรวจเวลา คำนวณ อนุมัติ จ่าย จนถึงล็อกรอบ',
    problem: 'ข้อมูลเวลาทำงานต้องถูกนำเข้ามาตรวจหลายรอบ โดยเฉพาะรายการขาดเวลาออก ก่อนจะเริ่มคำนวณและอนุมัติเงินเดือนได้',
    context: 'งานรายเดือนมีลำดับที่ชัดเจนตั้งแต่นำเข้าเวลา ตรวจข้อยกเว้น คำนวณ อนุมัติ จ่าย และล็อกรอบ เพื่อป้องกันข้อมูลเปลี่ยนหลังผ่านการตรวจแล้ว',
    solution: 'ออกแบบสถานะของรอบเงินเดือนให้แต่ละขั้นมีผู้รับผิดชอบและผลลัพธ์ชัดเจน พร้อมแยกรายการผิดปกติให้ตรวจได้ก่อนเข้าสู่การคำนวณ',
    before: ['รวมข้อมูลเวลาจากหลายรายการ', 'ตรวจรายการผิดปกติด้วยมือ', 'สถานะของรอบไม่ชัดเจน'],
    after: ['มีลำดับงานรายเดือนเดียวกัน', 'แยกรายการขาดเวลาออกให้ตรวจ', 'อนุมัติและล็อกรอบอย่างเป็นขั้นตอน'],
    features: [
      { title: 'ATTENDANCE', items: ['นำเข้าข้อมูลเวลา', 'ตรวจ Missing checkout', 'ทบทวนข้อยกเว้น'] },
      { title: 'CALCULATION', items: ['คำนวณตามรอบ', 'แสดงรายการให้ตรวจสอบก่อนยืนยัน'] },
      { title: 'APPROVAL', items: ['ส่งรอบเพื่ออนุมัติ', 'บันทึกสถานะและผู้ดำเนินการ'] },
      { title: 'CONTROL', items: ['ยืนยันการจ่าย', 'ล็อกรอบหลังดำเนินการเสร็จ'] }
    ],
    flow: [
      { id: 'import', title: 'นำเข้าเวลา', actor: 'HR', description: 'นำข้อมูล Attendance เข้าสู่รอบประจำเดือน', output: 'ข้อมูลเวลาของรอบ' },
      { id: 'review', title: 'ตรวจรายการ', actor: 'HR', description: 'ตรวจข้อยกเว้นและรายการที่ไม่มีเวลาออก', output: 'รายการพร้อมคำนวณ' },
      { id: 'calculate', title: 'คำนวณ', actor: 'ระบบ Payroll', description: 'คำนวณรายการเงินเดือนจากข้อมูลที่ผ่านการตรวจ', output: 'ผลคำนวณฉบับตรวจสอบ' },
      { id: 'approve', title: 'อนุมัติ', actor: 'ผู้มีสิทธิ์อนุมัติ', description: 'ทบทวนและยืนยันรอบก่อนดำเนินการจ่าย', output: 'รอบที่อนุมัติแล้ว' },
      { id: 'pay', title: 'ดำเนินการจ่าย', actor: 'HR / การเงิน', description: 'ใช้ข้อมูลรอบที่อนุมัติสำหรับขั้นตอนการจ่าย', output: 'สถานะการจ่าย' },
      { id: 'lock', title: 'ล็อกรอบ', actor: 'ระบบ Payroll', description: 'ปิดการแก้ไขรอบที่เสร็จสมบูรณ์', output: 'รอบเงินเดือนที่ล็อกแล้ว' }
    ],
    outcomes: ['เห็นสถานะของรอบเงินเดือนได้ชัดเจน', 'ตรวจรายการผิดปกติก่อนการคำนวณ', 'ทบทวนและตรวจสอบรอบย้อนหลังได้ง่ายขึ้น'],
    screens: [],
    relatedSystems: ['payroll', 'hr-line-bot', 'webapp'],
    serviceRoute: '/services#payroll',
    featured: true,
    visual: 'payroll',
    technicalNotes: ['React · Vite · Fastify · Prisma · MySQL', 'ส่งออกรายงานเป็น Excel และ PDF', 'แยกสิทธิ์ผู้เตรียมและผู้อนุมัติ พร้อมประวัติการดำเนินการของรอบ'],
    visibility: 'internal'
  },
  {
    id: 'case-hr-line',
    slug: 'hr-line-leave-approval',
    title: 'ระบบ HR ผ่าน LINE สำหรับคำขอลา',
    subtitle: 'ให้พนักงานส่งคำขอ หัวหน้าพิจารณา และ HR ติดตามข้อมูลผ่านเส้นทางเดียวกัน',
    category: 'people',
    status: 'custom-system',
    projectType: 'HR · LINE Bot',
    filters: ['hr-payroll', 'automation'],
    tags: ['LINE Official Account', 'คำขอลา', 'อนุมัติโดยหัวหน้า', 'แจ้งเตือนอัตโนมัติ'],
    delivered: 'LINE Bot และระบบกลางสำหรับคำขอลา การอนุมัติ การแจ้งเตือน และข้อมูลเวลาทำงาน',
    problem: 'คำขอของพนักงานและการอนุมัติที่กระจายในข้อความทำให้ตรวจสถานะและนำข้อมูลไปใช้ต่อได้ยาก',
    context: 'พนักงานเริ่มงานผ่าน LINE ที่คุ้นเคย แต่กฎการลา สิทธิ์ของผู้อนุมัติ และข้อมูลสำหรับตรวจสอบยังต้องอยู่ในระบบกลาง ไม่ได้เก็บอยู่ในข้อความเพียงอย่างเดียว',
    solution: 'สร้าง Flow ตั้งแต่รับคำขอ ตรวจเงื่อนไข ส่งให้ผู้จัดการ ออกการแจ้งเตือน และบันทึกผลไว้เป็นข้อมูลที่ HR ตรวจสอบหรือส่งต่อไปยัง Payroll ได้',
    before: ['คำขออยู่ในข้อความหลายห้อง', 'ต้องถามซ้ำว่าอนุมัติแล้วหรือยัง', 'รวบรวมข้อมูลไปใช้ต่อด้วยมือ'],
    after: ['คำขอมีสถานะและเลขอ้างอิง', 'ผู้จัดการเห็นงานที่ต้องพิจารณา', 'ผลอนุมัติถูกเก็บเป็นข้อมูลกลาง'],
    features: [
      { title: 'EMPLOYEE', items: ['ส่งคำขอลาผ่าน LINE', 'รับผลการดำเนินการ'] },
      { title: 'VALIDATION', items: ['ตรวจข้อมูลที่จำเป็น', 'ตรวจเส้นทางผู้อนุมัติ'] },
      { title: 'MANAGER', items: ['พิจารณาคำขอ', 'อนุมัติหรือไม่อนุมัติ'] },
      { title: 'AUDIT', items: ['บันทึกเหตุการณ์', 'ข้อมูลพร้อมใช้กับงาน HR และเวลาทำงาน'] }
    ],
    flow: [
      { id: 'request', title: 'ส่งคำขอ', actor: 'พนักงาน', description: 'ระบุประเภทและช่วงวันที่ต้องการลา', output: 'คำขอลา' },
      { id: 'validate', title: 'ตรวจสอบ', actor: 'ระบบ HR', description: 'ตรวจข้อมูลที่จำเป็นและผู้อนุมัติที่เกี่ยวข้อง', output: 'คำขอพร้อมพิจารณา' },
      { id: 'manager', title: 'พิจารณา', actor: 'ผู้จัดการ', description: 'อนุมัติหรือไม่อนุมัติตามข้อมูลในคำขอ', output: 'ผลการพิจารณา' },
      { id: 'notify', title: 'แจ้งผล', actor: 'LINE BOT', description: 'ส่งสถานะกลับให้พนักงานและผู้เกี่ยวข้อง', output: 'การแจ้งเตือน' },
      { id: 'audit', title: 'บันทึกข้อมูล', actor: 'ระบบ HR', description: 'เก็บผลและเหตุการณ์เพื่อการตรวจสอบและใช้ต่อ', output: 'ข้อมูลวันลาและ Audit trail' }
    ],
    outcomes: ['คำขอและผลอนุมัติอยู่ในเส้นทางเดียวกัน', 'ลดการถามสถานะซ้ำระหว่างพนักงานกับ HR', 'ข้อมูลพร้อมนำไปใช้กับงานบุคคลและเงินเดือน'],
    screens: [],
    relatedSystems: ['hr-line-bot', 'payroll'],
    serviceRoute: '/services#hr-line-bot',
    featured: false,
    visual: 'hrLine',
    technicalNotes: ['เชื่อมผ่าน LINE Official Account โดยไม่เปิดเผย Token หรือ Group ID', 'แยกกฎ HR และสิทธิ์ผู้จัดการออกจากหน้าสนทนา', 'เก็บเหตุการณ์สำคัญสำหรับการตรวจสอบ'],
    visibility: 'client'
  },
  {
    id: 'case-document-flow',
    slug: 'document-file-workflow',
    title: 'ระบบอนุมัติเอกสาร',
    subtitle: 'ส่งตรวจ อนุมัติ ส่งกลับแก้ไข และส่งใหม่ โดยทุกขั้นมีสถานะและประวัติ',
    category: 'document-data',
    status: 'custom-system',
    projectType: 'Documents · Approval workflow',
    filters: ['documents', 'automation'],
    tags: ['Approval', 'Revision', 'Resubmit', 'Audit trail'],
    delivered: 'Workflow เอกสารตั้งแต่ส่งตรวจ อนุมัติ ส่งกลับแก้ไข จนถึงส่งใหม่ พร้อมประวัติทุกขั้น',
    problem: 'เอกสารหลายเวอร์ชันส่งต่อกันหลายช่องทาง ทำให้ไม่ชัดว่าไฟล์ใดกำลังรอตรวจ ต้องแก้ไข หรือเป็นฉบับที่อนุมัติแล้ว',
    context: 'ระบบต้องรองรับวงจร Upload, Review, Approve, Reject, Revise และ Resubmit ของเอกสาร โดยผู้จัดทำ ผู้ตรวจ และผู้อนุมัติเห็นงานของตนเอง',
    solution: 'ออกแบบสถานะ Workflow ให้ทุกการทบทวนหรือแก้ไขมีร่องรอย เก็บเหตุผลการส่งกลับไว้กับตัวเอกสาร และให้ฉบับที่ส่งใหม่ต่อจากประวัติเดิม',
    before: ['ส่งไฟล์ต่อกันหลายช่องทาง', 'ไม่ชัดว่าเวอร์ชันใดเป็นฉบับล่าสุด', 'การอนุมัติและเหตุผลแยกจากตัวเอกสาร'],
    after: ['สถานะ Review และ Approval ชัดเจน', 'เหตุผลการแก้ไขอยู่กับเอกสาร', 'ย้อนดูเวอร์ชันและผู้ดำเนินการได้'],
    features: [
      { title: 'SUBMIT', items: ['อัปโหลดพร้อมข้อมูลประกอบ', 'ส่งตรวจตามเส้นทาง'] },
      { title: 'REVIEW', items: ['Review, Approve, Reject', 'ข้อคิดเห็นของผู้ตรวจ'] },
      { title: 'REVISION', items: ['ส่งกลับแก้ไข', 'Resubmit ต่อจากฉบับเดิม'] },
      { title: 'TRACEABILITY', items: ['ประวัติสถานะเอกสาร', 'Audit trail ของการดำเนินการ'] }
    ],
    flow: [
      { id: 'upload', title: 'อัปโหลด', actor: 'ผู้จัดทำ', description: 'เพิ่มไฟล์พร้อมหมวดหมู่และข้อมูลประกอบ', output: 'เอกสารฉบับส่งตรวจ' },
      { id: 'review', title: 'ทบทวน', actor: 'ผู้ตรวจ', description: 'ตรวจเนื้อหาและข้อมูลของเอกสาร', output: 'ข้อคิดเห็นหรือผลทบทวน' },
      { id: 'decision', title: 'ตัดสินใจ', actor: 'ผู้อนุมัติ', description: 'อนุมัติ ปฏิเสธ หรือส่งกลับให้แก้ไข', output: 'สถานะเอกสาร' },
      { id: 'revise', title: 'แก้ไขและส่งใหม่', actor: 'ผู้จัดทำ', description: 'ปรับเอกสารตามข้อคิดเห็นและ Resubmit', output: 'เอกสารฉบับปรับปรุง' },
      { id: 'audit', title: 'เก็บประวัติ', actor: 'ระบบเอกสาร', description: 'บันทึกเวอร์ชัน สถานะ และผู้ดำเนินการ', output: 'Audit trail ที่ตรวจสอบได้' }
    ],
    outcomes: ['เอกสารและสถานะอยู่ในเส้นทางเดียวกัน', 'ลดการถามว่าไฟล์ใดคือฉบับล่าสุด', 'ย้อนดูการตัดสินใจและเหตุผลได้'],
    screens: [],
    relatedSystems: ['documents', 'webapp'],
    serviceRoute: '/services#document-management',
    featured: false,
    visual: 'documents',
    technicalNotes: ['กำหนดสิทธิ์ตามบทบาท', 'จัดเก็บข้อมูลกำกับเอกสารแยกจากไฟล์', 'ทุกการเปลี่ยนสถานะบันทึกผู้ดำเนินการและเวลา'],
    visibility: 'client'
  },
  {
    id: 'case-nas-storage',
    slug: 'nas-file-storage',
    title: 'ระบบจัดเก็บไฟล์กลาง (NAS)',
    subtitle: 'รวมไฟล์ขององค์กรไว้ในที่เดียว พร้อมหมวดหมู่ สิทธิ์การเข้าถึง และการค้นคืน',
    category: 'document-data',
    status: 'internal-system',
    projectType: 'Documents · File storage',
    filters: ['documents', 'internal-tools'],
    tags: ['พื้นที่ไฟล์กลาง', 'สิทธิ์ตามผู้ใช้', 'ค้นหาและเรียกดู', 'ใช้งานบนมือถือ'],
    delivered: 'เว็บแอปจัดเก็บไฟล์กลาง พร้อมหมวดหมู่ สิทธิ์ตามผู้ใช้ และการค้นคืนไฟล์',
    problem: 'เอกสารกระจายอยู่หลายที่ ค้นหายาก และไม่มีการกำหนดสิทธิ์การเข้าถึงที่ชัดเจน',
    context: 'ทีมต้องเข้าถึงไฟล์เดียวกันจากหลายอุปกรณ์ โดยแต่ละคนเห็นเฉพาะพื้นที่ที่ตนมีสิทธิ์ และค้นคืนไฟล์ได้โดยไม่ต้องรู้ว่าเก็บอยู่โฟลเดอร์ไหน',
    solution: 'รวมเอกสารไว้ในที่เก็บกลางที่มีหมวดหมู่ สิทธิ์การเข้าถึง และการค้นหา โดยแยกข้อมูลกำกับไฟล์ออกจากตัวไฟล์ และใช้ Object storage สำหรับเก็บไฟล์',
    before: ['ไฟล์กระจายในหลายเครื่องและโฟลเดอร์', 'ไม่มีสิทธิ์เข้าถึงที่ชัดเจน', 'ค้นไฟล์เก่าได้ยาก'],
    after: ['พื้นที่จัดเก็บและหมวดหมู่กลาง', 'สิทธิ์ตามผู้ใช้หรือบทบาท', 'ค้นหาและเรียกดูไฟล์ได้จากที่เดียว'],
    features: [
      { title: 'STORAGE', items: ['โฟลเดอร์และหมวดหมู่ที่มีโครงสร้าง', 'อัปโหลดและดาวน์โหลดไฟล์'] },
      { title: 'ACCESS', items: ['สิทธิ์เข้าถึงตามผู้ใช้หรือบทบาท', 'ควบคุมการเปิดและจัดการไฟล์'] },
      { title: 'FIND', items: ['ค้นหาและเรียกดูไฟล์', 'ข้อมูลกำกับไฟล์'] },
      { title: 'DEVICES', items: ['ใช้งานผ่านเว็บเบราว์เซอร์', 'ติดตั้งเป็นเว็บแอปบนมือถือได้'] }
    ],
    flow: [
      { id: 'upload', title: 'อัปโหลด', actor: 'ผู้ใช้', description: 'เพิ่มไฟล์เข้าพื้นที่ที่ตนมีสิทธิ์', output: 'ไฟล์ในพื้นที่กลาง' },
      { id: 'organize', title: 'จัดหมวดหมู่', actor: 'ผู้ใช้ / ผู้ดูแล', description: 'จัดไฟล์ตามโฟลเดอร์และหมวดหมู่', output: 'โครงสร้างไฟล์ที่ค้นได้' },
      { id: 'access', title: 'กำหนดสิทธิ์', actor: 'ผู้ดูแลระบบ', description: 'กำหนดว่าใครเห็นหรือจัดการพื้นที่ใดได้', output: 'สิทธิ์การเข้าถึง' },
      { id: 'find', title: 'ค้นคืน', actor: 'ผู้ใช้', description: 'ค้นหาและเปิดไฟล์จากเว็บหรือมือถือ', output: 'ไฟล์ที่ต้องการ' }
    ],
    outcomes: ['ไฟล์ขององค์กรอยู่ในที่เดียว', 'แยกสิทธิ์การเข้าถึงได้ชัดเจนขึ้น', 'ค้นคืนไฟล์ได้ง่ายขึ้น'],
    screens: [],
    relatedSystems: ['nas-files', 'documents'],
    serviceRoute: '/services#document-management',
    featured: false,
    visual: 'documents',
    technicalNotes: ['React · Vite · Fastify · Prisma · MySQL', 'เก็บไฟล์บน S3-compatible object storage', 'ติดตั้งเป็นเว็บแอป (PWA) บนมือถือได้'],
    visibility: 'internal'
  },
  {
    id: 'case-corporate-web',
    slug: 'corporate-website-system',
    title: 'เว็บไซต์องค์กร PDA BLISS',
    subtitle: 'เว็บไซต์ที่จัดโครงสร้างบริการ ผลงาน และช่องทางติดต่อ พร้อมแยกพื้นที่ส่วนตัวออกจากเนื้อหาสาธารณะ',
    category: 'web',
    status: 'built-system',
    projectType: 'Website · Corporate',
    filters: ['web'],
    tags: ['เว็บไซต์องค์กร', 'Responsive', 'แบบฟอร์มติดต่อ + API', 'SEO'],
    delivered: 'เว็บไซต์องค์กร Responsive พร้อมแบบฟอร์มติดต่อที่เชื่อม API และแยกพื้นที่ส่วนตัว',
    problem: 'บริษัทต้องการช่องทางกลางที่อธิบายบริการและระบบที่พัฒนาได้อย่างชัดเจน พร้อมทางเข้าสำหรับพื้นที่ลูกค้าที่ไม่ปะปนกับเว็บไซต์สาธารณะ',
    context: 'งานไม่ได้มีเพียงการออกแบบหน้าจอ แต่รวมถึงโครงสร้างเนื้อหา Responsive behavior, SEO metadata, แบบฟอร์มติดต่อ และขอบเขตระหว่าง Corporate site กับ Private routes',
    solution: 'วาง Information architecture จากโจทย์ของผู้เข้าชม สร้าง Design system สีเขียว-ขาว-กราไฟต์ และพัฒนาเป็นเว็บ Responsive ที่แยก Public shell กับ Private shell อย่างชัดเจน พร้อม Production build สำหรับขั้นตอนนำขึ้นระบบ',
    before: ['ต้องอธิบายบริการหลายประเภทโดยไม่มีโครงสร้างกลาง', 'ผลงานและช่องทางติดต่อยังไม่อยู่ใน Journey เดียวกัน', 'พื้นที่สาธารณะและส่วนตัวต้องกำหนดขอบเขตให้ชัด'],
    after: ['บริการ ระบบ และผลงานมีโครงสร้างเดียวกัน', 'ผู้เข้าชมไปต่อยังบริการหรือการติดต่อได้', 'Public และ Private route ใช้คนละ Shell'],
    features: [
      { title: 'CONTENT', items: ['โครงสร้างบริการและระบบ', 'ผลงานและบทความ'] },
      { title: 'EXPERIENCE', items: ['Responsive design', 'Navigation และ Motion ที่สอดคล้องกัน'] },
      { title: 'BUSINESS', items: ['แบบฟอร์มติดต่อเชื่อม API', 'เส้นทางไปยังบริการที่เกี่ยวข้อง'] },
      { title: 'BOUNDARY', items: ['Public corporate shell', 'Private route และ SEO noindex'] }
    ],
    flow: [
      { id: 'discover', title: 'เข้าใจเป้าหมาย', actor: 'ทีมธุรกิจ', description: 'กำหนดว่าผู้เข้าชมต้องเข้าใจและไปต่อที่ไหน', output: 'เป้าหมายและเนื้อหาหลัก' },
      { id: 'structure', title: 'วางโครงสร้าง', actor: 'ทีมออกแบบระบบ', description: 'จัดบริการ ระบบ ผลงาน และเนื้อหาเป็นเส้นทางเดียวกัน', output: 'Information architecture' },
      { id: 'design', title: 'ออกแบบประสบการณ์', actor: 'Design / Frontend', description: 'สร้างภาพลักษณ์และ Responsive behavior', output: 'Design system และหน้าจอ' },
      { id: 'build', title: 'พัฒนา', actor: 'Frontend / Backend', description: 'พัฒนาหน้าสาธารณะ แบบฟอร์ม และขอบเขต Private route', output: 'เว็บไซต์ที่ทำงานได้' },
      { id: 'verify', title: 'ตรวจสอบ', actor: 'ทีมพัฒนา', description: 'ทดสอบ Route, Accessibility, Responsive และ Production build', output: 'Build ที่พร้อมสำหรับการนำขึ้นระบบ' }
    ],
    outcomes: ['สื่อสารบริการและระบบได้เป็นโครงสร้างเดียวกัน', 'รองรับการใช้งานตั้งแต่มือถือถึงจอขนาดใหญ่', 'แยกประสบการณ์องค์กรกับพื้นที่ส่วนตัวอย่างชัดเจน'],
    screens: [],
    screenshot: {
      src: '/images/work/pdabliss-website.webp',
      srcSmall: '/images/work/pdabliss-website-800.webp',
      alt: 'หน้าแรกของเว็บไซต์ PDA BLISS',
      width: 1600,
      height: 1000,
      reviewed: true
    },
    relatedSystems: ['website', 'webapp'],
    serviceRoute: '/services#websites',
    featured: true,
    visual: 'website',
    technicalNotes: ['React · TypeScript · Vite · Fastify', 'หน้า Corporate ถูกแยกจาก Private bundle ด้วย Lazy routes', 'Canonical-ready metadata และ noindex สำหรับเส้นทางส่วนตัว'],
    visibility: 'public'
    /* OWNER URL REQUIRED: the production domain has not been confirmed. */
  },
  {
    id: 'case-s2-website',
    slug: 's2-accounting-website',
    title: 'เว็บไซต์ S2 Accounting & Finance Advisory',
    subtitle: 'เว็บไซต์บริษัทบริการบัญชี ภาษี การเงิน และที่ปรึกษาธุรกิจ',
    category: 'web',
    status: 'built-system',
    projectType: 'Website · Professional services',
    filters: ['web'],
    tags: ['เว็บไซต์องค์กร', 'หน้าบริการ', 'แบบฟอร์มติดต่อ', 'Responsive'],
    delivered: 'เว็บไซต์องค์กรแยก Frontend และ Backend พร้อมหน้าบริการและแบบฟอร์มติดต่อ',
    problem: 'ต้องการช่องทางออนไลน์ที่อธิบายบริการด้านบัญชี ภาษี และการเงิน และทำให้ลูกค้าติดต่อเข้ามาได้โดยตรง',
    context: 'บริการของสำนักงานมีหลายหมวด ผู้เข้าชมต้องหาบริการที่ตรงกับตนเองได้เร็ว และส่งข้อมูลติดต่อได้จากทุกอุปกรณ์',
    solution: 'ออกแบบโครงสร้างเนื้อหาตามบริการจริงของสำนักงาน แยก Frontend กับ Backend โดยให้ Frontend คุยกับ Backend ผ่าน REST API เท่านั้น พร้อมแบบฟอร์มติดต่อที่ตรวจข้อมูลก่อนส่ง',
    before: ['บริการหลายหมวดยังไม่มีหน้ากลาง', 'ลูกค้าติดต่อผ่านช่องทางกระจัดกระจาย', 'ต้องใช้งานได้ดีบนมือถือ'],
    after: ['หน้าบริการแยกตามหมวด', 'แบบฟอร์มติดต่อส่งเข้าระบบโดยตรง', 'แสดงผลได้ทุกขนาดหน้าจอ'],
    features: [
      { title: 'CONTENT', items: ['หน้าบริการและรายละเอียด', 'ข้อมูลบริษัท'] },
      { title: 'CONTACT', items: ['แบบฟอร์มติดต่อ', 'ตรวจข้อมูลก่อนส่ง'] },
      { title: 'EXPERIENCE', items: ['Responsive design', 'Motion ที่ไม่รบกวนเนื้อหา'] },
      { title: 'BACKEND', items: ['REST API แยกจากหน้าเว็บ', 'จำกัดอัตราการส่งและตั้งค่าความปลอดภัยพื้นฐาน'] }
    ],
    flow: [
      { id: 'content', title: 'จัดเนื้อหา', actor: 'ทีมธุรกิจ', description: 'จัดบริการของสำนักงานเป็นหมวดที่ค้นได้', output: 'โครงสร้างหน้าบริการ' },
      { id: 'design', title: 'ออกแบบ', actor: 'Design / Frontend', description: 'ออกแบบหน้าเว็บให้อ่านง่ายทุกอุปกรณ์', output: 'หน้าจอ Responsive' },
      { id: 'build', title: 'พัฒนา', actor: 'Frontend / Backend', description: 'พัฒนาหน้าเว็บและ API สำหรับแบบฟอร์มติดต่อ', output: 'เว็บไซต์และ API' },
      { id: 'verify', title: 'ตรวจสอบ', actor: 'ทีมพัฒนา', description: 'ทดสอบการแสดงผลและการส่งแบบฟอร์ม', output: 'เว็บไซต์พร้อมใช้งาน' }
    ],
    outcomes: ['ลูกค้าเห็นบริการครบในที่เดียว', 'ติดต่อเข้ามาได้โดยตรงจากเว็บไซต์', 'ใช้งานได้ดีตั้งแต่มือถือถึงเดสก์ท็อป'],
    screens: [],
    relatedSystems: ['website'],
    serviceRoute: '/services#websites',
    featured: false,
    visual: 'website',
    technicalNotes: ['Next.js · React · TypeScript · Tailwind CSS', 'Backend: Express + TypeScript REST API', 'ตรวจข้อมูลแบบฟอร์มด้วย Schema ทั้งฝั่งหน้าเว็บและ API'],
    visibility: 'public'
    /* OWNER URL REQUIRED: the production domain has not been confirmed. */
  }
];

/** Home preview: a representative spread, not the whole page. */
export const homeWorkPreview: readonly CaseStudy[] = [
  ...caseStudies.filter((study) => study.featured),
  ...caseStudies.filter((study) => study.slug === 'hr-line-leave-approval')
];

export type ProjectLink =
  | { kind: 'live'; href: string; host: string; label: string }
  | { kind: 'case-study'; href: string; label: string };

/**
 * How a visitor opens a project. A live link exists only for a public project
 * whose `liveUrl` passes the safety gate; everything else opens its case study.
 */
export function projectLiveLink(study: CaseStudy): Extract<ProjectLink, { kind: 'live' }> | null {
  if (study.visibility !== 'public' || !isSafePublicUrl(study.liveUrl)) return null;
  return {
    kind: 'live',
    href: study.liveUrl,
    host: displayHost(study.liveUrl),
    label: study.category === 'web' ? 'ดูเว็บไซต์จริง' : 'ดูระบบจริง'
  };
}

export function projectCaseLink(study: CaseStudy): Extract<ProjectLink, { kind: 'case-study' }> {
  return { kind: 'case-study', href: `/work/${study.slug}`, label: 'ดู Case Study' };
}

/** Plain-language access note shown on every project. */
export function projectAccessNote(study: CaseStudy): string {
  if (projectLiveLink(study)) return 'เปิดดูได้สาธารณะ';
  if (study.visibility === 'internal') return 'ระบบภายในองค์กร · ไม่เปิดสาธารณะ';
  if (study.visibility === 'client') return 'ระบบของลูกค้า · ไม่เปิดสาธารณะ';
  return 'เว็บไซต์สาธารณะ';
}

export function projectsForFilter(filter: WorkFilter | 'all', items: readonly CaseStudy[] = caseStudies): readonly CaseStudy[] {
  return filter === 'all' ? items : items.filter((study) => study.filters.includes(filter));
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudyForSystem(systemId: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.relatedSystems.includes(systemId));
}
