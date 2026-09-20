import { PageHeader } from '@/components/business/PageHeader';
import { LegalBody, Section } from './Privacy';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function Terms() {
  usePageMeta(pageMeta.terms);

  return <><PageHeader eyebrow="LEGAL / TERMS" title={<>เงื่อนไขการใช้งาน</>} lead="ข้อกำหนดพื้นฐานสำหรับการใช้งานเว็บไซต์สาธารณะของ PDA BLISS" /><LegalBody><Section title="การใช้เว็บไซต์"><p>คุณสามารถใช้เว็บไซต์เพื่อศึกษาบริการ ผลงาน และติดต่อ PDA BLISS ได้ กรุณาอย่าใช้แบบฟอร์มหรือช่องทางติดต่อเพื่อส่งข้อมูลที่ผิดกฎหมาย รบกวนระบบ หรือแอบอ้างเป็นบุคคลอื่น</p></Section><Section title="ข้อมูลบนเว็บไซต์"><p>ข้อมูลบริการและตัวอย่างระบบใช้เพื่ออธิบายแนวทางการทำงาน ขอบเขต ราคา และกำหนดส่งของแต่ละโปรเจกต์จะยึดตามข้อเสนอและข้อตกลงที่จัดทำแยกต่างหาก</p></Section><Section title="ทรัพย์สินและผลงาน"><p>ชื่อ โลโก้ เนื้อหา และองค์ประกอบของเว็บไซต์เป็นของเจ้าของที่เกี่ยวข้อง ภาพระบบของลูกค้าจะเผยแพร่เฉพาะเมื่อผ่านการตรวจสอบและได้รับอนุญาตแล้ว</p></Section></LegalBody></>;
}
