import { aboutIntro, aftercare, philosophy, standards, statement, whoWeAre } from '@/data/about';
import { targetMarket } from '@/data/company';
import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * ============================================================================
 * ABOUT — TH / EN / 中文
 * ============================================================================
 * Thai values point at `data/about.ts` and `data/company.ts`, so the Thai page
 * reads exactly as before and there is one Thai source. EN and ZH mirror them
 * item for item. No history, founding year, headcount or client count is
 * added — none is verified, and none is in the Thai.
 * ============================================================================
 */

type Lines = Record<Locale, readonly string[]>;

export const aboutPage = {
  title: { th: 'เกี่ยวกับเรา', en: 'About us', zh: '关于我们' },
  lead: {
    th: aboutIntro.body[0],
    en: 'PDA BLISS COMPANY LIMITED does not start by proposing features. We start by understanding how the work gets done, where your team gets stuck, the people who will actually use the system, the data you already have and the real constraints on the ground.',
    zh: 'PDA BLISS COMPANY LIMITED 不会一开始就推销功能。我们先了解工作是如何完成的、团队在哪里受阻、真正会使用系统的人、已有的数据，以及现场实际存在的限制。'
  },
  statementTitle: {
    th: aboutIntro.title,
    en: ['Good technology', 'starts with understanding the real business'],
    zh: ['好的技术，', '始于对真实业务的理解']
  } as Lines,
  secondParagraph: {
    th: aboutIntro.body[1],
    en: 'We keep the team small and experienced on purpose. The person who agrees the scope with you is the same person who writes the code — and the same person who picks up the phone a year and a half later when the system needs to change.',
    zh: '我们刻意保持团队精干且经验丰富。与您确认范围的人，就是写代码的人，也是一年半之后系统需要调整时接听电话的人。'
  },
  closing: {
    th: 'เราไม่ได้เริ่มจากฟีเจอร์ เราเริ่มจาก Workflow ปัญหา ข้อมูล และคนที่ต้องใช้งานระบบจริง',
    en: 'We do not start from features. We start from the workflow, the problem, the data and the people who will really use the system.',
    zh: '我们不从功能出发，而是从工作流程、问题、数据以及真正使用系统的人出发。'
  },
  whoHeading: { th: whoWeAre.heading, en: 'Who we are', zh: '我们是谁' },
  whoBody: {
    th: whoWeAre.body,
    en: 'A software studio that steps in when a business has outgrown what Excel can handle, when off-the-shelf software forces you to work backwards, or when a system that used to fit has become a bottleneck.',
    zh: '一家软件工作室：当企业的发展超出了 Excel 的承受能力，当现成软件迫使您逆着流程工作，或者当曾经合适的系统已经成为瓶颈时，我们就能派上用场。'
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
  philosophyTitle: { th: 'หลักที่ใช้ตัดสินใจในทุกโปรเจกต์', en: 'The principles behind every project decision', zh: '指导每个项目决策的原则' },
  marketHeadline: {
    th: targetMarket.headline,
    en: ['For businesses of every size', 'that need systems built around their own workflow'],
    zh: ['适合各种规模的企业，', '需要按自身实际工作流程定制系统']
  } as Lines,
  marketLead: {
    th: targetMarket.lead,
    en: 'We do not choose clients by size or industry, but by the problem. If your business has its own way of working and off-the-shelf software is starting to force you to work backwards, that is where we can help.',
    zh: '我们不按规模或行业挑选客户，而是看需求本身。如果您的企业有自己独特的工作方式，而现成软件开始迫使您逆着流程工作，那正是我们能提供帮助的地方。'
  },
  standardsTitle: { th: 'สร้างให้ดูแลต่อได้ตั้งแต่วันแรก', en: 'Built to be maintained from day one', zh: '从第一天起就为可维护而构建' },
  aftercareHeading: { th: aftercare.heading, en: 'Support after handover', zh: '交付后的维护' },
  aftercareBody: {
    th: aftercare.body,
    en: 'We do not disappear after handover. There is a named person responsible, an agreed response time and regular system reviews, so the system develops with the business — not just with the contract.',
    zh: '交付之后我们不会消失。有明确的负责人、约定的响应时间以及定期的系统复盘，让系统随业务一起发展，而不只是按合同办事。'
  }
};

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

/** Mirrors `standards.items` in data/about.ts. */
export const standardText: readonly { heading: LocalizedText; body: LocalizedText }[] = [
  {
    heading: { th: standards.items[0].heading, en: 'Technology that lasts', zh: '选择经得起时间考验的技术' },
    body: {
      th: standards.items[0].body,
      en: 'We choose tools with long-term support and people available to work on them, such as TypeScript, PostgreSQL and containers. Newer tools are used only where they create a real advantage, not for the foundations of the system.',
      zh: '我们选择有长期支持、容易找到维护人员的工具，例如 TypeScript、PostgreSQL 和容器。新技术只用在真正能带来优势的地方，而不用于系统的根基。'
    }
  },
  {
    heading: { th: standards.items[1].heading, en: 'Type-safe from database to screen', zh: '从数据库到界面全程类型安全' },
    body: {
      th: standards.items[1].body,
      en: 'When the data structure changes, the system flags it at compile time — not as a bug report three weeks later.',
      zh: '当数据结构发生变化时，系统会在编译阶段就发出提醒，而不是三周后变成一条问题报告。'
    }
  },
  {
    heading: { th: standards.items[2].heading, en: 'Testing where it matters', zh: '在关键之处做测试' },
    body: {
      th: standards.items[2].body,
      en: 'We test business rules, money figures, access permissions and integrations rigorously, and test frequently changing screens only as much as needed. A coverage percentage is not a good goal; confidence in the risky paths is.',
      zh: '我们严格测试业务规则、金额数字、访问权限和系统对接，对经常变化的界面只做必要的测试。覆盖率百分比不是好目标，对高风险路径有把握才是。'
    }
  },
  {
    heading: { th: standards.items[3].heading, en: 'Designed for year two', zh: '为第二年而设计' },
    body: {
      th: standards.items[3].body,
      en: 'Migrations, feature flags, readable logs and identical environments at every stage are set up from the start. It costs a few days at the beginning and saves months once the system is in real use.',
      zh: '数据迁移、功能开关（Feature flag）、可读的日志以及各环境一致，都从一开始就设置好。前期多花几天，系统真正投入使用后能省下几个月。'
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

/** Mirrors `targetMarket.groups` in data/company.ts. */
export const marketGroupText: readonly { label: LocalizedText; note: LocalizedText }[] = [
  {
    label: { th: targetMarket.groups[0].label, en: 'SMEs', zh: '中小企业（SME）' },
    note: { th: targetMarket.groups[0].note, en: 'Businesses growing faster than their current systems', zh: '发展速度超过现有系统的企业' }
  },
  {
    label: { th: targetMarket.groups[1].label, en: 'Accounting firms', zh: '会计师事务所' },
    note: { th: targetMarket.groups[1].note, en: 'Document and period-close work that must be accurate and auditable', zh: '需要准确且可回查的文档与结账工作' }
  },
  {
    label: { th: targetMarket.groups[2].label, en: 'Factories', zh: '工厂' },
    note: { th: targetMarket.groups[2].note, en: 'Production, warehouse, costing and traceability', zh: '生产、仓储、成本与追溯' }
  },
  {
    label: { th: targetMarket.groups[3].label, en: 'Service businesses', zh: '服务型企业' },
    note: { th: targetMarket.groups[3].note, en: 'Queues, schedules and teams spread across many locations', zh: '排队、排班以及分布在多个地点的团队' }
  },
  {
    label: { th: targetMarket.groups[4].label, en: 'Retail', zh: '零售企业' },
    note: { th: targetMarket.groups[4].note, en: 'Multi-channel stock that has to match at all times', zh: '需要时刻保持一致的多渠道库存' }
  },
  {
    label: { th: targetMarket.groups[5].label, en: 'Companies with internal systems', zh: '已有内部系统的公司' },
    note: { th: targetMarket.groups[5].note, en: 'Existing systems that need extending or connecting', zh: '需要扩展或相互连接的现有系统' }
  },
  {
    label: { th: targetMarket.groups[6].label, en: 'Spreadsheet-heavy businesses', zh: '大量依赖电子表格的企业' },
    note: { th: targetMarket.groups[6].note, en: 'Files so scattered nobody knows which one is the real version', zh: '文件分散到没人知道哪一份才是正式版本' }
  },
  {
    label: { th: targetMarket.groups[7].label, en: 'Organisations that need automation', zh: '需要自动化的组织' },
    note: { th: targetMarket.groups[7].note, en: 'Recurring work that takes up a whole department every month', zh: '每月占用整个部门时间的周期性工作' }
  }
];
