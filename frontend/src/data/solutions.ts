export type SolutionCategory = 'operations' | 'people' | 'revenue' | 'insight';

export interface Solution {
  id: string;
  eyebrow: string;
  title: string;
  category: SolutionCategory;
  summary: string;
  /** Concrete business outcomes, written as short Thai phrases. */
  benefits: string[];
  highlights: string[];
  /** Drives the animated UI preview. */
  preview: 'table' | 'kanban' | 'chart' | 'calendar' | 'flow' | 'cards';
}

export const solutionCategories: { id: SolutionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'operations', label: 'งานปฏิบัติการ' },
  { id: 'people', label: 'บุคคล' },
  { id: 'revenue', label: 'งานขาย' },
  { id: 'insight', label: 'ข้อมูลและรายงาน' }
];

export const solutions: Solution[] = [
  {
    id: 'erp',
    eyebrow: 'ERP',
    title: 'ERP / Business Management',
    category: 'operations',
    summary: 'บัญชี จัดซื้อ คลังสินค้า และงานปฏิบัติการ ใช้ข้อมูลชุดเดียวกันที่ตรวจสอบย้อนกลับได้',
    benefits: ['รวมข้อมูลไว้ในระบบเดียว', 'ลดความผิดพลาดตอนปิดงบ', 'ตรวจสอบย้อนหลังได้ทุกรายการ'],
    highlights: ['รองรับหลายบริษัทและหลายสกุลเงิน', 'สายอนุมัติพร้อมการมอบหมายแทน', 'ประวัติเอกสารที่แก้ไขย้อนหลังไม่ได้'],
    preview: 'table'
  },
  {
    id: 'hr-payroll',
    eyebrow: 'HR / PAYROLL',
    title: 'HR / Payroll',
    category: 'people',
    summary: 'กำลังคน วันลา เวลาทำงาน และการคิดเงินเดือน โดยไม่ต้องลุ้นไฟล์ Excel ทุกสิ้นเดือน',
    benefits: ['ลดเวลาทำเงินเดือน', 'คิดค่าแรงและ OT ถูกต้อง', 'พนักงานดูข้อมูลตัวเองได้'],
    highlights: ['รองรับประกันสังคมและภาษีไทย', 'คำนวณกะและค่าล่วงเวลา', 'พอร์ทัลสำหรับพนักงาน'],
    preview: 'calendar'
  },
  {
    id: 'crm',
    eyebrow: 'CRM',
    title: 'CRM',
    category: 'revenue',
    summary: 'ระบบติดตามลูกค้าที่ทีมขายยอมอัปเดต เพราะมันช่วยประหยัดเวลาให้เขาจริง',
    benefits: ['เห็นสถานะดีลแบบ Real-time', 'ไม่มีลูกค้าตกหล่น', 'ต่อใบเสนอราคาเป็นใบแจ้งหนี้ได้ทันที'],
    highlights: ['จัดลำดับและกระจายลูกค้าอัตโนมัติ', 'ใบเสนอราคาถึงใบแจ้งหนี้ในที่เดียว', 'บันทึกการติดต่อจาก LINE และอีเมล'],
    preview: 'kanban'
  },
  {
    id: 'sales-inventory',
    eyebrow: 'SALES & INVENTORY',
    title: 'Sales & Inventory',
    category: 'revenue',
    summary: 'ยอดสต็อกในระบบตรงกับของจริงในคลัง ทุกช่องทาง ตลอดเวลา',
    benefits: ['สต็อกตรงกับหน้างาน', 'ลดของขาดและของค้าง', 'สั่งซื้อซ้ำอัตโนมัติ'],
    highlights: ['จัดสรรข้ามหลายคลัง', 'ติดตามด้วยบาร์โค้ดและล็อต', 'ตั้งจุดสั่งซื้ออัตโนมัติ'],
    preview: 'table'
  },
  {
    id: 'document-workflow',
    eyebrow: 'DOCUMENT WORKFLOW',
    title: 'Document Workflow',
    category: 'operations',
    summary: 'คำขอ การอนุมัติ และการลงนาม ส่งต่ออัตโนมัติพร้อมประวัติครบถ้วน',
    benefits: ['รู้ว่าเอกสารค้างอยู่ที่ใคร', 'ลดเวลารออนุมัติ', 'มีหลักฐานทุกขั้นตอน'],
    highlights: ['เงื่อนไขการส่งต่อตามวงเงินและฝ่าย', 'รองรับลายเซ็นดิจิทัล', 'ตัวจับเวลาและการเร่งรัด'],
    preview: 'flow'
  },
  {
    id: 'approval',
    eyebrow: 'APPROVAL SYSTEM',
    title: 'Approval System',
    category: 'operations',
    summary: 'สายอนุมัติที่ปรับได้เองโดยไม่ต้องรอนักพัฒนา',
    benefits: ['เปลี่ยนเงื่อนไขได้เอง', 'ไม่ติดคอขวดตอนหัวหน้าลา', 'เห็นสถานะทุกคำขอ'],
    highlights: ['กำหนดผู้อนุมัติตามวงเงิน', 'มอบหมายแทนช่วงลาพัก', 'แจ้งเตือนผ่าน LINE และอีเมล'],
    preview: 'flow'
  },
  {
    id: 'tracking',
    eyebrow: 'TRACKING SYSTEM',
    title: 'Tracking System',
    category: 'operations',
    summary: 'ติดตามงาน พัสดุ รถ หรือเคส ได้ตั้งแต่ต้นทางจนจบ',
    benefits: ['ลดสายโทรเข้ามาถามสถานะ', 'รู้ว่างานค้างที่ขั้นตอนไหน', 'มีหลักฐานการส่งมอบ'],
    highlights: ['อัปเดตสถานะจากมือถือหน้างาน', 'ทำงานต่อได้แม้ไม่มีสัญญาณ', 'ลิงก์ติดตามสำหรับลูกค้า'],
    preview: 'cards'
  },
  {
    id: 'booking',
    eyebrow: 'BOOKING',
    title: 'Booking / Reservation',
    category: 'revenue',
    summary: 'จัดการคิว ทรัพยากร และการชำระเงิน สำหรับธุรกิจบริการ',
    benefits: ['ลดการจองซ้ำซ้อน', 'เก็บมัดจำได้ทันที', 'ลดการไม่มาตามนัด'],
    highlights: ['กำหนดความจุและทรัพยากร', 'ลิงก์ชำระเงินและมัดจำ', 'แจ้งเตือนอัตโนมัติก่อนถึงคิว'],
    preview: 'calendar'
  },
  {
    id: 'internal-tools',
    eyebrow: 'INTERNAL TOOLS',
    title: 'Internal Tools',
    category: 'operations',
    summary: 'รวมเครื่องมือภายในที่กระจัดกระจายให้อยู่ในที่เดียว มีสิทธิ์ชัดเจน',
    benefits: ['เข้าระบบด้วย Login เดียว', 'ถอนสิทธิ์ได้จบในที่เดียว', 'รู้ว่าใครแก้อะไรเมื่อไหร่'],
    highlights: ['สิทธิ์ตามบทบาท', 'แก้ไขหลายรายการพร้อมยกเลิกได้', 'ประวัติการเปลี่ยนแปลงทุกรายการ'],
    preview: 'cards'
  },
  {
    id: 'automation',
    eyebrow: 'AUTOMATION',
    title: 'Automation',
    category: 'operations',
    summary: 'งานตามรอบ งานตามเงื่อนไข และการกระทบยอด ที่ทำงานเองแม้ไม่มีใครจำ',
    benefits: ['ลดงานซ้ำในแต่ละวัน', 'ลดความผิดพลาดจากการคีย์มือ', 'รู้ทันทีเมื่อมีอะไรผิดปกติ'],
    highlights: ['Trigger ตามเหตุการณ์และเวลา', 'ลองใหม่อัตโนมัติพร้อมคิวสำรอง', 'แจ้งเตือนเมื่อทำงานล้มเหลว'],
    preview: 'flow'
  },
  {
    id: 'analytics',
    eyebrow: 'ANALYTICS',
    title: 'Analytics Dashboard',
    category: 'insight',
    summary: 'มุมมองผู้บริหารและฝ่ายปฏิบัติการ บนนิยามตัวชี้วัดชุดเดียวกัน',
    benefits: ['ดูข้อมูลแบบ Real-time', 'ทุกฝ่ายใช้ตัวเลขชุดเดียวกัน', 'เจาะดูที่มาของตัวเลขได้'],
    highlights: ['ชั้นนิยามตัวชี้วัด', 'เจาะลึกถึงรายการต้นทาง', 'ส่งรายงานอัตโนมัติทางอีเมล'],
    preview: 'chart'
  },
  {
    id: 'customer-portal',
    eyebrow: 'CUSTOMER PORTAL',
    title: 'Customer Portal',
    category: 'revenue',
    summary: 'ให้ลูกค้าดูคำสั่งซื้อ เอกสาร และสถานะได้เอง โดยไม่ต้องโทรเข้ามา',
    benefits: ['ลดงานตอบคำถามซ้ำ', 'ลูกค้าเห็นสถานะได้ตลอด', 'ดาวน์โหลดเอกสารย้อนหลังได้'],
    highlights: ['บัญชีผู้ใช้ที่ปลอดภัย', 'ติดตามคำสั่งซื้อและการจัดส่ง', 'ประวัติเอกสารทั้งหมด'],
    preview: 'cards'
  }
];

export const solutionsIntro = {
  eyebrow: 'OUR SOLUTIONS',
  title: ['โซลูชันที่ออกแบบ', 'จากปัญหาธุรกิจจริง'],
  lead: 'แต่ละโซลูชันเริ่มจากฐานที่เราพัฒนามาแล้ว ไม่ได้เริ่มจากศูนย์ ระบบที่ออกแบบเฉพาะจึงไม่จำเป็นต้องมีราคาเท่ากับการสร้างใหม่ทั้งหมด'
} as const;
