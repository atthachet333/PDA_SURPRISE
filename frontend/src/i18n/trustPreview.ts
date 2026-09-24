import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * Home trust preview (EP40): four things a visitor can check before talking
 * to us, each opening the page that proves it. Numbers are filled from the
 * canonical data ({cases}, {systems}, {websites}, {steps}) — none is typed
 * here, so the preview can never drift from the verified figures.
 */

type Lines = Record<Locale, readonly string[]>;

export const trustPreview = {
  title: { th: ['สิ่งที่คุณตรวจสอบได้', 'ก่อนเริ่มงานกับเรา'], en: ['What you can check', 'before working with us'], zh: ['在合作之前，', '您可以先核实这些'] } as Lines,
  lead: {
    th: 'ผลงาน ขั้นตอน ข้อมูลบริษัท และการดูแลหลังส่งมอบ อยู่บนเว็บไซต์นี้ทั้งหมด ไม่ต้องเชื่อจากคำโฆษณา',
    en: 'Our work, process, company details and support after handover are all on this site — no need to take an advert’s word for it.',
    zh: '我们的案例、流程、公司信息和交付后维护都在本网站上，无需只凭广告语判断。'
  },
  about: { th: 'เกี่ยวกับเรา', en: 'About us', zh: '关于我们' }
};

export const trustTiles: readonly { code: string; value: LocalizedText; detail: LocalizedText; link: LocalizedText; to: string }[] = [
  {
    code: 'REAL WORK',
    value: { th: '{cases} โครงการ', en: '{cases} projects', zh: '{cases} 个项目' },
    detail: {
      th: 'ที่เปิดเผยรายละเอียดได้ จาก {systems} ระบบซอฟต์แวร์ และ {websites} เว็บไซต์ที่ส่งมอบแล้ว',
      en: 'described in detail, from {systems} software systems and {websites} websites delivered',
      zh: '可公开详情的项目，来自已交付的 {systems} 个软件系统和 {websites} 个网站'
    },
    link: { th: 'ดูผลงานจริง', en: 'See real work', zh: '查看真实案例' },
    to: '/work'
  },
  {
    code: 'CLEAR PROCESS',
    value: { th: '{steps} ขั้นตอน', en: '{steps} steps', zh: '{steps} 个步骤' },
    detail: {
      th: 'ตั้งแต่ทำความเข้าใจธุรกิจ ออกแบบ พัฒนา ทดสอบ ส่งมอบ จนถึงดูแลต่อ',
      en: 'from understanding the business through design, build, testing and handover to ongoing support',
      zh: '从理解业务、设计、开发、测试、交付到持续维护'
    },
    link: { th: 'ดูวิธีการทำงาน', en: 'See how we work', zh: '查看工作方式' },
    to: '/about#process'
  },
  {
    code: 'REAL COMPANY',
    value: { th: 'PDA BLISS COMPANY LIMITED', en: 'PDA BLISS COMPANY LIMITED', zh: 'PDA BLISS COMPANY LIMITED' },
    detail: {
      th: 'สำนักงานที่{place} โทร อีเมล และ LINE ที่ติดต่อได้จริง',
      en: 'an office in {place}, with a phone, email and LINE account you can reach',
      zh: '办公室位于{place}，电话、邮箱和 LINE 均可实际联系'
    },
    link: { th: 'ข้อมูลบริษัท', en: 'Company information', zh: '公司信息' },
    to: '/about#company'
  },
  {
    code: 'AFTER DELIVERY',
    value: { th: 'ดูแลต่อได้', en: 'Ongoing support', zh: '持续维护' },
    detail: {
      th: 'แก้ไข ปรับปรุง และพัฒนาต่อ ตามขอบเขตที่ตกลงกัน',
      en: 'fixes, improvements and further development within the agreed scope',
      zh: '在约定范围内进行修复、改进和后续开发'
    },
    link: { th: 'การดูแลหลังส่งมอบ', en: 'Support after handover', zh: '交付后的维护' },
    to: '/about#support'
  }
];
