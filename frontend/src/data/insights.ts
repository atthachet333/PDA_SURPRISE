export const insightCategories = [
  'ERP & Business Systems',
  'Automation',
  'Web & Application',
  'HR & Payroll',
  'Data & Integration',
  'Technology Strategy'
] as const;

export type InsightCategory = (typeof insightCategories)[number];

export interface Insight {
  id: string;
  slug: string;
  titleTh: string;
  titleEn?: string;
  category: InsightCategory;
  excerpt: string;
  body?: string[];
  published: boolean;
  /** Branded illustration key or a future approved image path. */
  image: string;
  readingTime?: number;
  author?: string;
  date?: string;
}

export const insightsIntro = {
  eyebrow: 'INSIGHTS',
  title: ['บทความและมุมมอง', 'เรื่องระบบธุรกิจที่ใช้งานได้จริง'],
  lead: 'แนวคิดสำหรับคนที่กำลังตัดสินใจเรื่องระบบธุรกิจ เนื้อหาฉบับเต็มจะเผยแพร่เมื่อเรียบเรียงและตรวจสอบครบแล้ว'
} as const;

/** A card only becomes interactive after real body copy is present. */
export const isInsightPublished = (insight: Insight): boolean =>
  insight.published === true && Boolean(insight.body?.length);

export const insights: Insight[] = [
  {
    id: 'insight-erp-101', slug: 'what-is-erp', titleTh: 'ERP คืออะไร และธุรกิจแบบไหนควรเริ่มใช้',
    category: 'ERP & Business Systems', excerpt: 'สัญญาณที่บอกว่าข้อมูลและขั้นตอนของธุรกิจเริ่มต้องการระบบกลาง มากกว่าการเพิ่มไฟล์หรือเพิ่มคนประสานงาน',
    published: false, image: 'diagram:erp'
  },
  {
    id: 'insight-custom-software', slug: 'custom-software-vs-off-the-shelf', titleTh: 'Custom Software ต่างจากโปรแกรมสำเร็จรูปอย่างไร',
    category: 'Technology Strategy', excerpt: 'เปรียบเทียบความยืดหยุ่น ต้นทุนระยะยาว และภาระการเปลี่ยนวิธีทำงานให้เข้ากับซอฟต์แวร์แต่ละแบบ',
    published: false, image: 'diagram:build-or-buy'
  },
  {
    id: 'insight-spreadsheet', slug: 'reduce-spreadsheet-dependency', titleTh: 'ทำไมธุรกิจควรลดการพึ่ง Spreadsheet',
    category: 'ERP & Business Systems', excerpt: 'จุดเปลี่ยนจากไฟล์ที่คล่องตัว ไปสู่ความเสี่ยงจากหลายเวอร์ชัน หลายผู้แก้ และข้อมูลที่ตรวจสอบยาก',
    published: false, image: 'diagram:spreadsheet'
  },
  {
    id: 'insight-automation', slug: 'automation-reduces-repetitive-work', titleTh: 'Automation ช่วยลดงานซ้ำในองค์กรได้อย่างไร',
    category: 'Automation', excerpt: 'แนวทางเลือกงานที่ทำซ้ำตามกฎชัดเจนให้ระบบรับช่วง โดยยังคงจุดตรวจสอบที่คนต้องตัดสินใจไว้',
    published: false, image: 'diagram:automation'
  },
  {
    id: 'insight-payroll', slug: 'what-good-payroll-needs', titleTh: 'ระบบ Payroll ที่ดีควรมีอะไรบ้าง',
    category: 'HR & Payroll', excerpt: 'มากกว่าการคำนวณเงินเดือน คือกฎที่แก้ได้ การตรวจย้อนหลัง และคำอธิบายตัวเลขที่ฝ่ายบุคคลตอบได้ทันที',
    published: false, image: 'diagram:payroll'
  },
  {
    id: 'insight-web-app', slug: 'who-needs-a-web-application', titleTh: 'Web Application เหมาะกับธุรกิจแบบไหน',
    category: 'Web & Application', excerpt: 'เมื่อเว็บไซต์ธรรมดาไม่พอ และทีมต้องใช้ข้อมูล ทำรายการ หรือทำงานร่วมกันผ่านเบราว์เซอร์',
    published: false, image: 'device:web-app'
  },
  {
    id: 'insight-mobile-app', slug: 'does-every-business-need-a-mobile-app', titleTh: 'Mobile Application จำเป็นกับทุกธุรกิจหรือไม่',
    category: 'Web & Application', excerpt: 'เกณฑ์ตัดสินใจจากพฤติกรรมผู้ใช้ ฟังก์ชันอุปกรณ์ และความถี่ในการใช้งาน ก่อนลงทุนทำแอป',
    published: false, image: 'device:mobile'
  },
  {
    id: 'insight-documents', slug: 'document-system-reduces-risk', titleTh: 'ระบบจัดเก็บเอกสารช่วยลดความเสี่ยงอย่างไร',
    category: 'ERP & Business Systems', excerpt: 'สิทธิ์ เวอร์ชัน ประวัติ และการค้นหา ช่วยลดความเสี่ยงที่เอกสารสำคัญจะหายหรือถูกใช้งานผิดฉบับ',
    published: false, image: 'diagram:documents'
  },
  {
    id: 'insight-api', slug: 'what-is-api-integration', titleTh: 'API Integration คืออะไร และช่วยเชื่อมระบบอย่างไร',
    category: 'Data & Integration', excerpt: 'อธิบายการส่งข้อมูลระหว่างระบบ และสิ่งที่ต้องวางแผนเรื่องสิทธิ์ ความผิดพลาด และการตรวจสอบย้อนหลัง',
    published: false, image: 'diagram:api'
  },
  {
    id: 'insight-internal-system', slug: 'internal-systems-help-teams-move-faster', titleTh: 'ทำไม Internal System ถึงช่วยให้ทีมทำงานเร็วขึ้น',
    category: 'Technology Strategy', excerpt: 'ลดการส่งต่องานผ่านแชตและไฟล์ ด้วยสถานะ สิทธิ์ และข้อมูลที่ทุกฝ่ายเห็นร่วมกันในบริบทเดียว',
    published: false, image: 'diagram:internal-tools'
  },
  {
    id: 'insight-erp-crm', slug: 'erp-vs-crm', titleTh: 'ERP กับ CRM ต่างกันอย่างไร',
    category: 'ERP & Business Systems', excerpt: 'แยกบทบาทของระบบหลังบ้านและระบบความสัมพันธ์ลูกค้า พร้อมจุดที่ข้อมูลของทั้งสองระบบควรเชื่อมกัน',
    published: false, image: 'diagram:erp-crm'
  },
  {
    id: 'insight-build-or-saas', slug: 'build-software-or-use-saas', titleTh: 'ควรทำ Software เองหรือใช้ SaaS สำเร็จรูป',
    category: 'Technology Strategy', excerpt: 'กรอบคิดจากความแตกต่างของ Workflow งบประมาณ เวลา และความสำคัญเชิงกลยุทธ์ของระบบนั้นต่อธุรกิจ',
    published: false, image: 'diagram:saas'
  },
  {
    id: 'insight-workflow-first', slug: 'design-workflow-before-code', titleTh: 'การออกแบบ Workflow ก่อนเขียนโปรแกรมสำคัญอย่างไร',
    category: 'Automation', excerpt: 'การเห็นจุดตัดสินใจ ผู้รับผิดชอบ และข้อยกเว้นก่อนเริ่มพัฒนา ช่วยลดการแก้ระบบจากความเข้าใจไม่ตรงกัน',
    published: false, image: 'diagram:workflow'
  },
  {
    id: 'insight-line-hr', slug: 'who-needs-hr-through-line', titleTh: 'ระบบ HR ผ่าน LINE เหมาะกับองค์กรแบบไหน',
    category: 'HR & Payroll', excerpt: 'เหมาะเมื่อพนักงานต้องทำรายการสั้น ๆ บ่อยครั้ง และองค์กรต้องการลดแรงต้านจากการติดตั้งหรือเรียนรู้แอปใหม่',
    published: false, image: 'device:line-hr'
  },
  {
    id: 'insight-dashboard', slug: 'what-a-good-dashboard-shows', titleTh: 'Dashboard ที่ดีควรแสดงข้อมูลอะไร',
    category: 'Data & Integration', excerpt: 'เริ่มจากคำถามที่ต้องตัดสินใจ ไม่ใช่จำนวนกราฟ พร้อมแนวคิดเรื่องนิยามตัวเลขและการเจาะกลับไปยังข้อมูลต้นทาง',
    published: false, image: 'diagram:dashboard'
  }
];

export const publishedInsights = insights.filter(isInsightPublished);
export const getInsight = (slug: string) => insights.find((insight) => insight.slug === slug);
