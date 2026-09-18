export interface Insight {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  /** Reading time in minutes. */
  minutes: number;
  /**
   * OWNER INPUT REQUIRED: no dates or authors are published until they are
   * real. `published` stays false so the card shows "เร็ว ๆ นี้" instead of a
   * fabricated publication date.
   */
  published: boolean;
  date?: string;
  author?: string;
  body?: string[];
}

export const insightsIntro = {
  eyebrow: 'INSIGHTS',
  title: ['บทความและมุมมอง', 'เรื่องระบบธุรกิจที่ใช้งานได้จริง'],
  lead: 'เขียนจากงานที่ทำจริง ไม่ใช่บทความ SEO เนื้อหาชุดแรกกำลังทยอยเผยแพร่'
} as const;

/**
 * Local content for now — no CMS. Add `body` and set `published: true` with a
 * real `date` and `author` when an article is ready.
 */
export const insights: Insight[] = [
  {
    slug: 'what-is-erp',
    category: 'ERP',
    title: 'ERP คืออะไร และธุรกิจแบบไหนควรเริ่มใช้',
    excerpt:
      'ไม่ใช่ทุกธุรกิจต้องมี ERP ตั้งแต่วันแรก บทความนี้อธิบายสัญญาณที่บอกว่าถึงเวลาแล้ว และสิ่งที่ควรเตรียมก่อนเริ่ม',
    minutes: 8,
    published: false
  },
  {
    slug: 'internal-tools-reduce-rework',
    category: 'Internal Tools',
    title: 'ทำไมระบบภายในองค์กรถึงช่วยลดงานซ้ำ',
    excerpt:
      'งานซ้ำส่วนใหญ่ไม่ได้เกิดจากคนทำงานช้า แต่เกิดจากข้อมูลอยู่คนละที่ และไม่มีใครเห็นภาพรวมพร้อมกัน',
    minutes: 6,
    published: false
  },
  {
    slug: 'custom-vs-off-the-shelf',
    category: 'Custom Software',
    title: 'Custom Software ต่างจากโปรแกรมสำเร็จรูปอย่างไร',
    excerpt:
      'เปรียบเทียบต้นทุนจริงทั้งสองทาง ทั้งค่าลิขสิทธิ์ ค่าปรับแต่ง ค่าฝึกอบรม และต้นทุนแฝงจากการเปลี่ยนวิธีทำงานตามโปรแกรม',
    minutes: 9,
    published: false
  },
  {
    slug: 'system-before-or-after-growth',
    category: 'Strategy',
    title: 'ควรวางระบบก่อนธุรกิจโต หรือหลังธุรกิจโต',
    excerpt:
      'วางเร็วไปก็เสียเงินกับสิ่งที่ยังไม่จำเป็น วางช้าไปก็ต้องรื้อ บทความนี้เสนอเกณฑ์ที่ใช้ตัดสินใจได้จริง',
    minutes: 7,
    published: false
  }
];

export const publishedInsights = insights.filter((insight) => insight.published);
