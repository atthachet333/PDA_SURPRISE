import { PageHeader } from '@/components/business/PageHeader';
import { ContactForm } from '@/components/business/ContactForm';
import { Container } from '@/components/shared/Layout';
import { company } from '@/data/company';
import { cn } from '@/lib/cn';

/**
 * /contact — the form is the page. Everything else is a quiet reference column.
 *
 * Every contact detail comes from `data/company.ts`. Nothing is literal here.
 */
export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="01 / CONTACT"
        title={<>เล่าโจทย์ให้เราฟัง</>}
        lead="ยิ่งเราเข้าใจกระบวนการปัจจุบันมากเท่าไร การคุยครั้งแรกก็ยิ่งมีประโยชน์มากขึ้น"
      />

      <section className="sect sect--bright relative overflow-hidden py-section">
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.75fr)] lg:gap-16">
            <div>
              <p className="section-code">02 / BRIEF</p>
              <ContactForm />
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="section-code">03 / DIRECT</p>

              <dl className="mt-8 border-t border-steel-200">
                <Row label="อีเมล">
                  <a className="hover:text-brand-600" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </Row>
                <Row label="โทรศัพท์">
                  <a className="hover:text-brand-600" href={`tel:${company.phone}`}>
                    {company.phoneDisplay}
                  </a>
                </Row>
                <Row label="LINE OA">
                  <a
                    className="hover:text-brand-600"
                    href={company.lineUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {company.lineOA}
                  </a>
                </Row>
                <Row label="ที่ตั้งสำนักงาน">
                  <address className="not-italic">
                    {company.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </Row>
                <Row label="เวลาทำการ">
                  <span className="block">{company.businessHours.days}</span>
                  <span className="block">{company.businessHours.time}</span>
                  <span className="mt-2 block font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                    {company.businessHours.note}
                  </span>
                </Row>
              </dl>

              {/* What happens next */}
              <div className="mt-10 overflow-hidden rounded-panel border border-brand-400/20 bg-[linear-gradient(155deg,#063B2A,#04261B)] p-7 text-white">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300">
                  next steps
                </p>
                <ol className="mt-5 space-y-4">
                  {[
                    'ทีมงานอ่านโจทย์และตอบกลับ',
                    'นัดคุยเพื่อเข้าใจ Workflow',
                    'สรุปแนวทาง ขอบเขต และขั้นตอนถัดไป'
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3.5">
                      <span className="mt-px font-mono text-[0.625rem] tabular-nums text-brand-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs leading-6 text-brand-100/75">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

function Row({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-steel-200 py-5', className)}>
      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
        {label}
      </dt>
      <dd className="thai-display mt-2.5 break-words text-sm leading-relaxed text-ink [&_a]:transition-colors">
        {children}
      </dd>
    </div>
  );
}
