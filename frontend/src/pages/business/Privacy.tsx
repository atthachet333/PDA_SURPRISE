import { PageHeader } from '@/components/business/PageHeader';
import { Container } from '@/components/shared/Layout';
import { company } from '@/data/company';

export default function Privacy() {
  return <><PageHeader eyebrow="LEGAL / PRIVACY" title={<>นโยบายความเป็นส่วนตัว</>} lead="อธิบายข้อมูลที่เว็บไซต์รับเมื่อคุณติดต่อ PDA BLISS และเหตุผลที่เราใช้ข้อมูลนั้น" /><LegalBody><Section title="ข้อมูลที่เราได้รับ"><p>แบบฟอร์มติดต่ออาจรับชื่อ บริษัท อีเมล หมายเลขโทรศัพท์ และรายละเอียดโปรเจกต์ที่คุณกรอก ข้อมูลเหล่านี้ถูกส่งมาโดยคุณเพื่อให้เราตอบกลับคำถามหรือประเมินแนวทางของโปรเจกต์</p></Section><Section title="เราใช้ข้อมูลอย่างไร"><p>เราใช้ข้อมูลเพื่ออ่านและตอบกลับคำขอ ติดต่อกลับตามช่องทางที่คุณให้ไว้ และพูดคุยเกี่ยวกับบริการที่เกี่ยวข้องกับคำขอนั้น เราไม่แสดงข้อมูลจากแบบฟอร์มบนเว็บไซต์สาธารณะ</p></Section><Section title="คุกกี้และการตั้งค่า"><p>เว็บไซต์บันทึกการเลือกคุกกี้ไว้ในเบราว์เซอร์ของคุณ ขณะนี้ยังไม่มีระบบวิเคราะห์ผู้เข้าชมติดตั้งอยู่ อ่านรายละเอียดได้ที่หน้านโยบายคุกกี้</p></Section><Section title="ติดต่อเรา"><p>หากต้องการสอบถามเกี่ยวกับข้อมูลที่ส่งผ่านเว็บไซต์ ติดต่อได้ที่ <a href={`mailto:${company.email}`} className="text-brand-700 underline underline-offset-4">{company.email}</a> หรือ <a href={`tel:${company.phone}`} className="text-brand-700 underline underline-offset-4">{company.phoneDisplay}</a></p></Section></LegalBody></>;
}

export function LegalBody({ children }: { children: React.ReactNode }) { return <section className="sect sect--bright py-section"><Container><div className="mx-auto max-w-3xl space-y-12">{children}</div></Container></section>; }
export function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="thai-display text-xl font-bold text-ink">{title}</h2><div className="mt-4 space-y-4 text-sm leading-8 text-steel-600">{children}</div></section>; }
