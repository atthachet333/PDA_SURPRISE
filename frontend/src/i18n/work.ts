import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * ============================================================================
 * WORK + WORK DETAIL — page framing
 * ============================================================================
 * Project records are in `i18n/caseStudies.ts`; this file holds the words
 * around them. Section codes (01 / FEATURED WORK …) are English design labels
 * on every locale, as on the Thai page.
 * ============================================================================
 */

type Lines = Record<Locale, readonly string[]>;

export const projectText = {
  capabilities: { th: 'ความสามารถของระบบ', en: 'System capabilities', zh: '系统能力' },
  leavesSite: {
    th: '(เปิดแท็บใหม่ ออกจากเว็บไซต์ PDA BLISS)',
    en: '(opens in a new tab and leaves the PDA BLISS website)',
    zh: '（在新标签页中打开，将离开 PDA BLISS 网站）'
  },
  leavesSiteTo: {
    th: '(เปิดแท็บใหม่ ออกจากเว็บไซต์ PDA BLISS ไปที่ {host})',
    en: '(opens in a new tab and leaves the PDA BLISS website for {host})',
    zh: '（在新标签页中打开，将离开 PDA BLISS 网站，前往 {host}）'
  },
  actor: { th: 'ผู้ดำเนินการ: ', en: 'Carried out by: ', zh: '执行者：' }
} satisfies Record<string, LocalizedText>;

/** The two owner-verified figures. Values live in data/company.ts. */
export const metricText: readonly { label: LocalizedText; detail: LocalizedText }[] = [
  {
    label: { th: 'ระบบซอฟต์แวร์', en: 'Software systems', zh: '软件系统' },
    detail: { th: 'ระบบธุรกิจที่พัฒนาและส่งมอบแล้ว', en: 'Business systems developed and delivered', zh: '已开发并交付的业务系统' }
  },
  {
    label: { th: 'เว็บไซต์', en: 'Websites', zh: '网站' },
    detail: { th: 'เว็บไซต์องค์กรและธุรกิจที่เปิดใช้งานแล้ว', en: 'Corporate and business websites launched', zh: '已上线的企业与商业网站' }
  }
];

export const workPage = {
  heroCode: { th: 'WORK · ผลงาน', en: 'WORK', zh: 'WORK · 案例' },
  heroTitle: {
    th: ['เราไม่ได้แค่ทำเว็บไซต์', 'เราสร้างระบบที่ใช้ทำงานจริง'],
    en: ['We do not just make websites.', 'We build systems people work in.'],
    zh: ['我们不只做网站，', '我们打造真正用于工作的系统']
  },
  heroLead: {
    th: 'ผลงานของเราครอบคลุมระบบหลังบ้าน เว็บไซต์ และเครื่องมือสำหรับงานจริงของธุรกิจ แต่ละโครงการเล่าจากปัญหา สิ่งที่เราสร้าง และวิธีที่ระบบทำงาน',
    en: 'Our work covers back-office systems, websites and tools for real business operations. Each project is told through the problem, what we built and how the system works.',
    zh: '我们的案例涵盖后台系统、网站以及用于实际业务的工具。每个项目都从问题、我们构建的内容以及系统如何运作来介绍。'
  },
  heroNote: {
    th: 'หน้านี้อธิบาย {n} โครงการที่เปิดเผยรายละเอียดได้ ระบบของลูกค้าแสดงโดยไม่เปิดเผยข้อมูลภายใน',
    en: 'This page describes {n} projects we can share in detail. Client systems are shown without revealing any internal data.',
    zh: '本页介绍 {n} 个可以公开详情的项目。客户系统的展示不会透露任何内部数据。'
  },
  featuredTitle: { th: ['ผลงานที่แสดง', 'ความสามารถคนละด้าน'], en: ['Work that shows', 'different strengths'], zh: ['展示不同能力的', '代表案例'] } as Lines,
  allTitle: { th: 'ผลงานทั้งหมด', en: 'All projects', zh: '全部案例' },
  showing: { th: 'แสดง {shown} จาก {total} โครงการ', en: 'Showing {shown} of {total} projects', zh: '显示 {shown} / {total} 个项目' },
  filterGroup: { th: 'กรองผลงานตามประเภท', en: 'Filter projects by type', zh: '按类型筛选案例' },
  howTitle: { th: 'จากโจทย์ ถึงระบบที่ใช้งาน', en: 'From brief to working system', zh: '从需求到可用的系统' },
  techTitle: { th: 'เครื่องมือที่ใช้จริงในโครงการเหล่านี้', en: 'Tools actually used in these projects', zh: '这些项目中实际使用的工具' },
  techLead: {
    th: 'เลือกเครื่องมือตามโจทย์ ไม่ใช่ตามกระแส งานของระบบสำคัญกว่าชื่อเทคโนโลยี',
    en: 'We choose tools for the job, not the trend. What the system does matters more than the name of the technology.',
    zh: '我们根据需求而不是潮流选择工具。系统要完成的工作，比技术名称更重要。'
  },
  ctaTitle: {
    th: ['มีระบบที่อยากทำอยู่หรือยัง?', 'เล่าโจทย์ให้เราฟัง'],
    en: ['Have a system in mind?', 'Tell us about it'],
    zh: ['已经有想做的系统了吗？', '告诉我们您的需求']
  } as Lines,
  showcaseTitle: { th: ['ผลงานที่', 'ใช้ทำงานจริง'], en: ['Work that is', 'used every day'], zh: ['真正投入', '日常使用的案例'] } as Lines,
  showcaseLead: {
    th: 'ระบบหลังบ้าน เว็บไซต์ และเครื่องมือสำหรับงานจริงของธุรกิจ แต่ละงานเล่าจากปัญหาและสิ่งที่เราสร้าง',
    en: 'Back-office systems, websites and tools for real business work — each told through the problem and what we built.',
    zh: '后台系统、网站以及用于实际业务的工具——每个案例都从问题和我们构建的内容讲起。'
  }
};

/** The six-step "how we build" strip on /work. Titles stay English design labels. */
export const workProcess: readonly { title: string; text: LocalizedText }[] = [
  { title: 'Requirement', text: { th: 'เก็บโจทย์จากงานจริง', en: 'Gather the brief from the real work', zh: '从实际工作中收集需求' } },
  { title: 'Design', text: { th: 'ออกแบบ Workflow และหน้าจอ', en: 'Design the workflow and screens', zh: '设计工作流程与界面' } },
  { title: 'Development', text: { th: 'พัฒนาเป็นระบบที่ใช้ได้', en: 'Build it into a usable system', zh: '开发成可用的系统' } },
  { title: 'Test', text: { th: 'ทดสอบกับข้อมูลและผู้ใช้', en: 'Test with real data and users', zh: '用真实数据和用户测试' } },
  { title: 'Deploy', text: { th: 'นำขึ้นระบบจริง', en: 'Put it into production', zh: '正式上线' } },
  { title: 'Support', text: { th: 'ดูแลและปรับต่อ', en: 'Support and keep improving', zh: '维护并持续改进' } }
];

export const detailPage = {
  back: { th: 'กลับไปหน้าผลงาน', en: 'Back to all work', zh: '返回案例列表' },
  solves: { th: 'ระบบนี้แก้โจทย์อะไร: ', en: 'What this system solves: ', zh: '这个系统解决什么问题：' },
  problemTitle: { th: ['เริ่มจากปัญหา', 'ไม่ใช่หน้าจอ'], en: ['Start from the problem,', 'not the screens'], zh: ['从问题出发，', '而不是从界面出发'] } as Lines,
  solutionTitle: { th: ['ออกแบบ Workflow', 'ให้ข้อมูลไปต่อได้'], en: ['Design the workflow', 'so data keeps moving'], zh: ['设计工作流程，', '让数据顺畅流转'] } as Lines,
  howTitle: { th: ['เลือกแต่ละขั้น', 'เพื่อดูสิ่งที่เกิดขึ้น'], en: ['Choose a step', 'to see what happens'], zh: ['选择每个步骤，', '查看具体发生了什么'] } as Lines,
  howLead: {
    th: 'ทุกขั้นระบุผู้ดำเนินการ สิ่งที่ระบบทำ และ Output ที่ส่งต่อไปยังขั้นถัดไป',
    en: 'Each step names who carries it out, what the system does and the output passed on to the next step.',
    zh: '每一步都注明执行者、系统所做的事，以及传递给下一步的输出（Output）。'
  },
  featuresTitle: { th: ['ฟีเจอร์ที่จัดตาม', 'หน้าที่ของระบบ'], en: ['Features grouped', 'by what the system does'], zh: ['按系统职能', '划分的功能'] } as Lines,
  mediaRealTitle: { th: ['ภาพหน้าจอจริง', 'ของโครงการนี้'], en: ['Real screenshots', 'of this project'], zh: ['本项目的', '真实截图'] } as Lines,
  mediaRealBody: {
    th: 'เป็นหน้าสาธารณะ จึงแสดงภาพจริงได้โดยไม่มีข้อมูลส่วนบุคคล',
    en: 'These are public pages, so real images can be shown without any personal data.',
    zh: '这是公开页面，因此可以展示真实画面，且不含任何个人数据。'
  },
  mediaMockTitle: { th: ['หน้าจอจริงจะเผยแพร่', 'เมื่อผ่าน Privacy review'], en: ['Real screens will be published', 'after a privacy review'], zh: ['真实界面将在', '通过隐私审查后发布'] } as Lines,
  mediaMockBody: {
    th: 'ขณะนี้ใช้ภาพจำลองจากโครงสร้าง UI ที่ตรวจสอบได้ เพราะหน้าจอจริงอาจมีข้อมูลพนักงาน ลูกค้า การเงิน หรือชื่อไฟล์ภายใน',
    en: 'For now we show an illustration built from the verified UI structure, because the real screens may contain employee, customer or financial data, or internal file names.',
    zh: '目前展示的是依据已核实的界面结构制作的示意图，因为真实界面可能包含员工、客户、财务数据或内部文件名。'
  },
  outcomeTitle: { th: ['ผลลัพธ์เชิง', 'การทำงาน'], en: ['Operational', 'outcomes'], zh: ['工作层面的', '成果'] } as Lines,
  outcomeNote: {
    th: 'ไม่มีการแสดงเปอร์เซ็นต์ ROI หรือจำนวนผู้ใช้ เพราะยังไม่มีข้อมูลการวัดผลที่ยืนยันสำหรับเผยแพร่',
    en: 'No ROI percentages or user counts are shown, because there is no verified measurement data we can publish yet.',
    zh: '这里不展示 ROI 百分比或用户数量，因为目前还没有可以公开的、经过核实的测量数据。'
  },
  relatedTitle: { th: 'ระบบที่เกี่ยวข้อง', en: 'Related systems', zh: '相关系统' },
  viewInUniverse: { th: 'ดูใน System Universe', en: 'View in the System Universe', zh: '在 System Universe 中查看' },
  relatedService: { th: 'ดูบริการที่เกี่ยวข้อง', en: 'View the related service', zh: '查看相关服务' },
  consultSimilar: { th: 'อยากทำระบบลักษณะนี้', en: 'Discuss a system like this', zh: '咨询类似系统' }
};
