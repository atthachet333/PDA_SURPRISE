import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { Icon } from '@/components/shared/Icon';
import { ProcessPath } from '@/components/business/ProcessPath';
import { ServiceDistinctions, ServiceMap, ServiceSections } from '@/components/business/ServiceCatalogue';
import { primaryServices, supportingServices } from '@/data/services';
import { caseStudies } from '@/data/caseStudies';
import { company } from '@/data/company';
import { contactHref, isContactServiceId } from '@/data/contactRouting';
import { usePageMeta } from '@/hooks/usePageMeta';
import { pageMeta } from '@/lib/seo';
import { cn } from '@/lib/cn';

/**
 * /services — "PDA BLISS ช่วยธุรกิจของผมเรื่องอะไรได้บ้าง?"
 *
 *   01 hero          the answer in two lines
 *   02 capability map  all eight services in one scan
 *   03 services      one section each: problem → what we build → good for → work
 *   04 distinctions  website vs web app vs ERP vs mobile vs files
 *   05 process       how a project actually runs
 *   06 capabilities  the supporting work that ships inside the eight
 *   07 CTA           for visitors who have a problem but not a solution name
 *
 * /services answers what PDA BLISS can build. /solutions shows how those
 * systems connect as one universe — the cross-link in 06 keeps the two from
 * reading as the same page.
 */
export default function Services() {
  usePageMeta(pageMeta.services);
  useHashTarget();

  return (
    <>
      <ServicesHero />
      <ServiceMap code="02 / CAPABILITY MAP" />
      <ServiceSections code="03 / SERVICES" />
      <ServiceDistinctions code="04 / NOT THE SAME THING" />
      <ProcessPath code="05 / PROCESS" />
      <SupportingCapabilities />
      <ServicesCta />
    </>
  );
}

/**
 * Bring `/services#<service-id>` to the right section.
 *
 * Case studies, the footer menu and the System Universe all deep-link into a
 * specific service. A client-side route change does not perform the browser's
 * native fragment scroll, and the sections mount below the fold, so without
 * this every one of those links would land the visitor at the top of the page.
 * The rAF defer lets the section lay out before we measure it.
 */
function useHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    /*
      Two passes. The first lands on the section as soon as it exists; the
      second corrects for the sections above it settling (the mock panels lay
      out after first paint), which would otherwise leave the target off by a
      few hundred pixels on a cold load.
    */
    const timers = [60, 420].map((delay) =>
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }, delay)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [hash]);
}

/* --------------------------------------------------------------- 01 hero -- */

/** Concrete proof under the headline — counts, never adjectives. */
function ServicesHero() {
  const withWork = primaryServices.filter((service) => service.relatedProjects.length > 0).length;

  return (
    <section className="sect sect--bright relative overflow-hidden pb-14 pt-32 sm:pb-16 sm:pt-40">
      <span aria-hidden="true" className="work-grid pointer-events-none absolute inset-0" />
      <Container wide className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
          <div>
            <p className="section-code">SERVICES · บริการของเรา</p>
            <h1 className="thai-display mt-4 max-w-4xl text-[clamp(2.1rem,4.4vw,3.8rem)] font-bold leading-[1.14] text-ink">
              เราเปลี่ยนงานที่ซับซ้อน
              <br />
              <span className="text-brand-700">ให้กลายเป็นระบบที่ใช้งานจริง</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lead text-steel-600">
              ตั้งแต่ระบบหลังบ้าน เว็บไซต์ ไปจนถึงเครื่องมือเฉพาะสำหรับทีมของคุณ
              แต่ละบริการเริ่มจากปัญหาที่ธุรกิจเจอจริง ไม่ได้เริ่มจากเทคโนโลยี
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#service-map"
                className="group inline-flex min-h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                ดูบริการทั้งหมด
                <ArrowIcon className="transition-transform duration-base group-hover:translate-y-0.5 group-hover:rotate-90" />
              </a>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-steel-300 px-5 text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                เล่าโจทย์ให้เราฟัง
                <ArrowIcon />
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200">
            <div className="bg-white p-5">
              <dt className="text-xs text-steel-500">บริการหลัก</dt>
              <dd className="mt-1 font-mono text-4xl font-semibold text-ink">{primaryServices.length}</dd>
              <dd className="mt-1 text-[0.7rem] leading-snug text-steel-600">กลุ่มบริการที่ส่งมอบเป็นงานเดี่ยวได้</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-xs text-steel-500">มีผลงานจริง</dt>
              <dd className="mt-1 font-mono text-4xl font-semibold text-ink">{withWork}</dd>
              <dd className="mt-1 text-[0.7rem] leading-snug text-steel-600">
                กลุ่มที่มี Case Study เปิดเผยรายละเอียดได้
              </dd>
            </div>
            <div className="col-span-2 bg-brand-50 p-4 text-xs leading-relaxed text-brand-800">
              ทุกบริการอธิบายจากปัญหา สิ่งที่เราสร้าง และกลุ่มที่เหมาะ พร้อมลิงก์ไปยังผลงานจริงเมื่อมี
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------- 06 capabilities -- */

/**
 * Supporting work, deliberately quieter than the eight core sections: these
 * are things that ship inside a project, not things a visitor buys on its own.
 * This is also where /services hands off to /solutions.
 */
function SupportingCapabilities() {
  return (
    <section aria-labelledby="capabilities" className="sect sect--paper relative py-section">
      <Container wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:gap-16">
          <div>
            <p className="section-code">06 / CAPABILITIES</p>
            <h2 id="capabilities" className="thai-display mt-3 text-statement font-bold text-ink">
              ความสามารถที่มัก<span className="text-brand-700">ไปพร้อมกับงานหลัก</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel-600">
              งานกลุ่มนี้ส่วนใหญ่เป็นส่วนหนึ่งของโปรเจกต์ใหญ่ ไม่ได้ขายแยกเป็นงานเดี่ยว
              แต่มักเป็นสิ่งที่ทำให้ระบบหลักใช้งานได้จริงในระยะยาว
            </p>

            <ul className="mt-8 grid gap-px overflow-hidden rounded-panel border border-steel-200 bg-steel-200 sm:grid-cols-2">
              {supportingServices.map((service) => (
                <li key={service.id} className="bg-white p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card border border-steel-200 text-steel-600">
                      <Icon name={service.icon} className="h-3.5 w-3.5" />
                    </span>
                    <p className="thai-display text-sm font-bold text-ink">{service.title}</p>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{service.summary}</p>
                  {isContactServiceId(service.id) ? (
                    <Link
                      to={contactHref(service.id, `service:${service.id}`)}
                      className="group mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-ink transition-colors hover:text-brand-700"
                    >
                      คุยเกี่ยวกับงานนี้
                      <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-panel border border-brand-200 bg-brand-50/60 p-5 sm:p-6 lg:self-start">
            <p className="font-mono text-[0.6rem] tracking-[0.16em] text-brand-700">SYSTEM UNIVERSE</p>
            <h3 className="thai-display mt-3 text-xl font-bold text-ink">
              อยากเห็นว่าระบบเหล่านี้เชื่อมกันอย่างไร?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-steel-700">
              หน้านี้บอกว่าเราสร้างอะไรได้บ้าง ส่วนหน้า “ระบบของเรา” แสดงภาพรวมว่าระบบแต่ละตัวส่งข้อมูลต่อกันได้อย่างไร
            </p>
            <Link
              to="/solutions"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              ดูระบบของเรา
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
            <p className="mt-5 border-t border-brand-200 pt-4 text-xs leading-relaxed text-steel-600">
              หรือดูผลงานจริง {caseStudies.length} โครงการที่{' '}
              <Link to="/work" className="font-semibold text-ink underline underline-offset-2 hover:text-brand-700">
                หน้าผลงาน
              </Link>
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}

/* ---------------------------------------------------------------- 07 CTA -- */

/**
 * The final CTA is aimed at the visitor this page is really for: someone with
 * a problem who does not yet know which of the eight services it maps to.
 */
function ServicesCta() {
  const actions = [
    { label: `LINE ${company.lineOA}`, href: company.lineUrl, external: true, primary: true },
    { label: 'ส่งรายละเอียดโครงการ', to: '/contact', primary: false },
    { label: `โทร ${company.phoneDisplay}`, href: `tel:${company.phone}`, primary: false },
    { label: company.email, href: `mailto:${company.email}`, primary: false }
  ];

  return (
    <section aria-labelledby="services-cta" className="sect sect--deep relative overflow-hidden py-section text-white">
      <Container wide>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="section-code text-brand-300">07 / START</p>
            <h2
              id="services-cta"
              className="thai-display mt-3 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-tight"
            >
              มีโจทย์อยู่แล้ว
              <br />
              <span className="text-brand-300">แต่ยังไม่รู้ว่าต้องทำระบบแบบไหน?</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-brand-100/70">
              เล่าให้ฟังว่าตอนนี้ทีมทำงานกันอย่างไร แล้วเราช่วยดูว่าควรเริ่มจากระบบไหนก่อน
              ถ้างานนี้ไม่ใช่สิ่งที่เราถนัด เราจะบอกคุณตั้งแต่ต้น
            </p>
            <p className="mt-4 text-xs leading-relaxed text-brand-100/55">
              {company.businessHours.days} {company.businessHours.time} · {company.businessHours.note}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
            {actions.map((action) =>
              action.to ? (
                <Link
                  key={action.label}
                  to={action.to}
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:border-brand-300 hover:bg-white/5"
                >
                  {action.label} <ArrowIcon />
                </Link>
              ) : (
                <a
                  key={action.label}
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-sm font-semibold transition-colors',
                    action.primary
                      ? 'bg-brand-500 text-white hover:bg-brand-400'
                      : 'border border-white/25 text-white hover:border-brand-300 hover:bg-white/5'
                  )}
                >
                  {action.label}
                  {action.external ? <span className="sr-only">(เปิดแท็บใหม่)</span> : null}
                </a>
              )
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
