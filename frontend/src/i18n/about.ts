import { aboutIntro, aftercare, philosophy, statement, whoWeAre } from '@/data/about';
import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * ============================================================================
 * ABOUT — TH / EN / 中文
 * ============================================================================
 * Thai values point at `data/about.ts` wherever the owner's wording exists, so
 * there is one Thai source. EN and ZH mirror them item for item. No history,
 * founding year, headcount or client count is added — none is verified.
 *
 * EP41 — About answers "who is PDA BLISS and how does it think". What we can
 * build lives on /services, what we built on /work; About summarises and links.
 * ============================================================================
 */

type Lines = Record<Locale, readonly string[]>;

export const aboutPage = {
  title: { th: 'เกี่ยวกับเรา', en: 'About us', zh: '关于我们' },
  /* ------------------------------------------------------------ hero -- */
  heroTitle: {
    th: ['เราเป็นทีมพัฒนาซอฟต์แวร์', 'ที่เริ่มจากปัญหาจริงของธุรกิจ'],
    en: ['We are a software team', 'that starts from real business problems'],
    zh: ['我们是一支软件团队，', '从企业的真实问题出发']
  } as Lines,
  heroLead: {
    th: 'PDA BLISS พัฒนาระบบธุรกิจ เว็บแอปพลิเคชัน เว็บไซต์ และเครื่องมือสำหรับ Workflow ภายในองค์กร โดยออกแบบจากวิธีทำงานจริงของแต่ละทีม',
    en: 'PDA BLISS builds business systems, web applications, websites and internal workflow tools, designed around how each team actually works.',
    zh: 'PDA BLISS 开发业务系统、Web 应用、网站和企业内部工作流程工具，并依据每个团队的实际工作方式来设计。'
  },
  /* ----------------------------------------------------------- story -- */
  storyTitle: { th: 'ทำไมเราทำซอฟต์แวร์แบบนี้', en: 'Why we build software this way', zh: '我们为什么这样做软件' },
  whoBody: {
    th: whoWeAre.body,
    en: 'A software studio that steps in when a business has outgrown what Excel can handle, when off-the-shelf software forces you to work backwards, or when a system that used to fit has become a bottleneck.',
    zh: '一家软件工作室：当企业的发展超出了 Excel 的承受能力，当现成软件迫使您逆着流程工作，或者当曾经合适的系统已经成为瓶颈时，我们就能派上用场。'
  },
  secondParagraph: {
    th: aboutIntro.body[1],
    en: 'We keep the team small and experienced on purpose. The person who agrees the scope with you is the same person who writes the code — and the same person who picks up the phone a year and a half later when the system needs to change.',
    zh: '我们刻意保持团队精干且经验丰富。与您确认范围的人，就是写代码的人，也是一年半之后系统需要调整时接听电话的人。'
  },
  quote: {
    th: statement.quote,
    en: ['We do not build systems that merely work.', 'We build systems a business can keep using.'],
    zh: ['我们不只是打造能用的系统，', '而是打造企业能够持续使用的系统']
  } as Lines,
  quoteSupport: {
    th: statement.support,
    en: 'A good system is judged in year two — when people change, the team grows and the business is no longer the same. So we design it to be changed from the start.',
    zh: '好的系统要到第二年才见分晓——那时人员变动、团队壮大、业务也已不同。所以我们从一开始就把它设计成可以继续修改的。'
  },
  /* -------------------------------------------------- what we build -- */
  buildTitle: { th: 'สิ่งที่เราสร้าง', en: 'What we build', zh: '我们构建什么' },
  buildLead: {
    th: 'งานส่วนใหญ่ของเราอยู่ในห้ากลุ่มนี้ รายละเอียด ปัญหาที่แก้ และกลุ่มที่เหมาะ อยู่ที่หน้าบริการ',
    en: 'Most of our work falls into these five groups. The details — the problems each solves and who it suits — are on the Services page.',
    zh: '我们的大部分工作属于以下五类。每类解决什么问题、适合谁，请见服务页面。'
  },
  buildAll: { th: 'ดูบริการทั้งหมด', en: 'View all services', zh: '查看全部服务' },
  /* ---------------------------------------------------- how we think -- */
  thinkTitle: { th: 'หลักที่ใช้ตัดสินใจในทุกโปรเจกต์', en: 'The principles behind every project decision', zh: '指导每个项目决策的原则' },
  /* -------------------------------------------------------- evidence -- */
  evidenceTitle: { th: 'สิ่งที่สร้างและส่งมอบแล้ว', en: 'What we have built and delivered', zh: '已构建并交付的成果' },
  evidenceNote: {
    th: 'แสดงเฉพาะตัวเลขที่ยืนยันได้ ไม่มีจำนวนลูกค้าหรือเปอร์เซ็นต์ที่ยังไม่ได้วัดผล',
    en: 'Only figures we can verify — no client counts or percentages that have not been measured.',
    zh: '只展示可以核实的数字，不包含未经测量的客户数量或百分比。'
  },
  casesLabel: { th: 'กรณีศึกษา', en: 'Case studies', zh: '案例研究' },
  casesDetail: { th: 'โครงการที่เปิดเผยรายละเอียดได้', en: 'Projects we can describe in detail', zh: '可公开详情的项目' },
  examplesTitle: { th: 'ตัวอย่างผลงาน', en: 'Examples', zh: '案例示例' },
  evidenceAll: { th: 'ดูผลงานจริง', en: 'See real work', zh: '查看真实案例' },
  /* --------------------------------------------------------- process -- */
  scopeLink: { th: 'ขอบเขตและราคาประเมินอย่างไร', en: 'How scope and price are estimated', zh: '范围与价格如何评估' },
  /* ------------------------------------------------ tech + quality -- */
  techQualityTitle: {
    th: ['เครื่องมือจากงานจริง', 'และสิ่งที่เราตรวจก่อนส่ง'],
    en: ['Tools from real work,', 'and what we check before delivery'],
    zh: ['来自真实项目的工具，', '以及交付前的检查']
  } as Lines,
  techHeading: { th: 'เทคโนโลยีในผลงานที่ส่งมอบ', en: 'Technology in delivered work', zh: '已交付项目中的技术' },
  techNote: {
    th: 'รายการนี้แสดงเฉพาะเครื่องมือที่อยู่ในผลงานที่ส่งมอบแล้ว สำหรับโปรเจกต์ใหม่ เราเลือกเครื่องมือตามโจทย์และระบบเดิมของลูกค้า',
    en: 'This list shows only tools found in delivered work. For a new project, tools are chosen to fit the brief and the client’s existing systems.',
    zh: '此列表只展示已交付项目中实际使用的工具。新项目会根据需求和客户现有系统来选择工具。'
  },
  usedIn: { th: 'ใช้ใน: ', en: 'Used in: ', zh: '所用项目：' },
  aftercareHeading: { th: aftercare.heading, en: 'Support after handover', zh: '交付后的维护' },
  aftercareBody: {
    th: aftercare.body,
    en: 'We do not disappear after handover. There is a named person responsible, an agreed response time and regular system reviews, so the system develops with the business — not just with the contract.',
    zh: '交付之后我们不会消失。有明确的负责人、约定的响应时间以及定期的系统复盘，让系统随业务一起发展，而不只是按合同办事。'
  }
};

/** The five capability groups on About — each anchors a core service on /services. */
export const buildGroups: readonly { label: LocalizedText; line: LocalizedText; to: string }[] = [
  {
    label: { th: 'ระบบธุรกิจ / ERP', en: 'Business systems / ERP', zh: '业务系统 / ERP' },
    line: { th: 'สต็อก ต้นทุน จัดซื้อ และรายงาน บนข้อมูลชุดเดียว', en: 'Stock, costing, purchasing and reports on one set of data', zh: '库存、成本、采购和报表，基于同一套数据' },
    to: '/services#business-systems'
  },
  {
    label: { th: 'HR และ Payroll', en: 'HR & payroll', zh: 'HR 与 Payroll' },
    line: { th: 'รอบเงินเดือน คำขอลา และงานบุคคล รวมถึงผ่าน LINE', en: 'Pay cycles, leave requests and HR work, including through LINE', zh: '薪资周期、请假申请和人事工作，也可通过 LINE 完成' },
    to: '/services#payroll'
  },
  {
    label: { th: 'เอกสารและไฟล์', en: 'Documents & files', zh: '文档与文件' },
    line: { th: 'การอนุมัติเอกสาร และที่เก็บไฟล์กลางขององค์กร', en: 'Document approvals and the organisation’s central file store', zh: '文档审批与企业集中文件存储' },
    to: '/services#document-management'
  },
  {
    label: { th: 'เว็บแอปและแอปมือถือ', en: 'Web & mobile applications', zh: 'Web 与移动应用' },
    line: { th: 'ระบบที่ทีมใช้ทำงานผ่านเบราว์เซอร์หรือมือถือ', en: 'Systems teams work in through a browser or a phone', zh: '团队通过浏览器或手机使用的工作系统' },
    to: '/services#web-applications'
  },
  {
    label: { th: 'เว็บไซต์', en: 'Websites', zh: '网站' },
    line: { th: 'เว็บไซต์องค์กรที่อธิบายบริการได้ชัด และติดต่อกลับได้ง่าย', en: 'Corporate websites that explain the services clearly and are easy to contact through', zh: '清楚介绍服务、方便联系的企业网站' },
    to: '/services#websites'
  }
];

/** Case studies shown as examples in the evidence section. */
export const evidenceCases = ['payroll-monthly-control', 'hr-line-leave-approval', 'corporate-website-system'] as const;

/** Mirrors `philosophy` in data/about.ts. */
export const philosophyText: readonly { heading: LocalizedText; body: LocalizedText }[] = [
  {
    heading: { th: philosophy[0].heading, en: 'Our approach', zh: '我们的理念' },
    body: {
      th: philosophy[0].body,
      en: 'Understand before building. We spend time with the people who do the work, because a requirements document written in a meeting room is a guess — and guesses are very expensive once development starts.',
      zh: '先理解，再动手。我们会花时间与一线人员相处，因为在会议室里写出的需求文档只是猜测，而猜测一旦进入开发阶段，代价会非常高。'
    }
  },
  {
    heading: { th: philosophy[1].heading, en: 'Say the uncomfortable things early', zh: '尽早说出不中听的话' },
    body: {
      th: philosophy[1].body,
      en: 'If a deadline is impossible, if a feature is not worth what it costs, or if you should buy rather than build, we tell you while changing the plan is still cheap.',
      zh: '如果期限无法实现、某个功能不值得投入，或者您应该购买而不是自建，我们会在改变计划成本还很低的时候就告诉您。'
    }
  },
  {
    heading: { th: philosophy[2].heading, en: 'Maintainability is a feature', zh: '可维护性本身就是功能' },
    body: {
      th: philosophy[2].body,
      en: 'Code is read far more often than it is written, so we write it for whoever takes it over next — including when that is your own team, not ours.',
      zh: '代码被阅读的次数远多于被编写的次数，所以我们为接手的人而写——包括接手的是您自己的团队而不是我们的时候。'
    }
  },
  {
    heading: { th: philosophy[3].heading, en: 'Responsible until it really works', zh: '负责到真正可用为止' },
    body: {
      th: philosophy[3].body,
      en: 'The job does not end on handover day. It ends when your team can use the system confidently on its own, without us in the room.',
      zh: '工作不在交付当天结束，而是在您的团队能够不依赖我们、自信地独立使用系统时才结束。'
    }
  }
];

/** Mirrors `aftercare.items` in data/about.ts. */
export const aftercareText: readonly { label: LocalizedText; value: LocalizedText }[] = [
  {
    label: { th: aftercare.items[0].label, en: 'How we work', zh: '合作方式' },
    value: { th: aftercare.items[0].value, en: 'Phased by scope, or a dedicated monthly team', zh: '按范围分阶段，或按月的专属团队' }
  },
  {
    label: { th: aftercare.items[1].label, en: 'Delivery cycle', zh: '交付周期' },
    value: { th: aftercare.items[1].value, en: 'Every 2 weeks, with a working system to try', zh: '每 2 周一次，并提供可以实际试用的系统' }
  },
  {
    label: { th: aftercare.items[2].label, en: 'Communication', zh: '沟通方式' },
    value: { th: aftercare.items[2].value, en: 'One channel, one main contact, a written summary every week', zh: '单一渠道、一位主要负责人，每周书面总结' }
  },
  {
    label: { th: aftercare.items[3].label, en: 'Handover', zh: '交付内容' },
    value: { th: aftercare.items[3].value, en: 'Source code, infrastructure, documentation and training', zh: '源代码、基础设施、文档和培训' }
  },
  {
    label: { th: aftercare.items[4].label, en: 'Ongoing support', zh: '后续维护' },
    value: { th: aftercare.items[4].value, en: 'An agreed response time, with an ongoing improvement budget', zh: '约定的响应时间，并配有持续改进的预算' }
  }
];
