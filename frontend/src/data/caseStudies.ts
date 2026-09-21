export type CaseStudyCategory = 'business-system' | 'people' | 'document-data' | 'web';
export type CaseStudyStatus = 'internal-system' | 'custom-system' | 'built-system';
export type CaseStudyVisual = 'erp' | 'payroll' | 'hrLine' | 'documents' | 'website';

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

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: CaseStudyCategory;
  status: CaseStudyStatus;
  problem: string;
  context: string;
  solution: string;
  before: readonly string[];
  after: readonly string[];
  features: readonly CaseFeatureGroup[];
  flow: readonly CaseFlowStep[];
  outcomes: readonly string[];
  screens: readonly CaseStudyScreen[];
  relatedSystems: readonly string[];
  serviceRoute: string;
  featured: boolean;
  visual: CaseStudyVisual;
  technicalNotes: readonly string[];
}

export const caseStudyCategories: { id: CaseStudyCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'business-system', label: 'ระบบธุรกิจ' },
  { id: 'people', label: 'งานบุคคล' },
  { id: 'document-data', label: 'เอกสารและข้อมูล' },
  { id: 'web', label: 'เว็บไซต์และเว็บแอป' }
];

export const caseStudyStatusLabels: Record<CaseStudyStatus, string> = {
  'internal-system': 'INTERNAL SYSTEM',
  'custom-system': 'CUSTOM SYSTEM',
  'built-system': 'BUILT SYSTEM'
};

/**
 * Anonymised records built only from established repository and owner truth.
 * Outcomes are qualitative because no measured client-result dataset exists.
 */
export const caseStudies: readonly CaseStudy[] = [
  {
    id: 'case-erp-inventory',
    slug: 'erp-inventory-costing',
    title: 'ระบบ ERP สำหรับสต็อกและต้นทุน',
    subtitle: 'ทำให้การรับสินค้า การเคลื่อนไหวสต็อก ต้นทุน และรายงานอ้างอิงข้อมูลชุดเดียวกัน',
    category: 'business-system',
    status: 'custom-system',
    problem: 'ข้อมูลสต็อก วัตถุดิบ และต้นทุนกระจายอยู่หลายจุด ทำให้ตรวจสอบยอดคงเหลือและต้นทุนย้อนหลังได้ยาก',
    context: 'ระบบต้องรองรับงานรับเข้า จ่ายออก การจัดการวัตถุดิบและส่วนประกอบ ตลอดจนการดูต้นทุนในแต่ละช่วงเวลา โดยผู้ใช้แต่ละบทบาทเห็นและทำงานได้ตามสิทธิ์ของตน',
    solution: 'ออกแบบธุรกรรมให้ทุกการเคลื่อนไหวมีเอกสารต้นทาง เชื่อมยอดสต็อกกับการคำนวณต้นทุน และเก็บประวัติการเปลี่ยนแปลงเพื่อให้รายงานตรวจสอบย้อนกลับได้',
    before: ['ข้อมูลอยู่หลายไฟล์หรือหลายจุด', 'ตรวจยอดและต้นทุนด้วยมือ', 'ย้อนหาที่มาของรายการได้ยาก'],
    after: ['ใช้รายการต้นทางชุดเดียวกัน', 'เห็นสต็อกและต้นทุนเป็นลำดับ', 'ตรวจสอบผู้ทำรายการและประวัติได้'],
    features: [
      { title: 'OPERATIONS', items: ['รับเข้า จ่ายออก และโอนย้าย', 'วัตถุดิบและส่วนประกอบ', 'รายการจัดซื้อและรับสินค้า'] },
      { title: 'COSTING', items: ['คำนวณต้นทุนจากรายการจริง', 'ดูต้นทุนย้อนหลังตามช่วงเวลา'] },
      { title: 'CONTROL', items: ['สิทธิ์ตามบทบาท', 'Audit trail ของรายการ'] },
      { title: 'REPORTING', items: ['รายงานยอดคงเหลือ', 'รายงานต้นทุนและรายการต้นทาง'] }
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
    technicalNotes: ['เว็บแอปสำหรับงานภายในองค์กร', 'กำหนดสิทธิ์ตามบทบาท', 'เก็บประวัติการเปลี่ยนแปลงของธุรกรรม']
  },
  {
    id: 'case-payroll-control',
    slug: 'payroll-monthly-control',
    title: 'ระบบ Payroll และการควบคุมรอบเงินเดือน',
    subtitle: 'เปลี่ยนข้อมูลเวลาและข้อยกเว้นให้เป็นรอบคำนวณที่ตรวจ ทบทวน อนุมัติ และล็อกได้',
    category: 'people',
    status: 'internal-system',
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
    technicalNotes: ['แยกสิทธิ์ผู้เตรียมและผู้อนุมัติ', 'เก็บสถานะของรอบและประวัติการดำเนินการ', 'ข้อมูลเงินเดือนอยู่ในระบบภายในที่มีการควบคุมสิทธิ์']
  },
  {
    id: 'case-hr-line',
    slug: 'hr-line-leave-approval',
    title: 'ระบบ HR ผ่าน LINE สำหรับคำขอลา',
    subtitle: 'ให้พนักงานส่งคำขอ หัวหน้าพิจารณา และ HR ติดตามข้อมูลผ่านเส้นทางเดียวกัน',
    category: 'people',
    status: 'custom-system',
    problem: 'คำขอของพนักงานและการอนุมัติที่กระจายในข้อความทำให้ตรวจสถานะและนำข้อมูลไปใช้ต่อได้ยาก',
    context: 'พนักงานเริ่มงานผ่าน LINE ที่คุ้นเคย แต่กฎการลา สิทธิ์ของผู้อนุมัติ และข้อมูลสำหรับตรวจสอบยังต้องอยู่ในระบบกลาง ไม่ได้เก็บอยู่ในข้อความเพียงอย่างเดียว',
    solution: 'สร้าง Flow ตั้งแต่รับคำขอ ตรวจเงื่อนไข ส่งให้ผู้จัดการ ออกการแจ้งเตือน และบันทึกผลไว้เป็นข้อมูลที่ HR ตรวจสอบหรือส่งต่อไปยัง Payroll ได้',
    before: ['คำขออยู่ในข้อความหลายห้อง', 'ต้องถามซ้ำว่าอนุมัติแล้วหรือยัง', 'รวบรวมข้อมูลไปใช้ต่อด้วยมือ'],
    after: ['คำขอมีสถานะและเลขอ้างอิง', 'ผู้จัดการเห็นงานที่ต้องพิจารณา', 'ผลอนุมัติถูกเก็บเป็นข้อมูลกลาง'],
    features: [
      { title: 'EMPLOYEE', items: ['ส่งคำขอลาผ่าน LINE', 'รับผลการดำเนินการ'] },
      { title: 'VALIDATION', items: ['ตรวจข้อมูลที่จำเป็น', 'ตรวจเส้นทางผู้อนุมัติ'] },
      { title: 'MANAGER', items: ['พิจารณาคำขอ', 'อนุมัติหรือไม่อนุมัติ'] },
      { title: 'AUDIT', items: ['บันทึกเหตุการณ์', 'ข้อมูลพร้อมใช้กับงาน HR'] }
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
    featured: true,
    visual: 'hrLine',
    technicalNotes: ['เชื่อมผ่าน LINE Official Account โดยไม่เปิดเผย Token หรือ Group ID', 'แยกกฎ HR และสิทธิ์ผู้จัดการออกจากหน้าสนทนา', 'เก็บเหตุการณ์สำคัญสำหรับการตรวจสอบ']
  },
  {
    id: 'case-document-flow',
    slug: 'document-file-workflow',
    title: 'ระบบเอกสารและพื้นที่จัดเก็บไฟล์',
    subtitle: 'รวมไฟล์ การทบทวน การอนุมัติ และประวัติเอกสารไว้ในโครงสร้างที่ค้นคืนได้',
    category: 'document-data',
    status: 'custom-system',
    problem: 'เอกสารกระจายอยู่หลายโฟลเดอร์ หลายเวอร์ชัน และหลายช่องทาง ทำให้ไม่ชัดว่าไฟล์ใดกำลังรอตรวจหรือเป็นฉบับล่าสุด',
    context: 'ระบบต้องรองรับทั้งการจัดหมวดหมู่และสิทธิ์เข้าถึงของพื้นที่เก็บไฟล์ รวมถึงวงจร Upload, Review, Approve, Reject, Revise และ Resubmit ของเอกสาร',
    solution: 'ออกแบบพื้นที่จัดเก็บกลางพร้อมข้อมูลกำกับและสถานะ Workflow ให้ทุกการทบทวนหรือแก้ไขมีร่องรอย โดยวางแนวทางสำรองและเรียกคืนตามขอบเขตของโครงการโดยไม่อ้าง SLA ที่ยังไม่มี',
    before: ['ไฟล์กระจายในหลายโฟลเดอร์', 'ไม่ชัดว่าเวอร์ชันใดเป็นฉบับล่าสุด', 'การอนุมัติและเหตุผลแยกจากตัวเอกสาร'],
    after: ['พื้นที่จัดเก็บและหมวดหมู่กลาง', 'สถานะ Review และ Approval ชัดเจน', 'ค้นคืนไฟล์พร้อมประวัติได้'],
    features: [
      { title: 'STORAGE', items: ['โฟลเดอร์และหมวดหมู่ที่มีโครงสร้าง', 'แนวทางสำรองและเรียกคืน'] },
      { title: 'ACCESS', items: ['สิทธิ์เข้าถึงตามผู้ใช้หรือบทบาท', 'ควบคุมการเปิดและจัดการไฟล์'] },
      { title: 'WORKFLOW', items: ['Review, Approve, Reject', 'Revise และ Resubmit'] },
      { title: 'TRACEABILITY', items: ['ประวัติสถานะเอกสาร', 'Audit trail ของการดำเนินการ'] }
    ],
    flow: [
      { id: 'upload', title: 'อัปโหลด', actor: 'ผู้จัดทำ', description: 'เพิ่มไฟล์พร้อมหมวดหมู่และข้อมูลประกอบ', output: 'เอกสารฉบับส่งตรวจ' },
      { id: 'review', title: 'ทบทวน', actor: 'ผู้ตรวจ', description: 'ตรวจเนื้อหาและข้อมูลของเอกสาร', output: 'ข้อคิดเห็นหรือผลทบทวน' },
      { id: 'decision', title: 'ตัดสินใจ', actor: 'ผู้อนุมัติ', description: 'อนุมัติ ปฏิเสธ หรือส่งกลับให้แก้ไข', output: 'สถานะเอกสาร' },
      { id: 'revise', title: 'แก้ไขและส่งใหม่', actor: 'ผู้จัดทำ', description: 'ปรับเอกสารตามข้อคิดเห็นและ Resubmit', output: 'เอกสารฉบับปรับปรุง' },
      { id: 'audit', title: 'เก็บประวัติ', actor: 'ระบบเอกสาร', description: 'บันทึกเวอร์ชัน สถานะ และผู้ดำเนินการ', output: 'Audit trail และไฟล์ที่ค้นคืนได้' }
    ],
    outcomes: ['เอกสารและสถานะอยู่ในพื้นที่เดียวกัน', 'แยกสิทธิ์การเข้าถึงได้ชัดเจนขึ้น', 'ค้นคืนเวอร์ชันและประวัติการดำเนินการได้ง่ายขึ้น'],
    screens: [],
    relatedSystems: ['documents', 'nas-files', 'webapp'],
    serviceRoute: '/services#document-management',
    featured: true,
    visual: 'documents',
    technicalNotes: ['กำหนดสิทธิ์ตามบทบาท', 'จัดเก็บข้อมูลกำกับเอกสารแยกจากไฟล์', 'รูปแบบสำรองและเรียกคืนขึ้นอยู่กับขอบเขตโครงสร้างพื้นฐานของแต่ละโครงการ']
  },
  {
    id: 'case-corporate-web',
    slug: 'corporate-website-system',
    title: 'เว็บไซต์องค์กร PDA BLISS',
    subtitle: 'เว็บไซต์ที่จัดโครงสร้างบริการ ผลงาน และช่องทางติดต่อ พร้อมแยกพื้นที่ส่วนตัวออกจากเนื้อหาสาธารณะ',
    category: 'web',
    status: 'built-system',
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
    relatedSystems: ['website', 'webapp'],
    serviceRoute: '/services#websites',
    featured: false,
    visual: 'website',
    technicalNotes: ['React, TypeScript และ Vite', 'หน้า Corporate ถูกแยกจาก Private bundle ด้วย Lazy routes', 'Canonical-ready metadata และ noindex สำหรับเส้นทางส่วนตัว']
  }
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudyForSystem(systemId: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.relatedSystems.includes(systemId));
}
