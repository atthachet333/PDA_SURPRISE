import type { ContactIntent, ContactOption } from '@/data/contactFlow';
import type { Locale } from './locales';
import type { LocalizedText, Translations } from './text';

/**
 * ============================================================================
 * CONTACT — EN / ZH for the guided and quick forms
 * ============================================================================
 * Only what the visitor READS is localised. Every value the form SENDS stays
 * the same in every language — service ids, question ids and option values
 * (`under-10`, `stock`, `not-defined` …) — so a lead submitted from /zh/contact
 * is byte-for-byte the same business payload as one from /contact, apart from
 * whatever the visitor typed.
 *
 * Phone, email and LINE ID are never translated.
 * ============================================================================
 */

export interface QuestionText {
  label: string;
  helper?: string;
  placeholder?: string;
  /** Keyed by option value. */
  options?: Record<string, string>;
}

export interface IntentText {
  label: string;
  shortLabel: string;
  description: string;
  /** Keyed by question id. */
  questions: Record<string, QuestionText>;
}

const users = {
  en: { 'under-10': 'Under 10 people', '10-50': '10–50 people', '51-200': '51–200 people', 'over-200': 'More than 200 people', unknown: 'Not sure yet' },
  zh: { 'under-10': '少于 10 人', '10-50': '10–50 人', '51-200': '51–200 人', 'over-200': '超过 200 人', unknown: '暂不确定' }
};

export const intentText: Translations<Record<string, IntentText>> = {
  en: {
    'business-systems': {
      label: 'ERP / Back-office system',
      shortLabel: 'ERP',
      description: 'Stock, costing, purchasing, reporting and operations',
      questions: {
        'business-type': { label: 'What does your business do?', placeholder: 'e.g. manufacturing, wholesale or services' },
        modules: { label: 'Which areas do you want to manage in the system?', options: { stock: 'Stock', costing: 'Costing', purchasing: 'Purchasing', reports: 'Reports' } },
        'operational-users': { label: 'Roughly how many people will use the system?', helper: 'Skip this if you are not sure', options: users.en }
      }
    },
    payroll: {
      label: 'Payroll / HR',
      shortLabel: 'Payroll / HR',
      description: 'Attendance data, cycle review, calculation, approval and HR work',
      questions: {
        'employee-range': {
          label: 'Roughly how many employees do you have?',
          options: { 'under-20': 'Under 20 people', '20-100': '20–100 people', '101-500': '101–500 people', 'over-500': 'More than 500 people', unknown: 'Not sure yet' }
        },
        'attendance-source': {
          label: 'Where does your attendance data come from today?',
          options: { machine: 'Time clock', spreadsheet: 'Spreadsheet', 'existing-system': 'An existing system', none: 'No system yet' }
        },
        workforce: { label: 'How are your employees paid?', options: { monthly: 'Monthly', daily: 'Daily', mixed: 'Both' } },
        approval: { label: 'Is there an approval step for each cycle?', helper: 'Skip this if it has not been decided', options: { yes: 'Yes', no: 'No', unknown: 'Not sure yet' } }
      }
    },
    websites: {
      label: 'Website',
      shortLabel: 'Website',
      description: 'Corporate website, landing page or content website',
      questions: {
        'website-type': {
          label: 'What kind of website do you need?',
          options: { corporate: 'Corporate website', landing: 'Landing page', content: 'Content website', other: 'Something else' }
        },
        domain: { label: 'Do you already have a domain?', options: { yes: 'Yes', no: 'Not yet', unknown: 'Not sure yet' } },
        languages: { label: 'Which languages do you need?', options: { thai: 'Thai', english: 'English', other: 'Other languages' } },
        content: {
          label: 'How ready is your content?',
          options: { ready: 'Content is ready', partial: 'Some of it is ready', 'need-help': 'I need help planning the content' }
        }
      }
    },
    'web-applications': {
      label: 'Web application',
      shortLabel: 'Web App',
      description: 'Internal system, customer portal or web-based workflow',
      questions: {
        audience: { label: 'Who are the main users?', options: { internal: 'Internal team', customer: 'Customers', both: 'Both' } },
        'user-range': {
          label: 'Roughly how many users?',
          helper: 'A rough range is fine',
          options: { 'under-20': 'Under 20 people', '20-100': '20–100 people', 'over-100': 'More than 100 people', unknown: 'Not sure yet' }
        },
        'main-workflow': { label: 'What is the main workflow?', placeholder: 'e.g. receive a request, check it and approve it' },
        'data-source': { label: 'Is there existing data or a system to connect to?', placeholder: 'Skip this if you are not sure' }
      }
    },
    'mobile-applications': {
      label: 'Mobile application',
      shortLabel: 'Mobile App',
      description: 'An app for field teams or customers on their phones',
      questions: {
        audience: { label: 'Who are the main users?', options: { staff: 'Field team', customer: 'Customers', both: 'Both' } },
        platforms: { label: 'Which platforms do you need?', options: { ios: 'iOS', android: 'Android', both: 'Both' } },
        offline: { label: 'Does it need to work without a signal?', options: { yes: 'Yes', no: 'Not needed', unknown: 'Not sure yet' } }
      }
    },
    'document-management': {
      label: 'Document / File system',
      shortLabel: 'Documents / Files',
      description: 'Storage, documents, versions, permissions and approvals',
      questions: {
        scope: {
          label: 'Do you need storage, approvals, or both?',
          options: { storage: 'File storage', approval: 'Document approval', both: 'Both storage and approval' }
        },
        'current-storage': { label: 'How do you store files today?', placeholder: 'e.g. a shared drive, NAS or cloud drive' },
        roles: { label: 'What user groups or permission levels are there?', helper: 'No need to name individuals', placeholder: 'e.g. author, reviewer, approver' }
      }
    },
    'hr-line-bot': {
      label: 'LINE Bot',
      shortLabel: 'LINE Bot',
      description: 'Requests, approvals, notifications or data collection through LINE',
      questions: {
        audience: { label: 'Who will use the bot?', options: { employee: 'Employees', customer: 'Customers', both: 'Both' } },
        functions: {
          label: 'What should the bot help with?',
          options: { approval: 'Approvals', notification: 'Notifications', form: 'Collecting data or forms', automation: 'Automated tasks' }
        }
      }
    },
    automation: {
      label: 'Automation / Workflow',
      shortLabel: 'Automation',
      description: 'Cut repetitive work, schedule jobs, send notifications or connect systems',
      questions: {
        'automation-users': { label: 'Who is involved in this workflow?', options: { internal: 'Internal team', customer: 'Customers', both: 'Both' } },
        functions: {
          label: 'What kind of work do you want to automate?',
          options: { approval: 'Approvals', notification: 'Notifications', form: 'Collecting data or forms', scheduled: 'Scheduled jobs', integration: 'Connecting systems' }
        }
      }
    },
    'custom-software': {
      label: 'Improve an existing system',
      shortLabel: 'Existing system',
      description: 'Fix a workflow, consolidate data or keep developing a system you use',
      questions: {
        'existing-system': { label: 'What systems or tools do you use today?', placeholder: 'Please do not send passwords or system access details' },
        'improvement-focus': { label: 'Which part would you most like to improve?' }
      }
    },
    consulting: {
      label: 'Not sure yet / I would like advice',
      shortLabel: 'Advice',
      description: 'Start from the problem, then choose an approach together',
      questions: {
        topic: { label: 'What would you like to start talking about?', placeholder: 'A short description is fine — no need to know the technology' }
      }
    }
  },
  zh: {
    'business-systems': {
      label: 'ERP / 后台系统',
      shortLabel: 'ERP',
      description: '库存、成本、采购、报表与运营工作',
      questions: {
        'business-type': { label: '您的企业主要做什么？', placeholder: '例如：生产制造、批发或服务业' },
        modules: { label: '希望在系统中管理哪些部分？', options: { stock: '库存', costing: '成本', purchasing: '采购', reports: '报表' } },
        'operational-users': { label: '大约有多少人会使用系统？', helper: '不确定可以跳过', options: users.zh }
      }
    },
    payroll: {
      label: 'Payroll / HR',
      shortLabel: 'Payroll / HR',
      description: '考勤数据、周期核对、计算、审批与人事工作',
      questions: {
        'employee-range': {
          label: '大约有多少名员工？',
          options: { 'under-20': '少于 20 人', '20-100': '20–100 人', '101-500': '101–500 人', 'over-500': '超过 500 人', unknown: '暂不确定' }
        },
        'attendance-source': {
          label: '目前的考勤数据来自哪里？',
          options: { machine: '考勤机', spreadsheet: '电子表格', 'existing-system': '现有系统', none: '还没有系统' }
        },
        workforce: { label: '员工的计薪方式', options: { monthly: '月薪', daily: '日薪', mixed: '两种都有' } },
        approval: { label: '每个周期是否有审批流程？', helper: '尚未确定可以跳过', options: { yes: '有', no: '没有', unknown: '暂不确定' } }
      }
    },
    websites: {
      label: '网站',
      shortLabel: '网站',
      description: '企业网站、落地页或内容型网站',
      questions: {
        'website-type': { label: '需要什么类型的网站？', options: { corporate: '企业网站', landing: '落地页（Landing page）', content: '内容型网站', other: '其他类型' } },
        domain: { label: '是否已经有域名？', options: { yes: '已有', no: '还没有', unknown: '暂不确定' } },
        languages: { label: '需要哪些语言？', options: { thai: '泰语', english: '英语', other: '其他语言' } },
        content: { label: '内容准备得怎么样了？', options: { ready: '内容已准备好', partial: '部分已准备', 'need-help': '需要协助规划内容' } }
      }
    },
    'web-applications': {
      label: 'Web 应用',
      shortLabel: 'Web App',
      description: '内部系统、客户门户或基于网页的工作流程',
      questions: {
        audience: { label: '主要用户是谁？', options: { internal: '内部团队', customer: '客户', both: '两者都有' } },
        'user-range': { label: '大约有多少用户？', helper: '给出大致范围即可', options: { 'under-20': '少于 20 人', '20-100': '20–100 人', 'over-100': '超过 100 人', unknown: '暂不确定' } },
        'main-workflow': { label: '主要的工作流程是什么？', placeholder: '例如：接收申请、审核并批准' },
        'data-source': { label: '是否有需要对接的现有数据或系统？', placeholder: '不确定可以跳过' }
      }
    },
    'mobile-applications': {
      label: '移动应用',
      shortLabel: '移动应用',
      description: '供一线团队或客户在手机上使用的应用',
      questions: {
        audience: { label: '主要用户是谁？', options: { staff: '一线团队', customer: '客户', both: '两者都有' } },
        platforms: { label: '需要哪个平台？', options: { ios: 'iOS', android: 'Android', both: '两个平台都要' } },
        offline: { label: '是否需要在无信号时使用？', options: { yes: '需要', no: '不需要', unknown: '暂不确定' } }
      }
    },
    'document-management': {
      label: '文档 / 文件系统',
      shortLabel: '文档 / 文件',
      description: '存储空间、文档、版本、权限与审批',
      questions: {
        scope: { label: '需要存储、审批，还是两者都要？', options: { storage: '文件存储', approval: '文档审批', both: '存储和审批都要' } },
        'current-storage': { label: '目前用什么方式存储文件？', placeholder: '例如：共享盘、NAS 或云盘' },
        roles: { label: '有哪些用户组或权限级别？', helper: '无需填写个人姓名', placeholder: '例如：起草人、审核人、审批人' }
      }
    },
    'hr-line-bot': {
      label: 'LINE Bot',
      shortLabel: 'LINE Bot',
      description: '通过 LINE 提交申请、审批、通知或收集信息',
      questions: {
        audience: { label: '谁会使用这个 Bot？', options: { employee: '员工', customer: '客户', both: '两者都有' } },
        functions: { label: '希望 Bot 协助哪些事情？', options: { approval: '审批', notification: '通知', form: '收集信息或表单', automation: '自动执行任务' } }
      }
    },
    automation: {
      label: '自动化 / 工作流程',
      shortLabel: '自动化',
      description: '减少重复工作、定时任务、通知或系统对接',
      questions: {
        'automation-users': { label: '哪些人与这个流程相关？', options: { internal: '内部团队', customer: '客户', both: '两者都有' } },
        functions: { label: '希望自动化哪类工作？', options: { approval: '审批', notification: '通知', form: '收集信息或表单', scheduled: '定时任务', integration: '系统对接' } }
      }
    },
    'custom-software': {
      label: '改进现有系统',
      shortLabel: '现有系统',
      description: '修正工作流程、整合数据或继续开发正在使用的系统',
      questions: {
        'existing-system': { label: '目前在使用哪些系统或工具？', placeholder: '请勿发送密码或系统访问信息' },
        'improvement-focus': { label: '最想改进的是哪一部分？' }
      }
    },
    consulting: {
      label: '还不确定 / 想先咨询',
      shortLabel: '咨询',
      description: '先从需求谈起，再一起选择合适的方案',
      questions: {
        topic: { label: '想从哪个话题开始聊？', placeholder: '简单描述即可，不需要懂技术名称' }
      }
    }
  }
};

export function localizeIntent(intent: ContactIntent, locale: Locale): ContactIntent {
  if (locale === 'th') return intent;
  const text = intentText[locale][intent.id];
  if (!text) return intent;
  return {
    ...intent,
    label: text.label,
    shortLabel: text.shortLabel,
    description: text.description,
    questions: intent.questions.map((question) => {
      const q = text.questions[question.id];
      if (!q) return question;
      return {
        ...question,
        label: q.label,
        helper: question.helper !== undefined ? q.helper ?? question.helper : undefined,
        placeholder: question.placeholder !== undefined ? q.placeholder ?? question.placeholder : undefined,
        options: question.options?.map((option) => ({ ...option, label: q.options?.[option.value] ?? option.label }))
      };
    })
  };
}

/** Option lists keep their values; only labels change. */
export function localizeOptions(options: readonly ContactOption[], labels: Record<string, LocalizedText>, locale: Locale): ContactOption[] {
  return options.map((option) => ({ ...option, label: labels[option.value]?.[locale] ?? option.label }));
}

export const budgetLabel: Record<string, LocalizedText> = {
  'not-defined': { th: 'ยังไม่กำหนด', en: 'Not decided yet', zh: '尚未确定' },
  'under-50k': { th: 'ต่ำกว่า 50,000', en: 'Under 50,000 THB', zh: '50,000 泰铢以下' },
  '50k-100k': { th: '50,000–100,000', en: '50,000–100,000 THB', zh: '50,000–100,000 泰铢' },
  '100k-300k': { th: '100,000–300,000', en: '100,000–300,000 THB', zh: '100,000–300,000 泰铢' },
  'above-300k': { th: '300,000+', en: '300,000+ THB', zh: '300,000 泰铢以上' },
  'discuss-first': { th: 'อยากคุยก่อน', en: 'I would like to talk first', zh: '想先沟通' }
};

export const timelineLabel: Record<string, LocalizedText> = {
  'not-defined': { th: 'ยังไม่กำหนด', en: 'Not decided yet', zh: '尚未确定' },
  'within-1-month': { th: 'ภายใน 1 เดือน', en: 'Within 1 month', zh: '1 个月内' },
  '1-3-months': { th: '1–3 เดือน', en: '1–3 months', zh: '1–3 个月' },
  '3-6-months': { th: '3–6 เดือน', en: '3–6 months', zh: '3–6 个月' },
  'over-6-months': { th: 'มากกว่า 6 เดือน', en: 'More than 6 months', zh: '6 个月以上' }
};

export const stepLabel: Record<string, LocalizedText> = {
  intent: { th: 'สิ่งที่ต้องการ', en: 'What you need', zh: '需求' },
  situation: { th: 'สถานการณ์ตอนนี้', en: 'Current situation', zh: '目前情况' },
  outcome: { th: 'ผลลัพธ์ที่อยากได้', en: 'Desired outcome', zh: '期望结果' },
  contact: { th: 'ช่องทางติดต่อ', en: 'Contact details', zh: '联系方式' },
  review: { th: 'ตรวจสอบ', en: 'Review', zh: '确认' }
};

export const form = {
  modeGroup: { th: 'รูปแบบการติดต่อ', en: 'How would you like to contact us?', zh: '联系方式类型' },
  modeGuided: { th: 'ช่วยวางโจทย์ให้', en: 'Help me shape the brief', zh: '协助我梳理需求' },
  modeQuick: { th: 'ส่งข้อความแบบสั้น', en: 'Send a short message', zh: '发送简短留言' },
  privacyNote: {
    th: 'ไม่ต้องส่งรหัสผ่าน ข้อมูลลับ หรือข้อมูลส่วนบุคคลของพนักงาน',
    en: 'Please do not send passwords, confidential information or employees’ personal data.',
    zh: '请勿发送密码、机密信息或员工个人数据。'
  },
  askingAbout: { th: 'คุณกำลังสอบถามเกี่ยวกับ {topic}', en: 'You are asking about {topic}', zh: '您正在咨询：{topic}' },
  from: { th: ' จาก {source}', en: ' from {source}', zh: '（来自 {source}）' },
  sourceHome: { th: 'หน้าแรก', en: 'the home page', zh: '首页' },
  changeTopic: { th: 'เปลี่ยนหัวข้อ', en: 'Change topic', zh: '更换主题' },
  back: { th: '← ย้อนกลับ', en: '← Back', zh: '← 上一步' },
  next: { th: 'ถัดไป →', en: 'Next →', zh: '下一步 →' },
  sending: { th: 'กำลังส่ง…', en: 'Sending…', zh: '正在发送…' },
  confirmSend: { th: 'ยืนยันและส่งข้อมูล', en: 'Confirm and send', zh: '确认并发送' },
  progress: { th: 'ขั้นตอนการส่งข้อมูล', en: 'Form steps', zh: '填写步骤' },
  intentTitle: { th: 'คุณต้องการให้เราช่วยเรื่องอะไร?', en: 'What would you like help with?', zh: '您希望我们协助什么？' },
  intentLead: { th: 'เลือกหัวข้อที่ใกล้เคียงที่สุด เปลี่ยนภายหลังได้เสมอ', en: 'Choose the closest topic — you can always change it later.', zh: '请选择最接近的主题，之后随时可以更改。' },
  selected: { th: 'SELECTED ✓', en: 'SELECTED ✓', zh: '已选择 ✓' },
  chooseTopic: { th: 'เลือกหัวข้อนี้', en: 'Choose this topic', zh: '选择此主题' },
  situationTitle: { th: 'ตอนนี้คุณจัดการเรื่องนี้ด้วยวิธีไหน?', en: 'How do you handle this today?', zh: '目前您是如何处理这件事的？' },
  situationLabel: { th: 'สถานการณ์ปัจจุบัน', en: 'Current situation', zh: '目前情况' },
  situationPlaceholder: { th: 'เล่าขั้นตอนหรือปัญหาที่เจอสั้น ๆ', en: 'Briefly describe the process or the problem you face', zh: '简要描述目前的流程或遇到的问题' },
  detailsTitle: { th: 'รายละเอียดที่ช่วยให้เราเข้าใจเร็วขึ้น', en: 'Details that help us understand faster', zh: '帮助我们更快理解的细节' },
  detailsLead: { th: 'ทุกข้อนี้เป็นข้อมูลเสริม ไม่แน่ใจก็ข้ามได้', en: 'All of these are optional — skip anything you are unsure about.', zh: '以下均为补充信息，不确定可以跳过。' },
  outcomeTitle: { th: 'อยากให้ระบบช่วยให้งานดีขึ้นอย่างไร?', en: 'How should the system make the work better?', zh: '希望系统如何让工作变得更好？' },
  outcomeLead: { th: 'บอกผลลัพธ์ที่ต้องการ ไม่จำเป็นต้องรู้วิธีทำทางเทคนิค', en: 'Tell us the result you want — no need to know how it is done technically.', zh: '告诉我们您想要的结果，不需要了解技术实现方式。' },
  outcomeLabel: { th: 'ผลลัพธ์ที่อยากได้', en: 'Desired outcome', zh: '期望结果' },
  outcomePlaceholder: {
    th: 'เช่น ลดการกรอกข้อมูลซ้ำ และเห็นสถานะงานจากจุดเดียว',
    en: 'e.g. less re-entering of data, and work status visible in one place',
    zh: '例如：减少重复录入，并在一个地方看到工作状态'
  },
  budget: { th: 'ช่วงงบประมาณ (ไม่บังคับ)', en: 'Budget range (optional)', zh: '预算范围（选填）' },
  timeline: { th: 'ช่วงเวลาที่คิดไว้ (ไม่บังคับ)', en: 'Expected timeline (optional)', zh: '预计时间（选填）' },
  industry: { th: 'ประเภทธุรกิจ (ไม่บังคับ)', en: 'Type of business (optional)', zh: '行业类型（选填）' },
  existingWebsite: { th: 'เว็บไซต์ปัจจุบัน (ไม่บังคับ)', en: 'Current website (optional)', zh: '现有网站（选填）' },
  budgetNote: {
    th: 'ช่วงงบและเวลาใช้เพื่อเตรียมบทสนทนาเท่านั้น ไม่ใช่ราคาเสนอหรือคำสัญญาวันส่งมอบ',
    en: 'Budget and timeline are only used to prepare the conversation. They are not a quotation or a promised delivery date.',
    zh: '预算和时间仅用于准备沟通，并不构成报价或交付日期的承诺。'
  },
  contactTitle: { th: 'สะดวกให้เราติดต่อกลับทางไหน?', en: 'How should we get back to you?', zh: '您希望我们通过什么方式回复？' },
  contactLead: { th: 'กรอกอีเมล โทรศัพท์ หรือ LINE ID อย่างน้อยหนึ่งช่องทาง', en: 'Fill in at least one of email, phone or LINE ID.', zh: '请至少填写邮箱、电话或 LINE ID 其中一项。' },
  name: { th: 'ชื่อสำหรับติดต่อ', en: 'Contact name', zh: '联系人姓名' },
  company: { th: 'บริษัท / องค์กร (ไม่บังคับ)', en: 'Company / organisation (optional)', zh: '公司 / 组织（选填）' },
  email: { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  phone: { th: 'โทรศัพท์', en: 'Phone', zh: '电话' },
  notes: { th: 'ข้อมูลเพิ่มเติม (ไม่บังคับ)', en: 'Anything else (optional)', zh: '补充信息（选填）' },
  reviewTitle: { th: 'ตรวจสอบก่อนส่ง', en: 'Review before sending', zh: '发送前确认' },
  reviewLead: { th: 'ตรวจดูอีกครั้งก่อนส่งให้ทีมงาน แก้ไขส่วนไหนก็ได้', en: 'Check everything once more before it goes to the team. You can edit any part.', zh: '发送给团队之前请再检查一遍，任何部分都可以修改。' },
  edit: { th: 'แก้ไข', en: 'Edit', zh: '修改' },
  rowTopic: { th: 'หัวข้อ', en: 'Topic', zh: '主题' },
  rowBudget: { th: 'งบประมาณ', en: 'Budget', zh: '预算' },
  rowTimeline: { th: 'ช่วงเวลา', en: 'Timeline', zh: '时间' },
  rowName: { th: 'ชื่อ', en: 'Name', zh: '姓名' },
  rowCompany: { th: 'บริษัท / องค์กร', en: 'Company / organisation', zh: '公司 / 组织' },
  quickTitle: { th: 'ส่งข้อความแบบสั้น', en: 'Send a short message', zh: '发送简短留言' },
  quickLead: { th: 'ถ้ายังไม่อยากตอบเป็นขั้นตอน เล่าเรื่องที่ต้องการคุยได้เลย', en: 'If you would rather not go step by step, just tell us what you would like to discuss.', zh: '如果不想逐步填写，可以直接告诉我们想聊什么。' },
  quickMessage: { th: 'เรื่องที่ต้องการคุย', en: 'What would you like to discuss?', zh: '想沟通的内容' },
  quickPlaceholder: { th: 'เล่าโจทย์สั้น ๆ 1–2 ประโยค', en: 'Describe your needs in 1–2 sentences', zh: '用 1–2 句话简单描述您的需求' },
  quickSend: { th: 'ส่งข้อความ', en: 'Send message', zh: '发送留言' },
  successTitle: { th: 'ได้รับข้อมูลแล้ว', en: 'We have received your details', zh: '已收到您的信息' },
  successBody: {
    th: 'ทีมงานจะอ่านข้อมูลเพื่อเข้าใจโจทย์และเตรียมการพูดคุยขั้นถัดไป โดยติดต่อกลับผ่านช่องทางที่คุณระบุในเวลาทำการ',
    en: 'Our team will read your details to understand the brief and prepare for the next conversation, and will get back to you through the channel you gave during business hours.',
    zh: '我们的团队会阅读您的信息以理解需求、准备下一步的沟通，并在工作时间内通过您留下的方式与您联系。'
  },
  reference: { th: 'หมายเลขอ้างอิง', en: 'Reference number', zh: '参考编号' },
  sendAnother: { th: 'ส่งข้อความใหม่', en: 'Send another message', zh: '发送新留言' }
} satisfies Record<string, LocalizedText>;

export const validation = {
  serviceId: { th: 'กรุณาเลือกหัวข้อที่ใกล้เคียงที่สุด', en: 'Please choose the closest topic.', zh: '请选择最接近的主题。' },
  currentSituation: { th: 'ช่วยเล่าว่าตอนนี้จัดการเรื่องนี้อย่างไร', en: 'Please tell us how you handle this today.', zh: '请说明目前是如何处理这件事的。' },
  desiredOutcome: { th: 'ช่วยบอกผลลัพธ์ที่อยากได้', en: 'Please tell us the result you want.', zh: '请说明您期望的结果。' },
  url: { th: 'กรุณาระบุ URL ที่ถูกต้อง เช่น https://example.com', en: 'Please enter a valid URL, e.g. https://example.com', zh: '请输入有效的网址，例如 https://example.com' },
  contactName: { th: 'กรุณาระบุชื่อสำหรับติดต่อ', en: 'Please enter a contact name.', zh: '请填写联系人姓名。' },
  oneChannel: { th: 'ระบุอีเมล โทรศัพท์ หรือ LINE ID อย่างน้อยหนึ่งช่องทาง', en: 'Please give at least one of email, phone or LINE ID.', zh: '请至少填写邮箱、电话或 LINE ID 其中一项。' },
  email: { th: 'กรุณาระบุอีเมลที่ใช้งานได้', en: 'Please enter a working email address.', zh: '请填写有效的邮箱地址。' },
  notes: { th: 'กรุณาเล่าเรื่องที่ต้องการคุยอย่างน้อย 1–2 ประโยค', en: 'Please describe what you would like to discuss in at least 1–2 sentences.', zh: '请用至少 1–2 句话说明想沟通的内容。' },
  stepIncomplete: { th: 'ยังมีข้อมูลสั้น ๆ ที่ต้องตรวจสอบ', en: 'A few details still need checking.', zh: '还有一些信息需要检查。' },
  checkFields: { th: 'กรุณาตรวจสอบข้อมูลที่ระบุ', en: 'Please check the details you entered.', zh: '请检查您填写的信息。' },
  rateLimited: { th: 'ส่งข้อมูลหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง', en: 'Too many submissions. Please wait a moment and try again.', zh: '提交次数过多，请稍候再试。' },
  failed: {
    th: 'ยังส่งข้อมูลไม่ได้ ข้อมูลที่กรอกไว้ยังอยู่ครบ กรุณาลองอีกครั้งหรือติดต่อเราทางอีเมล',
    en: 'We could not send your details. Everything you entered is still here — please try again or contact us by email.',
    zh: '暂时无法发送。您填写的内容仍然保留，请重试或通过邮件与我们联系。'
  },
  /** Shown for a server field error outside Thai, whose message is written in Thai. */
  fieldInvalid: { th: 'กรุณาตรวจสอบข้อมูลช่องนี้', en: 'Please check this field.', zh: '请检查此项。' },
  serverRejected: { th: 'กรุณาตรวจสอบข้อมูลที่ระบุ', en: 'The server could not accept these details. Please check them and try again.', zh: '服务器未能接受这些信息，请检查后重试。' }
} satisfies Record<string, LocalizedText>;

export const contactPage = {
  title: { th: 'เล่าโจทย์ให้เราฟัง', en: 'Tell us about your project', zh: '告诉我们您的需求' },
  lead: {
    th: 'ยิ่งเราเข้าใจกระบวนการปัจจุบันมากเท่าไร การคุยครั้งแรกก็ยิ่งมีประโยชน์มากขึ้น',
    en: 'The better we understand how things work today, the more useful our first conversation will be.',
    zh: '我们越了解您目前的工作流程，第一次沟通就越有价值。'
  },
  email: { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  phone: { th: 'โทรศัพท์', en: 'Phone', zh: '电话' },
  line: { th: 'LINE OA', en: 'LINE OA', zh: 'LINE 官方账号' },
  office: { th: 'ที่ตั้งสำนักงาน', en: 'Office', zh: '办公地址' },
  hours: { th: 'เวลาทำการ', en: 'Business hours', zh: '营业时间' },
  nextSteps: {
    th: 'ทีมงานอ่านโจทย์และตอบกลับ|นัดคุยเพื่อเข้าใจ Workflow|สรุปแนวทาง ขอบเขต และขั้นตอนถัดไป',
    en: 'Our team reads your brief and replies|We arrange a call to understand the workflow|We summarise the approach, scope and next steps',
    zh: '团队阅读您的需求并回复|安排沟通以了解工作流程|总结方案、范围和下一步'
  }
} satisfies Record<string, LocalizedText>;
