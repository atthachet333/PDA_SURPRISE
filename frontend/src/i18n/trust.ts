import type { Locale } from './locales';
import type { LocalizedText } from './text';

/**
 * ============================================================================
 * TRUST & CREDIBILITY — About / Services layer (EP40)
 * ============================================================================
 * Evidence over adjectives. Every statement here is backed by something the
 * visitor can open on this site: a case study, the process, the company
 * details, or the delivered technology in `data/company.ts`.
 *
 * NOT CLAIMED, IN ANY LANGUAGE
 *   certifications (ISO, SOC 2 …), penetration testing, awards, client or
 *   team counts, years in business, uptime figures, fixed prices, fixed
 *   durations, 24/7 or unlimited support, and anything under OWNER DECISION
 *   (payroll tax / social security, NAS backup scope, store publishing,
 *   multi-company / digital-signature / offline capabilities).
 *   tests/trust.test.mjs enforces this.
 * ============================================================================
 */

type Lines = Record<Locale, readonly string[]>;

/* ------------------------------------------------------ scope factors -- */

export const scopeCopy = {
  title: { th: ['ขอบเขต เวลา และราคา', 'ประเมินจากงานจริงของคุณ'], en: ['Scope, time and price', 'are assessed from your actual work'], zh: ['范围、时间和价格', '根据您的实际需求评估'] } as Lines,
  lead: {
    th: 'เราไม่ตั้งราคาหรือระยะเวลาแบบแพ็กเกจตายตัว เพราะสองระบบที่ชื่อเหมือนกันอาจมีขอบเขตต่างกันมาก สิ่งที่มีผลต่อการประเมินมีดังนี้',
    en: 'We do not publish fixed packages or durations, because two systems with the same name can differ greatly in scope. These are the things that shape an estimate:',
    zh: '我们不设固定的套餐价格或工期，因为名称相同的两个系统，范围可能相差很大。影响评估的因素如下：'
  },
  factors: {
    th: ['ความซับซ้อนของ Workflow และกฎทางธุรกิจ', 'จำนวน Workflow และบทบาทของผู้ใช้', 'การเชื่อมต่อกับระบบหรือเครื่องมือเดิม', 'การย้ายข้อมูลจากไฟล์หรือระบบเดิม', 'แพลตฟอร์มที่ต้องรองรับ เช่น เว็บ หรือมือถือ', 'ระดับการทดสอบและการนำขึ้นระบบ'],
    en: ['How complex the workflows and business rules are', 'How many workflows and user roles there are', 'Integration with existing systems or tools', 'Migrating data from files or older systems', 'The platforms required, such as web or mobile', 'The level of testing and deployment needed'],
    zh: ['工作流程与业务规则的复杂度', '工作流程和用户角色的数量', '与现有系统或工具的对接', '从文件或旧系统迁移数据', '需要支持的平台，例如网页或手机', '测试与上线部署的要求']
  } as Lines,
  note: {
    th: 'ทุกโครงการประเมินตามขอบเขตงาน หลังจากคุยเรื่องโจทย์แล้ว',
    en: 'Every project is estimated by scope, after we have talked through the brief.',
    zh: '每个项目都会在沟通需求之后，按范围进行评估。'
  },
  cta: { th: 'เล่าโจทย์เพื่อประเมินขอบเขต', en: 'Describe your project for an estimate', zh: '描述需求以评估范围' }
};

/* -------------------------------------------------------- technology -- */

/** Mirrors `techStack` in data/company.ts, keyed by group then tool name. */
export const techText: Record<string, { group: LocalizedText; notes: Record<string, LocalizedText> }> = {
  Frontend: {
    group: { th: 'ส่วนหน้า', en: 'Frontend', zh: '前端' },
    notes: {
      React: { th: 'หน้าจอของระบบงานและเว็บไซต์', en: 'Screens for business systems and websites', zh: '业务系统与网站的界面' },
      TypeScript: { th: 'ตรวจชนิดข้อมูลตั้งแต่ตอนเขียนโค้ด ทั้งหน้าเว็บและ API', en: 'Type checking while code is written, in both the web pages and the API', zh: '在编写代码时进行类型检查，覆盖网页与 API' },
      Vite: { th: 'Build เว็บแอปของระบบภายในและเว็บไซต์นี้', en: 'Builds the internal web apps and this website', zh: '构建内部 Web 应用和本网站' },
      'Next.js': { th: 'เว็บไซต์ที่ต้องการหน้าเนื้อหาจำนวนมาก', en: 'A website with many content pages', zh: '内容页面较多的网站' },
      'Tailwind CSS': { th: 'ระบบสไตล์ของหน้าเว็บ', en: 'Styling system for web pages', zh: '网页的样式系统' }
    }
  },
  Backend: {
    group: { th: 'ส่วนหลังบ้าน', en: 'Backend', zh: '后端' },
    notes: {
      'Node.js': { th: 'รันบริการฝั่งเซิร์ฟเวอร์และ API', en: 'Runs server-side services and APIs', zh: '运行服务端服务与 API' },
      Fastify: { th: 'API ของระบบ Payroll ระบบไฟล์กลาง และเว็บไซต์นี้', en: 'The API for the payroll system, the central file system and this website', zh: 'Payroll 系统、集中文件系统和本网站的 API' },
      Express: { th: 'API แยกจากหน้าเว็บของเว็บไซต์ S2', en: 'The separate API behind the S2 website', zh: 'S2 网站独立于网页的 API' },
      Prisma: { th: 'เข้าถึงฐานข้อมูลแบบมีชนิดข้อมูลกำกับ', en: 'Typed database access', zh: '带类型约束的数据库访问' }
    }
  },
  Data: {
    group: { th: 'ข้อมูลและไฟล์', en: 'Data & files', zh: '数据与文件' },
    notes: {
      MySQL: { th: 'ฐานข้อมูลของระบบ Payroll และระบบไฟล์กลาง', en: 'Database for the payroll system and the central file system', zh: 'Payroll 系统与集中文件系统的数据库' },
      'S3-compatible object storage': { th: 'เก็บไฟล์ของระบบไฟล์กลาง แยกจากข้อมูลกำกับไฟล์', en: 'Stores the central file system’s files, separately from their metadata', zh: '存储集中文件系统的文件，并与文件元数据分开' }
    }
  },
  Integration: {
    group: { th: 'การเชื่อมต่อ', en: 'Integration', zh: '系统对接' },
    notes: {
      'LINE Official Account': { th: 'ช่องทางยื่นคำขอและแจ้งเตือนของระบบ HR', en: 'Request and notification channel for the HR system', zh: 'HR 系统的申请与通知渠道' },
      'REST API': { th: 'ให้หน้าเว็บคุยกับหลังบ้านผ่าน API ที่ตรวจข้อมูลได้', en: 'Web pages talk to the backend through an API that validates data', zh: '网页通过可校验数据的 API 与后端通信' }
    }
  },
  Deployment: {
    group: { th: 'การนำขึ้นระบบ', en: 'Deployment', zh: '上线部署' },
    notes: {
      'Windows Server': { th: 'เซิร์ฟเวอร์ที่ให้บริการเว็บไซต์นี้', en: 'The server that runs this website', zh: '运行本网站的服务器' },
      PM2: { th: 'ดูแล Process ของเว็บไซต์ให้กลับมาทำงานหลังรีสตาร์ต', en: 'Keeps the website process running and restores it after a restart', zh: '管理网站进程，并在重启后自动恢复' },
      'Cloudflare Tunnel': { th: 'HTTPS และทางเข้าเว็บไซต์โดยไม่เปิดพอร์ตเซิร์ฟเวอร์ตรง', en: 'HTTPS and access to the website without exposing server ports directly', zh: '提供 HTTPS 访问，无需直接开放服务器端口' },
      PWA: { th: 'ติดตั้งระบบไฟล์กลางเป็นแอปบนมือถือได้', en: 'Lets the central file system be installed as an app on phones', zh: '让集中文件系统可以作为应用安装到手机上' }
    }
  }
};

/* --------------------------------------------------- quality + privacy -- */

export const qualityCopy = {
  practicesTitle: { th: 'สิ่งที่เราตรวจในงานพัฒนา', en: 'What we check during development', zh: '开发过程中的检查' },
  practices: {
    th: [
      'ตรวจ Type และ Lint ของโค้ดก่อนรวมงาน',
      'ชุดทดสอบอัตโนมัติสำหรับกฎทางธุรกิจและเส้นทางสำคัญ',
      'Build สำหรับ Production และตรวจผลก่อนนำขึ้นระบบ',
      'ตรวจการแสดงผลตั้งแต่มือถือถึงจอใหญ่',
      'ทบทวนสิทธิ์ตามบทบาทในระบบที่มีผู้ใช้หลายระดับ',
      'ตรวจข้อมูลนำเข้าทั้งฝั่งหน้าเว็บและฝั่งเซิร์ฟเวอร์'
    ],
    en: [
      'Type checking and linting before code is merged',
      'Automated tests for business rules and critical paths',
      'A production build, verified before deployment',
      'Display checks from phones to large screens',
      'Role and permission review in systems with several user levels',
      'Input validation in both the browser and the server'
    ],
    zh: [
      '合并代码前进行类型检查与 Lint 检查',
      '针对业务规则和关键路径的自动化测试',
      '生成生产构建并在上线前验证',
      '从手机到大屏幕的显示检查',
      '在多级用户系统中复核角色与权限',
      '在浏览器端和服务器端同时校验输入数据'
    ]
  } as Lines,
  practicesNote: {
    th: 'ระดับการทดสอบกำหนดตามขอบเขตของแต่ละโครงการ',
    en: 'The level of testing is set by each project’s scope.',
    zh: '测试的程度根据每个项目的范围确定。'
  },
  privacyTitle: { th: 'ข้อมูลและการเปิดเผย', en: 'Data and disclosure', zh: '数据与公开' },
  privacy: {
    th: [
      'พิจารณาสิทธิ์การเข้าถึง ข้อมูลส่วนบุคคล และการเปิดเผยข้อมูลตามประเภทของระบบ',
      'แยกผลงานเป็นเว็บไซต์สาธารณะ ระบบของลูกค้า และระบบภายใน ตามระดับการเปิดเผย',
      'ไม่เปิดเผย URL ภายในหรือข้อมูลลูกค้าในหน้าผลงาน',
      'ภาพหน้าจอจริงเผยแพร่เมื่อผ่านการตรวจเรื่องข้อมูลแล้วเท่านั้น',
      'ไม่ขอรหัสผ่านหรือข้อมูลเข้าถึงระบบผ่านแบบฟอร์มติดต่อ'
    ],
    en: [
      'Access rights, personal data and disclosure are considered according to the type of system',
      'Work is separated into public websites, client systems and internal systems by how openly it can be shown',
      'No internal URLs or client data appear on the work pages',
      'Real screenshots are published only after a data review',
      'We never ask for passwords or system access through the contact form'
    ],
    zh: [
      '根据系统类型考虑访问权限、个人数据和信息公开',
      '按公开程度将案例分为公开网站、客户系统和内部系统',
      '案例页面不公开内部网址或客户数据',
      '真实截图仅在通过数据审查后发布',
      '联系表单不会索取密码或系统访问信息'
    ]
  } as Lines,
  privacyLink: { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy policy', zh: '隐私政策' }
};

/* ------------------------------------------------------------ support -- */

export const supportCopy = {
  worksTitle: { th: 'งานที่ทำต่อได้หลังส่งมอบ', en: 'What we can do after handover', zh: '交付后可以继续做的工作' },
  works: {
    th: ['แก้ไขข้อผิดพลาดที่พบหลังใช้งานจริง', 'ปรับปรุงเล็กน้อยจากการใช้งาน', 'เพิ่มฟีเจอร์หรือโมดูลใหม่', 'ปรับ Workflow เมื่อวิธีทำงานเปลี่ยน', 'ช่วยนำขึ้นระบบและย้ายเซิร์ฟเวอร์', 'ดูแลตามรอบที่ตกลงกัน'],
    en: ['Fixing bugs found in real use', 'Small improvements based on use', 'New features or modules', 'Workflow changes when the way of working changes', 'Deployment and server move assistance', 'Maintenance on an agreed schedule'],
    zh: ['修复实际使用中发现的问题', '根据使用情况做小幅改进', '新增功能或模块', '工作方式变化时调整工作流程', '协助上线部署与服务器迁移', '按约定周期进行维护']
  } as Lines,
  model: {
    th: 'รูปแบบการดูแลขึ้นอยู่กับขอบเขตและลักษณะของแต่ละโปรเจกต์ เราไม่มีแพ็กเกจดูแลแบบตายตัว ขอบเขต ช่องทาง และระยะเวลาตอบกลับจะตกลงร่วมกันก่อนเริ่มดูแล',
    en: 'The support model depends on each project’s scope and nature. We do not sell fixed support packages; scope, channels and response times are agreed together before support begins.',
    zh: '维护方式取决于每个项目的范围和性质。我们没有固定的维护套餐；维护范围、沟通渠道和响应时间会在开始维护前共同约定。'
  }
};

/* ------------------------------------------------------------ company -- */

export const companyCopy = {
  title: { th: 'ข้อมูลบริษัท', en: 'Company information', zh: '公司信息' },
  lead: {
    th: 'ข้อมูลสำหรับติดต่อและตรวจสอบ ใช้ชุดเดียวกันทุกหน้าของเว็บไซต์',
    en: 'Our contact and verification details — the same on every page of this site.',
    zh: '用于联系和核实的信息，在本网站的每个页面上都保持一致。'
  },
  registeredName: { th: 'ชื่อบริษัท', en: 'Registered name', zh: '公司名称' },
  address: { th: 'ที่อยู่', en: 'Address', zh: '地址' },
  phone: { th: 'โทรศัพท์', en: 'Phone', zh: '电话' },
  email: { th: 'อีเมล', en: 'Email', zh: '邮箱' },
  line: { th: 'LINE Official Account', en: 'LINE Official Account', zh: 'LINE 官方账号' },
  hours: { th: 'เวลาทำการ', en: 'Business hours', zh: '营业时间' }
} satisfies Record<string, LocalizedText>;

/* -------------------------------------------------------- cross-links -- */

export const trustLinks = {
  howWeWork: { th: 'ดูวิธีการทำงานและการดูแลหลังส่งมอบ', en: 'How we work and support after handover', zh: '查看工作方式与交付后维护' },
  companyInfo: { th: 'ข้อมูลบริษัท', en: 'Company information', zh: '公司信息' }
} satisfies Record<string, LocalizedText>;
