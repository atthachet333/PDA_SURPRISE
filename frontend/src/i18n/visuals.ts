import type { VisualSlot } from '@/data/visuals';
import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * Captions for product visuals, keyed by slot id in `data/visuals.ts`.
 *
 * WHAT IS DELIBERATELY NOT TRANSLATED
 *   The miniature interfaces inside `SystemMock` depict the Thai-language
 *   software PDA BLISS delivers to Thai businesses — their row labels are part
 *   of the artwork, like text inside a screenshot, and every such panel carries
 *   the "sample system illustration" notice below. Everything AROUND a visual
 *   (captions, notices, accessible names) is localised.
 */
export const slotTitle: Record<string, LocalizedText> = {
  /* hero */
  'hero-erp': { th: 'ระบบ ERP', en: 'ERP system', zh: 'ERP 系统' },
  'hero-hr': { th: 'ระบบ HR ผ่าน LINE', en: 'HR on LINE', zh: '基于 LINE 的 HR 系统' },
  'hero-docs': { th: 'ระบบจัดเก็บเอกสาร', en: 'Document storage', zh: '文档存储系统' },
  'hero-payroll': { th: 'ระบบเงินเดือน', en: 'Payroll system', zh: '薪资系统' },
  /* showreel */
  'reel-payroll': { th: 'ระบบเงินเดือน', en: 'Payroll system', zh: '薪资系统' },
  'reel-erp': { th: 'ระบบ ERP / การผลิต', en: 'ERP / Production', zh: 'ERP / 生产' },
  'reel-nas': { th: 'พื้นที่จัดเก็บเอกสาร', en: 'Document storage', zh: '文档存储空间' },
  'reel-website': { th: 'เว็บไซต์องค์กร', en: 'Corporate website', zh: '企业网站' },
  'reel-hr': { th: 'HR ผ่าน LINE', en: 'HR on LINE', zh: '基于 LINE 的 HR' },
  'reel-workflow': { th: 'เส้นทางอนุมัติเอกสาร', en: 'Document approval route', zh: '文档审批流程' },
  /* services */
  'svc-erp': { th: 'ระบบ ERP', en: 'ERP system', zh: 'ERP 系统' },
  'svc-payroll': { th: 'ระบบเงินเดือน', en: 'Payroll system', zh: '薪资系统' },
  'svc-web': { th: 'เว็บไซต์องค์กร', en: 'Corporate website', zh: '企业网站' },
  'svc-webapp': { th: 'เว็บแอปพลิเคชัน', en: 'Web application', zh: 'Web 应用' },
  'svc-mobile': { th: 'แอปมือถือ', en: 'Mobile app', zh: '移动应用' },
  'svc-hr': { th: 'HR ผ่าน LINE', en: 'HR on LINE', zh: '基于 LINE 的 HR' },
  'svc-docs': { th: 'ระบบเอกสาร', en: 'Document system', zh: '文档系统' },
  'svc-files': { th: 'ไฟล์กลาง (NAS)', en: 'Central files (NAS)', zh: '集中文件（NAS）' },
  'svc-custom': { th: 'ระบบเฉพาะทาง', en: 'Custom system', zh: '定制系统' },
  'svc-internal': { th: 'ระบบภายใน', en: 'Internal tools', zh: '内部系统' },
  'svc-auto': { th: 'Automation', en: 'Automation', zh: '自动化' },
  'svc-api': { th: 'เชื่อมต่อระบบ', en: 'System integration', zh: '系统对接' },
  'svc-analytics': { th: 'Dashboard', en: 'Dashboard', zh: '数据看板' },
  'svc-cloud': { th: 'โครงสร้างพื้นฐาน', en: 'Infrastructure', zh: '基础设施' },
  'svc-support': { th: 'ดูแลระบบ', en: 'System support', zh: '系统维护' },
  'svc-consult': { th: 'ที่ปรึกษา', en: 'Consulting', zh: '咨询' },
  /* portfolio */
  'pf-payroll': { th: 'ระบบบริหารงานเงินเดือน', en: 'Payroll management system', zh: '薪资管理系统' },
  'pf-erp': { th: 'ระบบ ERP การผลิตและต้นทุน', en: 'Production and costing ERP', zh: '生产与成本 ERP 系统' },
  'pf-s2web': { th: 'เว็บไซต์ S2 Accounting Consultant', en: 'S2 Accounting Consultant website', zh: 'S2 Accounting Consultant 网站' },
  'pf-nas': { th: 'ระบบจัดเก็บเอกสาร S2 NAS', en: 'S2 NAS document storage', zh: 'S2 NAS 文档存储系统' },
  'pf-pdabliss': { th: 'เว็บไซต์องค์กร PDA BLISS', en: 'PDA BLISS corporate website', zh: 'PDA BLISS 企业网站' }
};

/** A slot's caption in `locale`, or its technical label when it has no title. */
export function slotCaption(slot: VisualSlot, locale: Locale): string {
  return slotTitle[slot.id]?.[locale] ?? slot.label;
}

export const visualText = {
  mockNotice: { th: 'ภาพตัวอย่างระบบ', en: 'Sample system illustration', zh: '系统示意图' },
  schematic: { th: 'ภาพจำลองโครงสร้างระบบ', en: 'System structure illustration', zh: '系统结构示意图' },
  schematicAria: {
    th: 'ภาพจำลองโครงสร้างหน้าจอ ไม่มีข้อมูลจริง',
    en: 'Illustration of the screen structure — contains no real data',
    zh: '界面结构示意图，不含真实数据'
  }
} satisfies Record<string, LocalizedText>;

/** Labels inside the schematic case-study illustrations (not the SystemMock panels). */
export const schematicText = {
  erpStages: { th: ['รับสินค้า', 'สต็อก', 'ต้นทุน', 'รายงาน'], en: ['Receiving', 'Stock', 'Cost', 'Reports'], zh: ['收货', '库存', '成本', '报表'] },
  erpModules: { th: ['คลังสินค้า', 'วัตถุดิบ', 'จัดซื้อ', 'ต้นทุน'], en: ['Warehouse', 'Raw materials', 'Purchasing', 'Costing'], zh: ['仓库', '原材料', '采购', '成本'] },
  erpTitle: { th: ['ธุรกรรมสต็อกและต้นทุน'], en: ['Stock and cost transactions'], zh: ['库存与成本交易'] },
  payrollTitle: { th: ['รอบเงินเดือน'], en: ['Pay cycle'], zh: ['薪资周期'] },
  payrollReady: { th: ['พร้อมตรวจ'], en: ['Ready for review'], zh: ['待核对'] },
  payrollSteps: {
    th: ['นำเข้าเวลา', 'ตรวจข้อยกเว้น', 'คำนวณ', 'อนุมัติ', 'ดำเนินการจ่าย', 'ล็อกรอบ'],
    en: ['Import hours', 'Review exceptions', 'Calculate', 'Approve', 'Pay', 'Lock cycle'],
    zh: ['导入考勤', '核对异常', '计算', '审批', '发放', '锁定周期']
  },
  hrChat: {
    th: ['เลือกประเภทคำขอ', 'ส่งคำขอลา', 'คำขอถูกส่งให้ผู้จัดการพิจารณาแล้ว'],
    en: ['Choose a request type', 'Send leave request', 'Your request has been sent to your manager'],
    zh: ['请选择申请类型', '提交请假申请', '申请已提交给主管审批']
  },
  hrTabs: { th: ['คำขอ', 'อนุมัติ', 'แจ้งผล'], en: ['Request', 'Approve', 'Notify'], zh: ['申请', '审批', '通知'] },
  docFolders: {
    th: ['รอตรวจ', 'ต้องแก้ไข', 'อนุมัติแล้ว', 'คลังเอกสาร'],
    en: ['To review', 'Needs changes', 'Approved', 'Archive'],
    zh: ['待审核', '需修改', '已批准', '文档库']
  }
} satisfies Record<string, Record<Locale, readonly string[]>>;
