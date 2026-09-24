import type { LocalizedText } from './text';

/**
 * ============================================================================
 * LEGAL — privacy, cookies, terms
 * ============================================================================
 * The Thai text is the original and is reproduced here unchanged. EN and ZH
 * are faithful renderings: nothing is added, softened or strengthened, and no
 * new commitment (retention period, rights procedure, governing law …) is
 * introduced in any language.
 *
 * OWNER REVIEW REQUIRED — every EN and ZH string in this file. Legal meaning
 * must be confirmed by the owner (and, ideally, counsel) before these pages
 * are relied on. The owner should also decide whether to add a clause stating
 * which language prevails; none is added here because that would itself be a
 * new legal commitment.
 *
 * `{email}`, `{phone}` and `{key}` are filled with the canonical contact
 * details and the real storage key, never translated.
 * ============================================================================
 */

export interface LegalSection {
  title: LocalizedText;
  body: LocalizedText;
}

export interface LegalPage {
  eyebrow: string;
  title: LocalizedText;
  lead: LocalizedText;
  sections: readonly LegalSection[];
}

export const privacyPage: LegalPage = {
  eyebrow: 'LEGAL / PRIVACY',
  title: { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy policy', zh: '隐私政策' },
  lead: {
    th: 'อธิบายข้อมูลที่เว็บไซต์รับเมื่อคุณติดต่อ PDA BLISS และเหตุผลที่เราใช้ข้อมูลนั้น',
    en: 'What information this website receives when you contact PDA BLISS, and why we use it.',
    zh: '说明您联系 PDA BLISS 时本网站会收到哪些信息，以及我们使用这些信息的原因。'
  },
  sections: [
    {
      title: { th: 'ข้อมูลที่เราได้รับ', en: 'Information we receive', zh: '我们收到的信息' },
      body: {
        th: 'แบบฟอร์มติดต่ออาจรับชื่อ บริษัท อีเมล หมายเลขโทรศัพท์ และรายละเอียดโปรเจกต์ที่คุณกรอก ข้อมูลเหล่านี้ถูกส่งมาโดยคุณเพื่อให้เราตอบกลับคำถามหรือประเมินแนวทางของโปรเจกต์',
        en: 'The contact form may receive your name, company, email address, phone number and the project details you enter. You send this information so that we can answer your questions or assess an approach for your project.',
        zh: '联系表单可能会收到您填写的姓名、公司、邮箱、电话号码和项目详情。这些信息由您主动提交，以便我们回复您的问题或评估项目方案。'
      }
    },
    {
      title: { th: 'เราใช้ข้อมูลอย่างไร', en: 'How we use it', zh: '我们如何使用这些信息' },
      body: {
        th: 'เราใช้ข้อมูลเพื่ออ่านและตอบกลับคำขอ ติดต่อกลับตามช่องทางที่คุณให้ไว้ และพูดคุยเกี่ยวกับบริการที่เกี่ยวข้องกับคำขอนั้น เราไม่แสดงข้อมูลจากแบบฟอร์มบนเว็บไซต์สาธารณะ',
        en: 'We use the information to read and reply to your request, to contact you through the channel you gave, and to discuss services related to that request. We do not display form data on the public website.',
        zh: '我们使用这些信息来阅读并回复您的请求、通过您提供的方式与您联系，以及沟通与该请求相关的服务。我们不会在公开网站上展示表单数据。'
      }
    },
    {
      title: { th: 'คุกกี้และการตั้งค่า', en: 'Cookies and settings', zh: 'Cookie 与设置' },
      body: {
        th: 'เว็บไซต์บันทึกการเลือกคุกกี้ไว้ในเบราว์เซอร์ของคุณ ขณะนี้ยังไม่มีระบบวิเคราะห์ผู้เข้าชมติดตั้งอยู่ อ่านรายละเอียดได้ที่หน้านโยบายคุกกี้',
        en: 'The website stores your cookie choice in your browser. No visitor analytics tool is installed at present. See the cookie policy for details.',
        zh: '网站会将您的 Cookie 选择保存在您的浏览器中。目前尚未安装任何访客分析工具。详情请参阅 Cookie 政策页面。'
      }
    },
    {
      title: { th: 'ติดต่อเรา', en: 'Contact us', zh: '联系我们' },
      body: {
        th: 'หากต้องการสอบถามเกี่ยวกับข้อมูลที่ส่งผ่านเว็บไซต์ ติดต่อได้ที่ {email} หรือ {phone}',
        en: 'For questions about information sent through the website, contact us at {email} or {phone}.',
        zh: '如对通过本网站提交的信息有任何疑问，请通过 {email} 或 {phone} 与我们联系。'
      }
    }
  ]
};

export const cookiePage: LegalPage = {
  eyebrow: 'LEGAL / COOKIES',
  title: { th: 'นโยบายคุกกี้', en: 'Cookie policy', zh: 'Cookie 政策' },
  lead: {
    th: 'ข้อมูลตามการทำงานจริงของเว็บไซต์ และตัวเลือกที่คุณควบคุมได้',
    en: 'How the website actually works, and the choices you control.',
    zh: '根据网站的实际运作方式说明，以及您可以自行控制的选项。'
  },
  sections: [
    {
      title: { th: 'คุกกี้คืออะไร', en: 'What cookies are', zh: '什么是 Cookie' },
      body: {
        th: 'คุกกี้และพื้นที่จัดเก็บของเบราว์เซอร์ช่วยให้เว็บไซต์จดจำข้อมูลขนาดเล็กบนอุปกรณ์ เช่น การเลือกความยินยอมของคุณ',
        en: 'Cookies and browser storage let a website remember small pieces of information on your device, such as your consent choice.',
        zh: 'Cookie 和浏览器存储让网站可以在您的设备上记住少量信息，例如您的同意选择。'
      }
    },
    {
      title: { th: 'คุกกี้ที่จำเป็น', en: 'Necessary cookies', zh: '必要 Cookie' },
      body: {
        th: 'เว็บไซต์ใช้ localStorage ชื่อ {key} เพื่อจดจำว่าคุณยอมรับคุกกี้ประเภทใด รายการนี้จำเป็นต่อการไม่แสดงคำถามเดิมทุกครั้งที่เข้าชม',
        en: 'The website uses a localStorage entry named {key} to remember which types of cookies you accepted. It is needed so the same question is not shown on every visit.',
        zh: '网站使用名为 {key} 的 localStorage 条目来记住您接受了哪些类型的 Cookie。这是为了避免每次访问都重复显示同一个问题。'
      }
    },
    {
      title: { th: 'คุกกี้วิเคราะห์และการตั้งค่า', en: 'Analytics and preference cookies', zh: '分析类与偏好设置 Cookie' },
      body: {
        th: 'ขณะนี้เว็บไซต์ยังไม่ได้ติดตั้งระบบวิเคราะห์ผู้เข้าชมหรือโหลดสคริปต์วิเคราะห์ตามความยินยอม ตัวเลือกวิเคราะห์และการตั้งค่าถูกเตรียมไว้เพื่อรองรับการเชื่อมต่อจริงในอนาคตเท่านั้น',
        en: 'The website does not currently install a visitor analytics tool or load analytics scripts based on consent. The analytics and preference options exist only to support a real connection in the future.',
        zh: '目前网站尚未安装访客分析工具，也不会根据同意加载分析脚本。分析与偏好设置选项仅为将来可能的实际接入而预留。'
      }
    },
    {
      title: { th: 'เปลี่ยนการตั้งค่า', en: 'Changing your settings', zh: '更改设置' },
      body: {
        th: 'คุณสามารถเปิดหน้าต่างตั้งค่าใหม่และบันทึกตัวเลือกได้ตลอดเวลา',
        en: 'You can reopen the settings window and save your choices at any time.',
        zh: '您可以随时重新打开设置窗口并保存您的选择。'
      }
    },
    {
      title: { th: 'ติดต่อ', en: 'Contact', zh: '联系' },
      body: { th: 'สอบถามได้ที่ {email}', en: 'Questions can be sent to {email}.', zh: '如有疑问，请发送至 {email}。' }
    }
  ]
};

export const termsPage: LegalPage = {
  eyebrow: 'LEGAL / TERMS',
  title: { th: 'เงื่อนไขการใช้งาน', en: 'Terms of use', zh: '使用条款' },
  lead: {
    th: 'ข้อกำหนดพื้นฐานสำหรับการใช้งานเว็บไซต์สาธารณะของ PDA BLISS',
    en: 'The basic terms for using the public PDA BLISS website.',
    zh: '使用 PDA BLISS 公开网站的基本条款。'
  },
  sections: [
    {
      title: { th: 'การใช้เว็บไซต์', en: 'Using the website', zh: '网站的使用' },
      body: {
        th: 'คุณสามารถใช้เว็บไซต์เพื่อศึกษาบริการ ผลงาน และติดต่อ PDA BLISS ได้ กรุณาอย่าใช้แบบฟอร์มหรือช่องทางติดต่อเพื่อส่งข้อมูลที่ผิดกฎหมาย รบกวนระบบ หรือแอบอ้างเป็นบุคคลอื่น',
        en: 'You may use the website to learn about PDA BLISS’s services and work, and to contact PDA BLISS. Please do not use the forms or contact channels to send unlawful information, disrupt the system, or impersonate another person.',
        zh: '您可以使用本网站了解 PDA BLISS 的服务与案例，并与 PDA BLISS 联系。请勿利用表单或联系渠道发送违法信息、干扰系统或冒充他人。'
      }
    },
    {
      title: { th: 'ข้อมูลบนเว็บไซต์', en: 'Information on the website', zh: '网站上的信息' },
      body: {
        th: 'ข้อมูลบริการและตัวอย่างระบบใช้เพื่ออธิบายแนวทางการทำงาน ขอบเขต ราคา และกำหนดส่งของแต่ละโปรเจกต์จะยึดตามข้อเสนอและข้อตกลงที่จัดทำแยกต่างหาก',
        en: 'Service information and system examples are there to explain how we work. The scope, price and delivery dates of each project follow the separate proposal and agreement made for it.',
        zh: '服务信息和系统示例用于说明我们的工作方式。每个项目的范围、价格和交付日期，以单独制定的方案和协议为准。'
      }
    },
    {
      title: { th: 'ทรัพย์สินและผลงาน', en: 'Property and work', zh: '权利与作品' },
      body: {
        th: 'ชื่อ โลโก้ เนื้อหา และองค์ประกอบของเว็บไซต์เป็นของเจ้าของที่เกี่ยวข้อง ภาพระบบของลูกค้าจะเผยแพร่เฉพาะเมื่อผ่านการตรวจสอบและได้รับอนุญาตแล้ว',
        en: 'The names, logos, content and elements of the website belong to their respective owners. Images of client systems are published only after review and with permission.',
        zh: '网站上的名称、标志、内容和元素归各自的所有者所有。客户系统的画面仅在经过审核并获得许可后才会发布。'
      }
    }
  ]
};

export const legalText = {
  openSettings: { th: 'ตั้งค่าคุกกี้', en: 'Cookie settings', zh: 'Cookie 设置' }
} satisfies Record<string, LocalizedText>;
