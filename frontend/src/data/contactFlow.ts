import { caseStudies } from './caseStudies';
import { services } from './services';
import { businessSystems } from './systemUniverse';
import { payloadSourceContext, type ContactServiceId } from './contactRouting';

export { contactHref, payloadSourceContext, resolveContactPrefill, systemToContactService } from './contactRouting';
export type { ContactServiceId } from './contactRouting';

export type ContactQuestionKind = 'text' | 'single' | 'multi';

export interface ContactOption {
  value: string;
  label: string;
}

export interface ContactQuestion {
  id: string;
  label: string;
  helper?: string;
  kind: ContactQuestionKind;
  options?: readonly ContactOption[];
  placeholder?: string;
}

export interface ContactIntent {
  id: ContactServiceId;
  label: string;
  shortLabel: string;
  description: string;
  questions: readonly ContactQuestion[];
}

export const contactSteps = [
  { id: 'intent', label: 'สิ่งที่ต้องการ' },
  { id: 'situation', label: 'สถานการณ์ตอนนี้' },
  { id: 'outcome', label: 'ผลลัพธ์ที่อยากได้' },
  { id: 'contact', label: 'ช่องทางติดต่อ' },
  { id: 'review', label: 'ตรวจสอบ' }
] as const;

const choices = (...entries: Array<[string, string]>): ContactOption[] => entries.map(([value, label]) => ({ value, label }));

export const contactIntents: readonly ContactIntent[] = [
  {
    id: 'business-systems', label: 'ERP / ระบบหลังบ้าน', shortLabel: 'ERP',
    description: 'สต็อก ต้นทุน จัดซื้อ รายงาน และงานปฏิบัติการ',
    questions: [
      { id: 'business-type', label: 'ธุรกิจของคุณทำเกี่ยวกับอะไร?', kind: 'text', placeholder: 'เช่น ผลิตสินค้า ค้าส่ง หรือบริการ' },
      { id: 'modules', label: 'ส่วนไหนที่อยากจัดการในระบบ?', kind: 'multi', options: choices(['stock', 'สต็อก'], ['costing', 'ต้นทุน'], ['purchasing', 'จัดซื้อ'], ['reports', 'รายงาน']) },
      { id: 'operational-users', label: 'มีผู้ใช้งานระบบประมาณเท่าไร?', helper: 'ไม่แน่ใจก็ข้ามได้', kind: 'single', options: choices(['under-10', 'ต่ำกว่า 10 คน'], ['10-50', '10–50 คน'], ['51-200', '51–200 คน'], ['over-200', 'มากกว่า 200 คน'], ['unknown', 'ยังไม่แน่ใจ']) }
    ]
  },
  {
    id: 'payroll', label: 'Payroll / HR', shortLabel: 'Payroll / HR',
    description: 'ข้อมูลเวลา การตรวจรอบ คำนวณ อนุมัติ และงานบุคคล',
    questions: [
      { id: 'employee-range', label: 'มีพนักงานประมาณเท่าไร?', kind: 'single', options: choices(['under-20', 'ต่ำกว่า 20 คน'], ['20-100', '20–100 คน'], ['101-500', '101–500 คน'], ['over-500', 'มากกว่า 500 คน'], ['unknown', 'ยังไม่แน่ใจ']) },
      { id: 'attendance-source', label: 'ตอนนี้ข้อมูลเวลามาจากไหน?', kind: 'single', options: choices(['machine', 'เครื่องลงเวลา'], ['spreadsheet', 'Spreadsheet'], ['existing-system', 'ระบบเดิม'], ['none', 'ยังไม่มีระบบ']) },
      { id: 'workforce', label: 'รูปแบบพนักงาน', kind: 'single', options: choices(['monthly', 'รายเดือน'], ['daily', 'รายวัน'], ['mixed', 'มีทั้งสองแบบ']) },
      { id: 'approval', label: 'มีขั้นตอนอนุมัติรอบหรือไม่?', helper: 'ข้ามได้หากยังไม่ได้กำหนด', kind: 'single', options: choices(['yes', 'มี'], ['no', 'ไม่มี'], ['unknown', 'ยังไม่แน่ใจ']) }
    ]
  },
  {
    id: 'websites', label: 'Website', shortLabel: 'Website',
    description: 'เว็บไซต์องค์กร Landing page หรือเว็บไซต์เนื้อหา',
    questions: [
      { id: 'website-type', label: 'ต้องการเว็บไซต์แบบไหน?', kind: 'single', options: choices(['corporate', 'เว็บไซต์องค์กร'], ['landing', 'Landing page'], ['content', 'เว็บไซต์เนื้อหา'], ['other', 'รูปแบบอื่น']) },
      { id: 'domain', label: 'มีโดเมนเดิมหรือยัง?', kind: 'single', options: choices(['yes', 'มีแล้ว'], ['no', 'ยังไม่มี'], ['unknown', 'ยังไม่แน่ใจ']) },
      { id: 'languages', label: 'ต้องการภาษาใดบ้าง?', kind: 'multi', options: choices(['thai', 'ไทย'], ['english', 'อังกฤษ'], ['other', 'ภาษาอื่น']) },
      { id: 'content', label: 'เนื้อหาพร้อมแค่ไหน?', kind: 'single', options: choices(['ready', 'มีเนื้อหาพร้อม'], ['partial', 'มีบางส่วน'], ['need-help', 'ต้องการให้ช่วยวางเนื้อหา']) }
    ]
  },
  {
    id: 'web-applications', label: 'Web Application', shortLabel: 'Web App',
    description: 'ระบบภายใน พอร์ทัลลูกค้า หรือ Workflow บนเว็บ',
    questions: [
      { id: 'audience', label: 'ใครคือผู้ใช้งานหลัก?', kind: 'single', options: choices(['internal', 'ทีมภายใน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']) },
      { id: 'user-range', label: 'มีผู้ใช้งานประมาณเท่าไร?', helper: 'ช่วงคร่าว ๆ ก็เพียงพอ', kind: 'single', options: choices(['under-20', 'ต่ำกว่า 20 คน'], ['20-100', '20–100 คน'], ['over-100', 'มากกว่า 100 คน'], ['unknown', 'ยังไม่แน่ใจ']) },
      { id: 'main-workflow', label: 'Workflow หลักคืออะไร?', kind: 'text', placeholder: 'เช่น รับคำขอ ตรวจสอบ และอนุมัติ' },
      { id: 'data-source', label: 'มีข้อมูลหรือระบบเดิมที่ต้องเชื่อมหรือไม่?', kind: 'text', placeholder: 'ไม่แน่ใจก็ข้ามได้' }
    ]
  },
  {
    id: 'mobile-applications', label: 'Mobile Application', shortLabel: 'Mobile App',
    description: 'แอปสำหรับทีมหน้างานหรือลูกค้าบนมือถือ',
    questions: [
      { id: 'audience', label: 'ใครคือผู้ใช้งานหลัก?', kind: 'single', options: choices(['staff', 'ทีมหน้างาน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']) },
      { id: 'platforms', label: 'ต้องการแพลตฟอร์มใด?', kind: 'single', options: choices(['ios', 'iOS'], ['android', 'Android'], ['both', 'ทั้งสองระบบ']) },
      { id: 'offline', label: 'ต้องใช้งานเมื่อไม่มีสัญญาณหรือไม่?', kind: 'single', options: choices(['yes', 'ต้องการ'], ['no', 'ไม่จำเป็น'], ['unknown', 'ยังไม่แน่ใจ']) }
    ]
  },
  {
    id: 'document-management', label: 'Document / File System', shortLabel: 'เอกสาร / ไฟล์',
    description: 'พื้นที่จัดเก็บ เอกสาร เวอร์ชัน สิทธิ์ และการอนุมัติ',
    questions: [
      { id: 'scope', label: 'ต้องการจัดเก็บ อนุมัติ หรือทั้งสองอย่าง?', kind: 'single', options: choices(['storage', 'จัดเก็บไฟล์'], ['approval', 'อนุมัติเอกสาร'], ['both', 'ทั้งจัดเก็บและอนุมัติ']) },
      { id: 'current-storage', label: 'ตอนนี้จัดเก็บไฟล์ด้วยวิธีไหน?', kind: 'text', placeholder: 'เช่น Shared drive, NAS หรือ Cloud drive' },
      { id: 'roles', label: 'มีกลุ่มผู้ใช้หรือสิทธิ์แบบใดบ้าง?', helper: 'ไม่ต้องระบุชื่อบุคคล', kind: 'text', placeholder: 'เช่น ผู้จัดทำ ผู้ตรวจ ผู้อนุมัติ' }
    ]
  },
  {
    id: 'hr-line-bot', label: 'LINE Bot', shortLabel: 'LINE Bot',
    description: 'คำขอ อนุมัติ แจ้งเตือน หรือรับข้อมูลผ่าน LINE',
    questions: [
      { id: 'audience', label: 'ใครจะใช้งาน Bot?', kind: 'single', options: choices(['employee', 'พนักงาน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']) },
      { id: 'functions', label: 'ต้องการให้ Bot ช่วยเรื่องใด?', kind: 'multi', options: choices(['approval', 'อนุมัติ'], ['notification', 'แจ้งเตือน'], ['form', 'รับข้อมูลหรือแบบฟอร์ม'], ['automation', 'ทำงานอัตโนมัติ']) }
    ]
  },
  {
    id: 'automation', label: 'Automation / Workflow', shortLabel: 'Automation',
    description: 'ลดงานซ้ำ ตั้งงานตามเวลา แจ้งเตือน หรือเชื่อมระบบ',
    questions: [
      { id: 'automation-users', label: 'ใครเกี่ยวข้องกับ Workflow นี้?', kind: 'single', options: choices(['internal', 'ทีมภายใน'], ['customer', 'ลูกค้า'], ['both', 'ทั้งสองกลุ่ม']) },
      { id: 'functions', label: 'งานแบบใดที่อยากทำให้อัตโนมัติ?', kind: 'multi', options: choices(['approval', 'อนุมัติ'], ['notification', 'แจ้งเตือน'], ['form', 'รับข้อมูลหรือแบบฟอร์ม'], ['scheduled', 'งานตามเวลา'], ['integration', 'เชื่อมระบบ']) }
    ]
  },
  {
    id: 'custom-software', label: 'ปรับปรุงระบบเดิม', shortLabel: 'ระบบเดิม',
    description: 'แก้ Workflow รวมข้อมูล หรือพัฒนาระบบที่ใช้อยู่ต่อ',
    questions: [
      { id: 'existing-system', label: 'ตอนนี้ใช้ระบบหรือเครื่องมืออะไรอยู่?', kind: 'text', placeholder: 'ไม่ต้องส่งรหัสผ่านหรือข้อมูลเข้าถึงระบบ' },
      { id: 'improvement-focus', label: 'ส่วนไหนที่อยากปรับปรุงมากที่สุด?', kind: 'text' }
    ]
  },
  {
    id: 'consulting', label: 'ยังไม่แน่ใจ / อยากให้ช่วยแนะนำ', shortLabel: 'ปรึกษา',
    description: 'เริ่มจากโจทย์ก่อน แล้วค่อยช่วยกันเลือกแนวทาง',
    questions: [{ id: 'topic', label: 'อยากเริ่มคุยจากเรื่องไหน?', kind: 'text', placeholder: 'เล่าสั้น ๆ ได้ ไม่ต้องรู้ชื่อเทคโนโลยี' }]
  }
];

export const contactBudgetOptions = choices(
  ['not-defined', 'ยังไม่กำหนด'], ['under-50k', 'ต่ำกว่า 50,000'], ['50k-100k', '50,000–100,000'],
  ['100k-300k', '100,000–300,000'], ['above-300k', '300,000+'], ['discuss-first', 'อยากคุยก่อน']
);

export const contactTimelineOptions = choices(
  ['not-defined', 'ยังไม่กำหนด'], ['within-1-month', 'ภายใน 1 เดือน'], ['1-3-months', '1–3 เดือน'],
  ['3-6-months', '3–6 เดือน'], ['over-6-months', 'มากกว่า 6 เดือน']
);

/**
 * The topic chooser, in the EP38 service order. `file-management` shares the
 * Document / File System intent; the last two are supporting needs, shown
 * smaller, and "not sure" is always offered on its own.
 */
export const intentOrder = {
  core: ['business-systems', 'payroll', 'hr-line-bot', 'document-management', 'web-applications', 'mobile-applications', 'websites'],
  other: ['custom-software', 'automation'],
  notSure: 'consulting'
} as const satisfies { core: readonly ContactServiceId[]; other: readonly ContactServiceId[]; notSure: ContactServiceId };

export function getContactIntent(id: string | null | undefined): ContactIntent | undefined {
  return contactIntents.find((intent) => intent.id === id);
}

export function contactSourceLabel(sourceContext: string | undefined): string | undefined {
  if (!sourceContext) return undefined;
  const [kind, id] = sourceContext.split(':');
  if (kind === 'solutions') return businessSystems.find((system) => system.id === id)?.nameEn;
  if (kind === 'case') return caseStudies.find((study) => study.slug === id)?.title;
  if (kind === 'service') return services.find((service) => service.id === id)?.title;
  return sourceContext === 'home' ? 'หน้าแรก' : undefined;
}

export type ContactDetailValue = string | string[];

export interface GuidedContactPayload {
  contactType: 'guided';
  serviceId: ContactServiceId;
  currentSituation: string;
  desiredOutcome: string;
  projectDetails: Record<string, ContactDetailValue>;
  budgetRange?: string;
  timeline?: string;
  companyName?: string;
  industry?: string;
  existingWebsite?: string;
  contactName: string;
  email?: string;
  phone?: string;
  lineId?: string;
  notes?: string;
  sourceContext?: string;
  website?: string;
}

export interface QuickContactPayload {
  contactType: 'quick';
  serviceId?: ContactServiceId;
  contactName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  lineId?: string;
  notes: string;
  sourceContext?: string;
  website?: string;
}

export type ContactPayload = GuidedContactPayload | QuickContactPayload;

/** Everything the form holds. Field names are the payload's, one to one. */
export interface ContactFormValues {
  serviceId: ContactServiceId | '';
  currentSituation: string;
  desiredOutcome: string;
  projectDetails: Record<string, ContactDetailValue>;
  budgetRange: string;
  timeline: string;
  companyName: string;
  industry: string;
  existingWebsite: string;
  contactName: string;
  email: string;
  phone: string;
  lineId: string;
  notes: string;
  website: string;
}

const clean = (value: string) => value.trim() || undefined;

/**
 * The form → the API payload. EP42 changed the UX, not this contract: the
 * guided, quick and legacy shapes the backend accepts are unchanged, and only a
 * source the API validates is sent (`payloadSourceContext`). The quick form
 * sends what it shows — name, one channel and a message.
 */
export function buildContactPayload(mode: 'guided' | 'quick', values: ContactFormValues, sourceContext?: string): ContactPayload {
  const channels = { email: clean(values.email), phone: clean(values.phone), lineId: clean(values.lineId) };
  const common = {
    contactName: values.contactName.trim(),
    ...channels,
    sourceContext: payloadSourceContext(sourceContext),
    website: values.website
  };
  if (mode === 'quick') {
    return { contactType: 'quick', serviceId: values.serviceId || undefined, ...common, notes: values.notes.trim() };
  }
  if (!values.serviceId) throw new Error('Missing service intent');
  const projectDetails = Object.fromEntries(
    Object.entries(values.projectDetails).filter(([, value]) => (Array.isArray(value) ? value.length : value.trim()))
  );
  return {
    contactType: 'guided', serviceId: values.serviceId, ...common, companyName: clean(values.companyName),
    currentSituation: values.currentSituation.trim(), desiredOutcome: values.desiredOutcome.trim(),
    projectDetails, budgetRange: values.budgetRange, timeline: values.timeline,
    industry: clean(values.industry), existingWebsite: clean(values.existingWebsite), notes: clean(values.notes)
  };
}
