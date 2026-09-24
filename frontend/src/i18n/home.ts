import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * ============================================================================
 * HOME — and the company-level lists the home sections share
 * ============================================================================
 * The Thai sources stay in `data/company.ts` (process, strengths, capability
 * markers, tech stack). Each list below mirrors its Thai array item-for-item
 * and is checked by tests/i18n.test.mjs.
 *
 * Claims are carried at the Thai strength: no "best", no "error-free", no
 * figures beyond the two owner-verified metrics.
 * ============================================================================
 */

type Lines = Record<Locale, readonly string[]>;

export const hero = {
  /** Three controlled lines; the last one is underlined in green. */
  headline: {
    th: ['ไอเดียของคุณ', 'เราทำให้มัน', 'ใช้งานได้จริง'],
    en: ['Your idea.', 'We make it', 'work for real.'],
    zh: ['您的想法，', '我们让它', '真正落地可用']
  } as Lines,
  lead: {
    th: 'พัฒนาซอฟต์แวร์ ระบบธุรกิจ เว็บแอปพลิเคชัน และระบบภายในองค์กร จาก Workflow ที่ใช้งานจริงของธุรกิจ',
    en: 'Software, business systems, web applications and internal tools, built from the workflows your business actually runs on.',
    zh: '我们依据企业真实运行的工作流程，开发软件、业务系统、Web 应用和企业内部系统。'
  },
  /** Short proof points under the CTAs — each independently true. */
  proof: {
    th: ['ERP · Payroll · เอกสาร', 'เชื่อมระบบเดิมได้', 'ส่งมอบซอร์สโค้ดทั้งหมด'],
    en: ['ERP · Payroll · Documents', 'Connects to existing systems', 'Full source code handover'],
    zh: ['ERP · Payroll · 文档', '可对接现有系统', '交付全部源代码']
  } as Lines,
  /** The small status card on the hero rig: the two verified figures. */
  rigStats: {
    th: ['ระบบซอฟต์แวร์', 'เว็บไซต์'],
    en: ['Software systems', 'Websites'],
    zh: ['软件系统', '网站']
  } as Lines
};

export const marquee = {
  label: { th: 'บริการของ PDA BLISS', en: 'PDA BLISS services', zh: 'PDA BLISS 的服务' }
} satisfies Record<string, LocalizedText>;

export const showreel = {
  title: { th: 'ระบบที่เราสร้างจริง', en: 'Systems we have actually built', zh: '我们真正构建的系统' },
  lead: {
    th: 'ERP, เงินเดือน, เอกสาร, เว็บไซต์ และระบบ HR ผ่าน LINE ทั้งหมดออกแบบจาก Workflow ของธุรกิจที่ใช้งานอยู่จริง',
    en: 'ERP, payroll, documents, websites and HR on LINE — all designed from workflows businesses really use.',
    zh: 'ERP、薪资、文档、网站以及基于 LINE 的 HR 系统——全部依据企业实际使用的工作流程设计。'
  },
  viewWork: { th: 'ดูผลงาน', en: 'View work', zh: '查看案例' },
  viewCase: { th: 'ดู Case Study', en: 'View case study', zh: '查看案例详情' },
  viewService: { th: 'ดูบริการ', en: 'View service', zh: '查看服务' }
} satisfies Record<string, LocalizedText>;

export const explorer = {
  title: { th: ['เราทำอะไร', 'ให้ธุรกิจคุณได้บ้าง'], en: ['What we can build', 'for your business'], zh: ['我们能为您的企业', '做些什么'] } as Lines,
  lead: {
    th: 'เลือกหัวข้อเพื่อดูปัญหาที่แก้และสิ่งที่เราสร้าง งานส่วนใหญ่ใช้หลายบริการร่วมกัน',
    en: 'Choose a topic to see the problem it solves and what we build. Most projects combine several services.',
    zh: '选择一个主题，查看它解决的问题和我们构建的内容。大多数项目会组合使用多项服务。'
  },
  consult: { th: 'คุยเรื่องบริการนี้', en: 'Discuss this service', zh: '咨询此项服务' },
  viewAll: { th: 'ดูบริการทั้งหมด ({n})', en: 'View all services ({n})', zh: '查看全部服务（{n}）' }
};

export const processCopy = {
  title: { th: ['จากไอเดีย', 'สู่ระบบที่ใช้งานได้จริง'], en: ['From idea', 'to a system that works'], zh: ['从想法', '到真正可用的系统'] } as Lines,
  lead: {
    th: 'เจ็ดขั้นตอนที่ใช้กับทุกโปรเจกต์ เลือกดูรายละเอียดแต่ละขั้นได้',
    en: 'Seven steps we follow on every project. Choose a step to see the details.',
    zh: '每个项目都遵循的七个步骤，可逐一查看详情。'
  },
  tablist: { th: 'ขั้นตอนการทำงาน', en: 'Project steps', zh: '工作步骤' }
};

/** Mirrors `process` in data/company.ts, step for step. */
export const processSteps: readonly { title: LocalizedText; body: LocalizedText }[] = [
  {
    title: { th: 'ทำความเข้าใจธุรกิจ', en: 'Understand the business', zh: '理解业务' },
    body: {
      th: 'คุยกับคนที่ทำงานจริง ดูเอกสารจริง และเข้าใจว่าเวลาหายไปกับขั้นตอนไหน ก่อนจะพูดถึงเทคโนโลยี',
      en: 'Talk to the people who do the work, look at the real documents and understand where the time goes — before talking about technology.',
      zh: '先与一线人员交流，查看真实单据，弄清楚时间耗在哪些环节，然后才谈技术。'
    }
  },
  {
    title: { th: 'วิเคราะห์ Workflow', en: 'Analyse the workflow', zh: '分析工作流程' },
    body: {
      th: 'เขียนขั้นตอนการทำงานปัจจุบันออกมาเป็นแผนภาพ ระบุจุดที่ซ้ำซ้อน จุดที่ข้อมูลตกหล่น และจุดที่ต้องรออนุมัติ',
      en: 'Map the current process as a diagram, marking duplicated steps, points where data gets lost and places that wait on approval.',
      zh: '把现有工作流程画成图，标出重复的环节、数据容易遗漏的地方以及需要等待审批的节点。'
    }
  },
  {
    title: { th: 'ออกแบบระบบ', en: 'Design the system', zh: '设计系统' },
    body: {
      th: 'กำหนดโครงสร้างข้อมูล สิทธิ์การใช้งาน การเชื่อมต่อ และกรณีข้อยกเว้น พร้อมขอบเขตงานและราคาที่ชัดเจน',
      en: 'Define the data structure, permissions, integrations and exception cases, with a clear scope and price.',
      zh: '确定数据结构、使用权限、系统对接和例外情况，并给出清晰的工作范围和报价。'
    }
  },
  {
    title: { th: 'พัฒนา', en: 'Build', zh: '开发' },
    body: {
      th: 'ส่งงานที่ใช้ได้จริงทุก 2 สัปดาห์บนระบบทดสอบ ให้ทีมคุณลองใช้และให้ความเห็นก่อนรอบถัดไป',
      en: 'Deliver working software every 2 weeks on a test system, so your team can try it and give feedback before the next round.',
      zh: '每 2 周在测试环境中交付可用的版本，让您的团队试用并在下一轮之前提出意见。'
    }
  },
  {
    title: { th: 'ทดสอบ', en: 'Test', zh: '测试' },
    body: {
      th: 'ทดสอบกฎทางธุรกิจ ตัวเลขเงิน และสิทธิ์การเข้าถึงด้วยชุดทดสอบอัตโนมัติ พร้อมให้ผู้ใช้จริงลองใช้ก่อนเปิดระบบ',
      en: 'Test business rules, money figures and access permissions with automated tests, and have real users try it before go-live.',
      zh: '用自动化测试检查业务规则、金额数字和访问权限，并在上线前让真实用户试用。'
    }
  },
  {
    title: { th: 'ส่งมอบ', en: 'Hand over', zh: '交付' },
    body: {
      th: 'ติดตั้งระบบจริง ย้ายข้อมูล อบรมผู้ใช้งาน และส่งมอบซอร์สโค้ดพร้อมเอกสารทั้งหมดให้คุณ',
      en: 'Install the live system, migrate data, train users and hand over the source code with all its documentation.',
      zh: '部署正式系统、迁移数据、培训用户，并将源代码和全部文档交付给您。'
    }
  },
  {
    title: { th: 'ดูแลต่อ', en: 'Ongoing support', zh: '持续维护' },
    body: {
      th: 'มีผู้รับผิดชอบที่ระบุชื่อได้ ระยะเวลาตอบกลับที่ตกลงกันไว้ และงบพัฒนาต่อเนื่องตามการเติบโตของธุรกิจ',
      en: 'A named person responsible, an agreed response time and an ongoing development budget that grows with the business.',
      zh: '有明确的负责人、约定的响应时间，以及随业务发展而安排的持续开发预算。'
    }
  }
];

export const strengthsCopy = {
  title: { th: 'ทำไมต้อง', en: 'Why', zh: '为什么选择' },
  lead: {
    th: 'ห้าเรื่องที่เรายึดกับทุกโปรเจกต์ ไม่ใช่คำโฆษณา แต่เป็นสิ่งที่คุณใช้วัดเราได้ตั้งแต่การคุยครั้งแรกจนถึงการดูแลหลังส่งมอบ',
    en: 'Five things we hold to on every project. Not slogans — things you can measure us by, from the first conversation to support after handover.',
    zh: '我们在每个项目中坚持的五件事。不是广告语，而是您从第一次沟通到交付后维护都可以用来衡量我们的标准。'
  }
} satisfies Record<string, LocalizedText>;

/** Mirrors `strengths` in data/company.ts. `keyword` is the one-word headline. */
export const strengthItems: readonly { keyword: LocalizedText; title: LocalizedText; body: LocalizedText }[] = [
  {
    keyword: { th: 'เร็ว', en: 'Fast', zh: '快速' },
    title: { th: 'พัฒนาอย่างรวดเร็ว', en: 'Quick to build', zh: '开发速度快' },
    body: {
      th: 'ทีมเล็กและตัดสินใจได้เอง ทำให้ไม่ต้องรอผ่านหลายชั้นก่อนเริ่มงาน คุณเห็นระบบที่กดใช้ได้จริงตั้งแต่รอบแรก ๆ',
      en: 'A small team that can make its own decisions, so work does not wait on layers of sign-off. You see a system you can actually click through from the early rounds.',
      zh: '团队精干、可以自主决策，不必层层审批才能开工。您在最初几轮就能看到可以实际操作的系统。'
    }
  },
  {
    keyword: { th: 'คุ้มค่า', en: 'Fair', zh: '合理' },
    title: { th: 'ราคาเหมาะสมกับขอบเขตงาน', en: 'Priced to the scope', zh: '价格与范围相符' },
    body: {
      th: 'เสนอราคาตามขอบเขตที่ตกลงกันชัดเจน ไม่มีค่าใช้จ่ายที่โผล่มากลางทาง และบอกตรง ๆ ถ้าฟีเจอร์ไหนยังไม่คุ้มที่จะทำตอนนี้',
      en: 'Quotes based on a clearly agreed scope, no costs appearing halfway through, and a straight answer when a feature is not worth building yet.',
      zh: '按照清晰约定的范围报价，中途不会冒出额外费用；如果某个功能现在还不值得做，我们会直接告诉您。'
    }
  },
  {
    keyword: { th: 'ตรงเวลา', en: 'On time', zh: '准时' },
    title: { th: 'ส่งมอบตามแผน', en: 'Delivered to plan', zh: '按计划交付' },
    body: {
      th: 'แบ่งงานเป็นรอบสั้น ๆ พร้อมกำหนดส่งที่ตกลงไว้ล่วงหน้า ถ้ามีอะไรกระทบกำหนดการ คุณจะรู้ก่อน ไม่ใช่รู้ตอนถึงวันส่ง',
      en: 'Work is split into short rounds with delivery dates agreed in advance. If something affects the schedule, you hear about it early — not on the due date.',
      zh: '把工作拆成短周期，并提前约定交付日期。如果有任何事情影响进度，您会提前知道，而不是到交付当天才知道。'
    }
  },
  {
    keyword: { th: 'ละเอียด', en: 'Careful', zh: '严谨' },
    title: { th: 'ใส่ใจคุณภาพและลดข้อผิดพลาด', en: 'Attention to quality', zh: '注重质量，减少差错' },
    body: {
      th: 'ตรวจสอบกฎทางธุรกิจ ตัวเลขเงิน และสิทธิ์การเข้าถึงด้วยการทดสอบอัตโนมัติ เพื่อให้ข้อผิดพลาดถูกเจอก่อนถึงมือผู้ใช้',
      en: 'Business rules, money figures and access permissions are checked with automated tests, so mistakes are caught before they reach users.',
      zh: '用自动化测试检查业务规则、金额数字和访问权限，让问题在到达用户之前就被发现。'
    }
  },
  {
    keyword: { th: 'ดูแลต่อ', en: 'Ongoing', zh: '持续' },
    title: { th: 'ดูแลโดยทีมงานที่มีประสบการณ์', en: 'Looked after by an experienced team', zh: '由有经验的团队维护' },
    body: {
      th: 'คนที่คุยขอบเขตงานกับคุณคือคนเดียวกับที่เขียนโค้ดและดูแลระบบต่อ ไม่มีการส่งต่อให้ทีมที่ไม่เคยเห็นงานนี้',
      en: 'The people who agree the scope with you are the same people who write the code and look after the system — no hand-off to a team that has never seen the work.',
      zh: '和您确认范围的人，就是写代码并负责后续维护的人，不会转交给从未接触过这个项目的团队。'
    }
  }
];

export const metricsCopy = {
  title: { th: ['ตัวเลขที่ยืนยันได้', 'เท่านั้น'], en: ['Only numbers', 'we can verify'], zh: ['只展示', '可以核实的数字'] } as Lines,
  lead: {
    th: 'เราไม่แสดงจำนวนลูกค้า เปอร์เซ็นต์ความพึงพอใจ หรือจำนวนปีที่ดำเนินกิจการ เพราะยังไม่มีการเก็บข้อมูลที่ยืนยันได้ ตัวเลขด้านล่างคือทั้งหมดที่เรายืนยันได้จริง',
    en: 'We do not show client counts, satisfaction percentages or years in business, because no verified data has been collected for them. The figures below are everything we can genuinely verify.',
    zh: '我们不展示客户数量、满意度百分比或经营年限，因为目前还没有可核实的数据。下面的数字就是我们能够真正核实的全部内容。'
  }
};

/** Mirrors `capabilityMarkers` in data/company.ts. */
export const capabilityMarkerText: readonly { label: LocalizedText; detail: LocalizedText }[] = [
  {
    label: { th: 'ออกแบบตามธุรกิจจริง', en: 'Designed around the real business', zh: '按真实业务设计' },
    detail: {
      th: 'เริ่มจากการเข้าใจขั้นตอนการทำงานของคุณ ไม่ใช่จากฟีเจอร์สำเร็จรูป',
      en: 'We start by understanding how you work, not from a list of ready-made features.',
      zh: '从理解您的工作流程开始，而不是从现成的功能清单开始。'
    }
  },
  {
    label: { th: 'รองรับการขยายระบบ', en: 'Room to grow', zh: '支持系统扩展' },
    detail: {
      th: 'วางโครงสร้างให้เพิ่มผู้ใช้ สาขา และโมดูลใหม่ได้โดยไม่ต้องรื้อ',
      en: 'Structured so you can add users, branches and new modules without starting over.',
      zh: '在架构上预留空间，增加用户、分支和新模块时无需推倒重来。'
    }
  },
  {
    label: { th: 'เชื่อมต่อระบบเดิมได้', en: 'Works with existing systems', zh: '可对接现有系统' },
    detail: {
      th: 'ทำงานร่วมกับบัญชี คลังสินค้า LINE และระบบที่คุณใช้อยู่แล้ว',
      en: 'Works alongside accounting, warehouse, LINE and the systems you already use.',
      zh: '可与会计、仓储、LINE 以及您正在使用的系统协同工作。'
    }
  },
  {
    label: { th: 'ดูแลและพัฒนาต่อเนื่อง', en: 'Ongoing care and development', zh: '持续维护与开发' },
    detail: {
      th: 'มีทีมที่รู้จักระบบของคุณ พร้อมแก้ไขและต่อยอดหลังส่งมอบ',
      en: 'A team that knows your system, ready to fix and extend it after handover.',
      zh: '有熟悉您系统的团队，交付后可以继续修复和扩展。'
    }
  }
];

export const insightsCopy = {
  title: {
    th: ['บทความและมุมมอง', 'สำหรับการตัดสินใจ', 'เรื่องระบบ'],
    en: ['Articles and perspectives', 'for making decisions', 'about systems'],
    zh: ['帮助您做出', '系统决策的', '文章与观点']
  } as Lines,
  viewAll: { th: 'ดูบทความทั้งหมด', en: 'View all articles', zh: '查看全部文章' },
  read: { th: 'อ่านบทความ', en: 'Read article', zh: '阅读文章' },
  preparing: { th: 'กำลังเตรียมบทความ', en: 'Article in preparation', zh: '文章准备中' },
  categories: { th: 'หมวดบทความ', en: 'Article categories', zh: '文章分类' },
  all: { th: 'ทั้งหมด', en: 'All', zh: '全部' }
};
