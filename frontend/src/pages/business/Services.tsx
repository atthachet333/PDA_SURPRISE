import { PageHeader } from '@/components/business/PageHeader';
import { ServiceExplorer } from '@/components/business/ServiceExplorer';
import { TechDiagram } from '@/components/business/TechDiagram';
import { ProcessPath } from '@/components/business/ProcessPath';
import { BigCTA } from '@/components/business/BigCTA';
import { services, primaryServices } from '@/data/services';

/**
 * /services — the seven primary services as the main explorer, then the
 * supporting capabilities as a second explorer so the two are not confused.
 */
const SUPPORTING = services.filter((service) => !service.primary);

export default function Services() {
  return (
    <>
      <PageHeader
        eyebrow="01 / SERVICES"
        title={<>บริการของเรา</>}
        lead="เจ็ดบริการหลักที่ธุรกิจไทยใช้งานจริง พร้อมความสามารถอื่นที่มักไปกับงานเดียวกัน"
      />

      <ServiceExplorer
        items={primaryServices}
        code="02 / PRIMARY"
        title={
          <>
            เจ็ดบริการหลัก
            <br />
            <span className="text-brand-600">ที่เราส่งมอบเป็นงานเดี่ยวได้</span>
          </>
        }
        lead="เลือกหัวข้อเพื่อดูสิ่งที่ส่งมอบและเทคโนโลยีที่ใช้"
      />

      <ServiceExplorer
        items={SUPPORTING}
        code="03 / CAPABILITIES"
        title={
          <>
            ความสามารถเพิ่มเติม
            <br />
            <span className="text-brand-600">ที่มักไปพร้อมกับงานหลัก</span>
          </>
        }
        lead="งานกลุ่มนี้ส่วนใหญ่เป็นส่วนหนึ่งของโปรเจกต์ใหญ่ ไม่ได้ขายแยกเป็นงานเดี่ยว"
      />

      <ProcessPath code="04 / PROCESS" />
      <TechDiagram code="05 / STACK" />
      <BigCTA code="06 / START" />
    </>
  );
}
