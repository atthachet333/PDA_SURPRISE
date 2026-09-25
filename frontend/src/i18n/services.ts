import type { PrimaryService, Service } from '@/data/services';
import type { Locale } from './locales';
import type { LocalizedText } from './text';
import type { ContentPack } from './content/types';

/**
 * ============================================================================
 * SERVICES — EN / ZH overlays for `data/services.ts`
 * ============================================================================
 * Ids, icons, tech, previews and related projects come from the Thai record;
 * only the words a visitor reads are here.
 *
 * CLAIM RULES (same as the Thai file, and tested in every language)
 *   - Payroll: no automatic tax or social-security compliance.
 *   - Mobile: store publishing and developer accounts are scoped per project.
 *   - NAS: backup and security scope is agreed per project — no guarantee.
 *   - "As agreed in scope" caveats are kept wherever the Thai has them.
 * ============================================================================
 */

export interface ServiceText {
  eyebrow?: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: readonly string[];
  problem?: string;
  problems?: readonly string[];
  targetUsers?: readonly string[];
}

export function localizeService<T extends Service | PrimaryService>(service: T, pack: ContentPack | null): T {
  if (!pack) return service;
  const text = pack.services[service.id];
  if (!text) return service;
  return {
    ...service,
    eyebrow: text.eyebrow ?? service.eyebrow,
    title: text.title,
    summary: text.summary,
    detail: text.detail,
    deliverables: [...text.deliverables],
    ...('problem' in service && text.problem ? { problem: text.problem } : {}),
    ...('problems' in service && text.problems ? { problems: [...text.problems] } : {}),
    ...('targetUsers' in service && text.targetUsers ? { targetUsers: [...text.targetUsers] } : {})
  };
}

/* ------------------------------------------------------ differentiation -- */

export interface DistinctionText {
  label: string;
  is: string;
  forWhom: string;
}

/** Website ≠ web app ≠ ERP ≠ mobile ≠ file storage — kept as distinct as the Thai. */
/* -------------------------------------------------------- page copy -- */

export const servicesPage = {
  heroCode: { th: 'SERVICES · บริการของเรา', en: 'SERVICES', zh: 'SERVICES · 服务' },
  heroTitle: {
    th: ['เราเปลี่ยนงานที่ซับซ้อน', 'ให้กลายเป็นระบบที่ใช้งานจริง'],
    en: ['We turn complex work', 'into systems people actually use'],
    zh: ['我们把复杂的工作', '变成真正可用的系统']
  },
  heroLead: {
    th: 'ตั้งแต่ระบบหลังบ้าน เว็บไซต์ ไปจนถึงเครื่องมือเฉพาะสำหรับทีมของคุณ แต่ละบริการเริ่มจากปัญหาที่ธุรกิจเจอจริง ไม่ได้เริ่มจากเทคโนโลยี',
    en: 'From back-office systems and websites to tools built for your team. Every service starts from a problem businesses really face — not from the technology.',
    zh: '从后台系统、网站到为您团队定制的工具。每项服务都从企业真实遇到的问题出发，而不是从技术出发。'
  },
  statCore: { th: 'บริการหลัก', en: 'Core services', zh: '核心服务' },
  statCoreNote: { th: 'กลุ่มบริการที่ส่งมอบเป็นงานเดี่ยวได้', en: 'Service families we deliver as standalone projects', zh: '可作为独立项目交付的服务类别' },
  statWork: { th: 'มีผลงานจริง', en: 'With real work', zh: '有真实案例' },
  statWorkNote: { th: 'กลุ่มที่มี Case Study เปิดเผยรายละเอียดได้', en: 'Families with a case study we can share', zh: '有可公开详情的案例的类别' },
  statNote: {
    th: 'ทุกบริการอธิบายจากปัญหา สิ่งที่เราสร้าง และกลุ่มที่เหมาะ พร้อมลิงก์ไปยังผลงานจริงเมื่อมี',
    en: 'Every service is explained through the problem, what we build and who it suits, with links to real work where it exists.',
    zh: '每项服务都从问题、我们构建的内容和适用对象来说明，并在有案例时附上链接。'
  },
  mapTitle: { th: 'บริการหลัก {count}', en: 'Core services: {count}', zh: '核心服务 {count}' },
  mapCount: { th: '{n} กลุ่ม', en: '{n} families', zh: '{n} 类' },
  mapLead: {
    th: 'แต่ละกลุ่มแก้ปัญหาคนละแบบ เลือกหัวข้อเพื่อข้ามไปอ่านรายละเอียดด้านล่าง',
    en: 'Each family solves a different kind of problem. Choose one to jump to its details below.',
    zh: '每类服务解决不同的问题。选择一项即可跳转到下方的详细说明。'
  },
  sectionsTitle: { th: ['แต่ละบริการ', 'แก้ปัญหาอะไร'], en: ['What each service ', 'solves'], zh: ['每项服务', '解决什么问题'] },
  sectionsLead: {
    th: 'ทุกหัวข้อเล่าด้วยโครงเดียวกัน คือปัญหาที่เจอ สิ่งที่เราสร้าง กลุ่มที่เหมาะ และผลงานจริงที่เกี่ยวข้อง',
    en: 'Every service follows the same outline: the problem, what we build, who it suits and related real work.',
    zh: '每项服务都采用相同的结构：面临的问题、我们构建的内容、适用对象以及相关的真实案例。'
  },
  labelProblem: { th: 'PROBLEM · ปัญหาที่เจอ', en: 'PROBLEM', zh: 'PROBLEM · 面临的问题' },
  labelBuild: { th: 'WHAT WE BUILD · สิ่งที่เราสร้าง', en: 'WHAT WE BUILD', zh: 'WHAT WE BUILD · 我们构建的内容' },
  labelFor: { th: 'GOOD FOR · เหมาะกับใคร', en: 'GOOD FOR', zh: 'GOOD FOR · 适用对象' },
  labelWork: { th: 'RELATED WORK · ผลงานที่เกี่ยวข้อง', en: 'RELATED WORK', zh: 'RELATED WORK · 相关案例' },
  noWork: {
    th: 'ยังไม่มีผลงานที่เปิดเผยรายละเอียดได้ในกลุ่มนี้ — คุยกับเราเพื่อดูว่าทำอะไรให้ได้บ้าง',
    en: 'There is no work in this family that we can share in detail yet — talk to us to see what we can do for you.',
    zh: '这一类暂时还没有可以公开详情的案例——欢迎与我们沟通，了解我们能为您做什么。'
  },
  talkSystem: { th: 'คุยเรื่องบริการนี้', en: 'Discuss this service', zh: '咨询此项服务' },
  techIn: { th: 'เทคโนโลยีที่ใช้ใน{title}', en: 'Technology used in {title}', zh: '{title}所用技术' },
  distinctTitle: {
    th: ['เว็บไซต์ เว็บแอป และ ERP', 'ไม่ใช่สิ่งเดียวกัน'],
    en: ['Websites, web apps and ERP', 'are not the same thing'],
    zh: ['网站、Web 应用和 ERP', '并不是同一回事']
  },
  distinctLead: {
    th: 'คำเหล่านี้ถูกใช้ปนกันบ่อย ตารางนี้ช่วยให้คุยกันได้ตรงเรื่องตั้งแต่ครั้งแรก',
    en: 'These terms are often mixed up. This table helps us talk about the right thing from the first conversation.',
    zh: '这些词经常被混用。这张表能帮助我们从第一次沟通起就说到点子上。'
  },
  usedBy: { th: 'ใช้โดย', en: 'Used by', zh: '使用者' },
  capTitle: { th: ['ความสามารถที่มัก', 'ไปพร้อมกับงานหลัก'], en: ['Capabilities that usually ', 'ship with the core work'], zh: ['通常随核心项目', '一起交付的能力'] },
  capLead: {
    th: 'งานกลุ่มนี้ส่วนใหญ่เป็นส่วนหนึ่งของโปรเจกต์ใหญ่ ไม่ได้ขายแยกเป็นงานเดี่ยว แต่มักเป็นสิ่งที่ทำให้ระบบหลักใช้งานได้จริงในระยะยาว',
    en: 'This work is usually part of a larger project rather than sold on its own, but it is often what keeps the core system useful in the long run.',
    zh: '这类工作通常是大型项目的一部分，而不是单独出售，但往往正是它让核心系统能长期真正发挥作用。'
  },
  talkWork: { th: 'คุยเรื่องบริการนี้', en: 'Discuss this service', zh: '咨询此项服务' },
  universeTitle: { th: 'อยากเห็นว่าระบบเหล่านี้เชื่อมกันอย่างไร?', en: 'Want to see how these systems connect?', zh: '想看看这些系统如何相互连接？' },
  universeBody: {
    th: 'หน้านี้บอกว่าเราสร้างอะไรได้บ้าง ส่วนหน้า “ระบบของเรา” แสดงภาพรวมว่าระบบแต่ละตัวส่งข้อมูลต่อกันได้อย่างไร',
    en: 'This page shows what we can build. The “Solutions” page shows the big picture of how each system passes data to the next.',
    zh: '本页介绍我们能构建什么；“系统方案”页面则展示各个系统之间如何传递数据。'
  },
  universeCta: { th: 'ดูระบบของเรา', en: 'Explore our systems', zh: '查看系统方案' },
  orSee: { th: 'หรือดูผลงานจริง {n} โครงการที่ {link}', en: 'Or see {n} real projects on the {link}.', zh: '或在{link}中查看 {n} 个真实项目。' },
  orSeeLink: { th: 'หน้าผลงาน', en: 'Work page', zh: '案例页面' },
  ctaTitle: {
    th: ['มีโจทย์อยู่แล้ว', 'แต่ยังไม่รู้ว่าต้องทำระบบแบบไหน?'],
    en: ['You have a problem', 'but not sure which system it needs?'],
    zh: ['已经有需求，', '却不确定需要哪种系统？']
  },
  ctaBody: {
    th: 'เล่าให้ฟังว่าตอนนี้ทีมทำงานกันอย่างไร แล้วเราช่วยดูว่าควรเริ่มจากระบบไหนก่อน ถ้างานนี้ไม่ใช่สิ่งที่เราถนัด เราจะบอกคุณตั้งแต่ต้น',
    en: 'Tell us how your team works today and we will help you see which system to start with. If the job is not something we do well, we will tell you at the start.',
    zh: '告诉我们您的团队目前如何工作，我们会帮您判断应该先从哪个系统开始。如果这项工作不是我们擅长的，我们会在一开始就告诉您。'
  }
} satisfies Record<string, LocalizedText | Record<Locale, readonly string[]>>;
