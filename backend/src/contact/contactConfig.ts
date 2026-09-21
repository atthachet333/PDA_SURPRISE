export const contactServiceIds = [
  'business-systems',
  'payroll',
  'websites',
  'web-applications',
  'mobile-applications',
  'document-management',
  'hr-line-bot',
  'automation',
  'custom-software',
  'consulting'
] as const;

export type ContactServiceId = (typeof contactServiceIds)[number];

export const contactServiceLabels: Record<ContactServiceId, string> = {
  'business-systems': 'ERP / ระบบหลังบ้าน',
  payroll: 'Payroll / HR',
  websites: 'Website',
  'web-applications': 'Web Application',
  'mobile-applications': 'Mobile Application',
  'document-management': 'Document / File System',
  'hr-line-bot': 'LINE Bot',
  automation: 'Automation / Workflow',
  'custom-software': 'ปรับปรุงระบบเดิม',
  consulting: 'ยังไม่แน่ใจ / อยากปรึกษา'
};

export const budgetRanges = ['not-defined', 'under-50k', '50k-100k', '100k-300k', 'above-300k', 'discuss-first'] as const;
export const budgetLabels: Record<(typeof budgetRanges)[number], string> = {
  'not-defined': 'ยังไม่กำหนด',
  'under-50k': 'ต่ำกว่า 50,000',
  '50k-100k': '50,000–100,000',
  '100k-300k': '100,000–300,000',
  'above-300k': '300,000+',
  'discuss-first': 'อยากคุยก่อน'
};

export const timelines = ['not-defined', 'within-1-month', '1-3-months', '3-6-months', 'over-6-months'] as const;
export const timelineLabels: Record<(typeof timelines)[number], string> = {
  'not-defined': 'ยังไม่กำหนด',
  'within-1-month': 'ภายใน 1 เดือน',
  '1-3-months': '1–3 เดือน',
  '3-6-months': '3–6 เดือน',
  'over-6-months': 'มากกว่า 6 เดือน'
};

export interface TrustedQuestion {
  label: string;
  options?: Readonly<Record<string, string>>;
}

const optionMap = (entries: readonly (readonly [string, string])[]) => Object.fromEntries(entries);

export const trustedQuestions: Record<ContactServiceId, Readonly<Record<string, TrustedQuestion>>> = {
  'business-systems': {
    'business-type': { label: 'ประเภทธุรกิจ' },
    modules: { label: 'งานที่ต้องการจัดการ', options: optionMap([['stock', 'สต็อก'], ['costing', 'ต้นทุน'], ['purchasing', 'จัดซื้อ'], ['reports', 'รายงาน']]) },
    'operational-users': { label: 'จำนวนผู้ใช้งานโดยประมาณ', options: optionMap([['under-10', 'ต่ำกว่า 10 คน'], ['10-50', '10–50 คน'], ['51-200', '51–200 คน'], ['over-200', 'มากกว่า 200 คน'], ['unknown', 'ยังไม่แน่ใจ']]) }
  },
  payroll: {
    'employee-range': { label: 'จำนวนพนักงานโดยประมาณ', options: optionMap([['under-20', 'ต่ำกว่า 20 คน'], ['20-100', '20–100 คน'], ['101-500', '101–500 คน'], ['over-500', 'มากกว่า 500 คน'], ['unknown', 'ยังไม่แน่ใจ']]) },
    'attendance-source': { label: 'แหล่งข้อมูลเวลา', options: optionMap([['machine', 'เครื่องลงเวลา'], ['spreadsheet', 'Spreadsheet'], ['existing-system', 'ระบบเดิม'], ['none', 'ยังไม่มีระบบ']]) },
    workforce: { label: 'รูปแบบพนักงาน', options: optionMap([['monthly', 'รายเดือน'], ['daily', 'รายวัน'], ['mixed', 'มีทั้งสองแบบ']]) },
    approval: { label: 'มีขั้นตอนอนุมัติหรือไม่', options: optionMap([['yes', 'มี'], ['no', 'ไม่มี'], ['unknown', 'ยังไม่แน่ใจ']]) }
  },
  websites: {
    'website-type': { label: 'ประเภทเว็บไซต์', options: optionMap([['corporate', 'เว็บไซต์องค์กร'], ['landing', 'Landing page'], ['content', 'เว็บไซต์เนื้อหา'], ['other', 'รูปแบบอื่น']]) },
    domain: { label: 'มีโดเมนเดิมหรือไม่', options: optionMap([['yes', 'มีแล้ว'], ['no', 'ยังไม่มี'], ['unknown', 'ยังไม่แน่ใจ']]) },
    languages: { label: 'ภาษาที่ต้องการ', options: optionMap([['thai', 'ไทย'], ['english', 'อังกฤษ'], ['other', 'ภาษาอื่น']]) },
    content: { label: 'ความพร้อมของเนื้อหา', options: optionMap([['ready', 'มีเนื้อหาพร้อม'], ['partial', 'มีบางส่วน'], ['need-help', 'ต้องการให้ช่วยวางเนื้อหา']]) }
  },
  'web-applications': {
    audience: { label: 'ผู้ใช้งานหลัก', options: optionMap([['internal', 'ทีมภายใน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']]) },
    'user-range': { label: 'จำนวนผู้ใช้งานโดยประมาณ', options: optionMap([['under-20', 'ต่ำกว่า 20 คน'], ['20-100', '20–100 คน'], ['over-100', 'มากกว่า 100 คน'], ['unknown', 'ยังไม่แน่ใจ']]) },
    'main-workflow': { label: 'Workflow หลัก' },
    'data-source': { label: 'แหล่งข้อมูลเดิม' }
  },
  'mobile-applications': {
    audience: { label: 'ผู้ใช้งานหลัก', options: optionMap([['staff', 'ทีมหน้างาน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']]) },
    platforms: { label: 'แพลตฟอร์ม', options: optionMap([['ios', 'iOS'], ['android', 'Android'], ['both', 'ทั้งสองระบบ']]) },
    offline: { label: 'ต้องใช้งานเมื่อไม่มีสัญญาณหรือไม่', options: optionMap([['yes', 'ต้องการ'], ['no', 'ไม่จำเป็น'], ['unknown', 'ยังไม่แน่ใจ']]) }
  },
  'document-management': {
    scope: { label: 'ขอบเขตงาน', options: optionMap([['storage', 'จัดเก็บไฟล์'], ['approval', 'อนุมัติเอกสาร'], ['both', 'ทั้งจัดเก็บและอนุมัติ']]) },
    'current-storage': { label: 'วิธีจัดเก็บปัจจุบัน' },
    roles: { label: 'กลุ่มผู้ใช้งานหรือสิทธิ์' }
  },
  'hr-line-bot': {
    audience: { label: 'ผู้ใช้งาน', options: optionMap([['employee', 'พนักงาน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']]) },
    functions: { label: 'งานที่ต้องการ', options: optionMap([['approval', 'อนุมัติ'], ['notification', 'แจ้งเตือน'], ['form', 'รับข้อมูลหรือแบบฟอร์ม'], ['automation', 'ทำงานอัตโนมัติ']]) }
  },
  automation: {
    'automation-users': { label: 'ผู้ใช้งาน', options: optionMap([['internal', 'ทีมภายใน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']]) },
    functions: { label: 'งานที่ต้องการ', options: optionMap([['approval', 'อนุมัติ'], ['notification', 'แจ้งเตือน'], ['form', 'รับข้อมูลหรือแบบฟอร์ม'], ['scheduled', 'งานตามเวลา'], ['integration', 'เชื่อมระบบ']]) }
  },
  'custom-software': {
    'existing-system': { label: 'ระบบที่ใช้อยู่ปัจจุบัน' },
    'improvement-focus': { label: 'ส่วนที่อยากปรับปรุง' }
  },
  consulting: { topic: { label: 'เรื่องที่อยากปรึกษา' } }
};
