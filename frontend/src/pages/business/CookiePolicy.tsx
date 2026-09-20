import { PageHeader } from '@/components/business/PageHeader';
import { company } from '@/data/company';
import { useCookieConsent } from '@/app/cookieConsentContext';
import { LegalBody, Section } from './Privacy';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';

export default function CookiePolicy() {
  usePageMeta(pageMeta.cookiePolicy);

  const { openSettings } = useCookieConsent();
  return <><PageHeader eyebrow="LEGAL / COOKIES" title={<>นโยบายคุกกี้</>} lead="ข้อมูลตามการทำงานจริงของเว็บไซต์ และตัวเลือกที่คุณควบคุมได้" /><LegalBody><Section title="คุกกี้คืออะไร"><p>คุกกี้และพื้นที่จัดเก็บของเบราว์เซอร์ช่วยให้เว็บไซต์จดจำข้อมูลขนาดเล็กบนอุปกรณ์ เช่น การเลือกความยินยอมของคุณ</p></Section><Section title="คุกกี้ที่จำเป็น"><p>เว็บไซต์ใช้ localStorage ชื่อ <code className="rounded bg-steel-100 px-1.5 py-1 text-xs">pda-cookie-consent-v1</code> เพื่อจดจำว่าคุณยอมรับคุกกี้ประเภทใด รายการนี้จำเป็นต่อการไม่แสดงคำถามเดิมทุกครั้งที่เข้าชม</p></Section><Section title="คุกกี้วิเคราะห์และการตั้งค่า"><p>ขณะนี้เว็บไซต์ยังไม่ได้ติดตั้งระบบวิเคราะห์ผู้เข้าชมหรือโหลดสคริปต์วิเคราะห์ตามความยินยอม ตัวเลือกวิเคราะห์และการตั้งค่าถูกเตรียมไว้เพื่อรองรับการเชื่อมต่อจริงในอนาคตเท่านั้น</p></Section><Section title="เปลี่ยนการตั้งค่า"><p>คุณสามารถเปิดหน้าต่างตั้งค่าใหม่และบันทึกตัวเลือกได้ตลอดเวลา</p><button type="button" onClick={openSettings} className="rounded-pill bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">ตั้งค่าคุกกี้</button></Section><Section title="ติดต่อ"><p>สอบถามได้ที่ <a href={`mailto:${company.email}`} className="text-brand-700 underline underline-offset-4">{company.email}</a></p></Section></LegalBody></>;
}
