import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * /solutions page copy. Kept apart from `systemUniverse.ts` (which Home also
 * imports) so it ships only with the lazy Solutions chunk.
 */

type Lines = Record<Locale, readonly string[]>;

/** /solutions — the page around the System Universe map. */
export const solutionsPage = {
  heroLead: {
    th: 'PDA BLISS ออกแบบซอฟต์แวร์ให้ข้อมูลและขั้นตอนของธุรกิจสามารถเชื่อมต่อกันได้ ตั้งแต่งานบุคคล เอกสาร สต็อก ไปจนถึงระบบหลังบ้าน',
    en: 'PDA BLISS designs software so business data and processes can connect — from HR and documents to stock and back-office systems.',
    zh: 'PDA BLISS 设计的软件让业务数据和流程能够互相连接——从人事、文档、库存到后台系统。'
  },
  capableTitle: {
    th: 'เริ่มจากระบบที่ธุรกิจต้องการ แล้วออกแบบเส้นทางข้อมูลให้เติบโตต่อได้',
    en: 'Start with the system the business needs, then design data paths that can grow.',
    zh: '从企业需要的系统入手，再设计能够持续扩展的数据路径。'
  },
  capableBody: {
    th: 'แต่ละโครงการเชื่อมต่อไม่เหมือนกัน แผนภาพนี้จึงสื่อถึงความสามารถในการทำงานร่วมกัน ไม่ได้อ้างว่าทุกระบบเชื่อมต่ออยู่แล้ว',
    en: 'Every project connects differently, so this diagram shows the ability to work together — it does not claim that every system is already connected.',
    zh: '每个项目的连接方式都不同，因此这张图表达的是协同工作的能力，并不代表所有系统都已经相互连接。'
  },
  flowTitle: { th: ['เส้นเชื่อมต้อง', 'มีความหมาย'], en: ['Every connection', 'has to mean something'], zh: ['每一条连接', '都必须有意义'] } as Lines,
  flowLead: {
    th: 'เราเริ่มจากสิ่งที่คนในธุรกิจทำจริง แล้วกำหนดว่าข้อมูลควรไปต่อที่ไหน โดยไม่เพิ่มเส้นเชื่อมเพียงเพื่อให้แผนภาพดูซับซ้อน',
    en: 'We start from what people in the business actually do, then decide where the data should go next — without adding connections just to make the diagram look complex.',
    zh: '我们从企业中的人实际在做的事情出发，再决定数据接下来应该流向哪里，而不会为了让图表显得复杂而额外增加连接。'
  },
  mapTitle: { th: ['หนึ่งระบบที่เลือก', 'ทำให้ทั้งภาพชัดขึ้น'], en: ['Choose one system', 'and the whole picture gets clearer'], zh: ['选中一个系统，', '整体图景就更清晰'] } as Lines,
  mapLead: {
    th: 'เลือกแต่ละระบบเพื่อดูหน้าที่ ความสามารถ และเส้นทางที่สามารถทำงานร่วมกับระบบอื่น โดยเส้นเชื่อมหมายถึงความเป็นไปได้ในการออกแบบ Workflow ไม่ใช่สถานะการเชื่อมต่อจริงของทุกโครงการ',
    en: 'Choose a system to see its role, its capabilities and the paths it can share with other systems. A connection means a workflow that can be designed — not the live integration status of every project.',
    zh: '选择一个系统，查看它的作用、能力以及可以与其他系统协同的路径。连线表示可以设计的工作流程，并不代表每个项目的实际对接状态。'
  },
  mapAria: { th: 'แผนผังระบบ PDA BLISS', en: 'PDA BLISS system map', zh: 'PDA BLISS 系统图' },
  coreAria: { th: 'PDA Core ศูนย์กลางระบบ', en: 'PDA Core — the centre of the system', zh: 'PDA Core 系统中心' },
  tapHint: { th: 'แตะระบบเพื่อดูรายละเอียด', en: 'Tap a system to see its details', zh: '点击系统查看详情' },
  standalone: {
    th: 'ทำงานเป็นช่องทางเฉพาะ และสามารถออกแบบการเชื่อมต่อเพิ่มเติมตาม Workflow จริงของโครงการ',
    en: 'Works as a dedicated channel; further connections can be designed around the project’s real workflow.',
    zh: '作为独立渠道运行，并可根据项目的实际工作流程设计更多连接。'
  },
  viewExample: { th: 'ดูตัวอย่างระบบ', en: 'See an example', zh: '查看系统示例' },
  viewService: { th: 'ดูบริการ', en: 'View service', zh: '查看服务' },
  consult: { th: 'ปรึกษาระบบนี้', en: 'Discuss this system', zh: '咨询此系统' }
};

/** The two example business flows on /solutions. Codes stay English design labels. */
export const businessFlows: readonly { code: string; title: LocalizedText; steps: Lines; note: LocalizedText }[] = [
  {
    code: 'PEOPLE FLOW',
    title: { th: 'คำขอลาของพนักงาน', en: 'An employee leave request', zh: '员工请假申请' },
    steps: {
      th: ['พนักงานส่งคำขอ', 'HR LINE BOT', 'หัวหน้าอนุมัติ', 'Payroll รับข้อมูลวันลา'],
      en: ['Employee submits a request', 'HR LINE BOT', 'Supervisor approves', 'Payroll receives the leave data'],
      zh: ['员工提交申请', 'HR LINE BOT', '主管审批', 'Payroll 接收请假数据']
    },
    note: {
      th: 'ตัวอย่าง Workflow ที่สามารถออกแบบให้ข้อมูลไหลต่อกัน ลดการส่งต่อด้วยไฟล์หรือข้อความซ้ำ',
      en: 'An example of a workflow that can be designed so data flows on, with less passing of files or repeated messages.',
      zh: '一个可以设计成数据自动流转的工作流程示例，减少通过文件或重复消息的传递。'
    }
  },
  {
    code: 'OPERATIONS FLOW',
    title: { th: 'รับสินค้าเข้าคลัง', en: 'Receiving goods into the warehouse', zh: '商品入库' },
    steps: {
      th: ['บันทึกรับสินค้า', 'ERP', 'อัปเดตสต็อก', 'ต้นทุนและรายงาน'],
      en: ['Record goods received', 'ERP', 'Update stock', 'Costing and reports'],
      zh: ['登记收货', 'ERP', '更新库存', '成本与报表']
    },
    note: {
      th: 'รายการต้นทางเดียวสามารถนำไปใช้กับยอดคงเหลือ ต้นทุน และรายงานตามขอบเขตระบบที่ตกลงกัน',
      en: 'One source entry can feed balances, costing and reports, within the system scope agreed.',
      zh: '同一条来源记录可以在约定的系统范围内用于结存、成本和报表。'
    }
  }
];
