import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { contactRequestSchema } from '../../backend/src/schemas/contact.ts';
import { contactServiceIds as backendServiceIds } from '../../backend/src/contact/contactConfig.ts';
import {
  contactHref,
  contactServiceFromRoute,
  contactServiceIds,
  isValidSourceContext,
  payloadSourceContext,
  resolveContactPrefill,
  solutionToContactService,
  systemToContactService,
  toContactServiceId
} from '../src/data/contactRouting.ts';
import { buildContactPayload, contactIntents, getContactIntent, intentOrder } from '../src/data/contactFlow.ts';
import { primaryServices } from '../src/data/services.ts';
import { caseStudies } from '../src/data/caseStudies.ts';
import { businessSystems } from '../src/data/systemUniverse.ts';
import { company, cta } from '../src/data/company.ts';
import { switchLocalePath } from '../src/i18n/locales.ts';
import * as ui from '../src/i18n/ui.ts';
import * as contactText from '../src/i18n/contact.ts';
import { businessHours } from '../src/i18n/company.ts';

/**
 * EP42 — contact conversion.
 *
 *   one action    one primary label, one destination, on every page
 *   handoff       services, systems and case studies prefill the form with
 *                 values the contact API will actually accept
 *   contract      the payload still parses against the backend's own schema
 *   honesty       real channels, no promised response time, no fake urgency
 */

const LOCALES = ['th', 'en', 'zh'];
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
/* Source files under a directory, recursively (components may live in sub-folders). */
const sourceFiles = (dir) =>
  readdirSync(new URL(dir, import.meta.url), { recursive: true })
    .map(String)
    .filter((file) => /\.(tsx?|jsx?)$/.test(file))
    .map((file) => file.split('\\').join('/'));
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function* strings(value) {
  if (typeof value === 'string') yield value;
  else if (Array.isArray(value)) for (const item of value) yield* strings(item);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) yield* strings(item);
}

const baseValues = {
  serviceId: '', currentSituation: '', desiredOutcome: '', projectDetails: {}, budgetRange: 'not-defined',
  timeline: 'not-defined', companyName: '', industry: '', existingWebsite: '', contactName: '', email: '',
  phone: '', lineId: '', notes: '', website: ''
};

/* ------------------------------------------------------------ primary CTA -- */

test('one canonical primary action, leading to /contact', () => {
  assert.equal(cta.primary.to, '/contact');
  assert.deepEqual(cta.primary.label, { th: 'คุยเรื่องโปรเจกต์', en: 'Discuss a project', zh: '咨询项目' });
  assert.equal(cta.talk, undefined, 'the phone button labelled "Talk to us" is gone');
  assert.equal(cta.consult, undefined);
  /* Every closing block and the header use the shared primary action. */
  const surfaces = {
    Header: '../src/components/business/Header.tsx',
    BigCTA: '../src/components/business/BigCTA.tsx',
    Home: '../src/pages/business/Home.tsx',
    Services: '../src/pages/business/Services.tsx',
    Work: '../src/pages/business/Work.tsx'
  };
  Object.entries(surfaces).forEach(([name, path]) => {
    const source = read(path);
    assert.match(source, /data-cta="primary"/, `${name} has no primary action`);
    assert.match(source, /t\(cta\.primary\.label\)/, `${name} does not use the canonical label`);
  });
});

test('closing CTAs are not duplicated or split across equal buttons', () => {
  const footer = stripComments(read('../src/components/business/Footer.tsx'));
  assert.ok(!/ButtonLink/.test(footer), 'the footer repeats a closing CTA below BigCTA');
  const bigCta = stripComments(read('../src/components/business/BigCTA.tsx'));
  assert.equal((bigCta.match(/<ButtonLink/g) ?? []).length, 1, 'BigCTA has exactly one button');
  assert.match(bigCta, /<DirectChannels/);
  ['../src/pages/business/Services.tsx', '../src/pages/business/Work.tsx'].forEach((path) => {
    const source = stripComments(read(path));
    assert.ok(!/href=\{company\.lineUrl\}/.test(source), `${path} renders LINE as a competing button`);
    assert.match(source, /<DirectChannels/);
  });
  /* The desktop and mobile menus do not repeat /contact beside the button. */
  assert.match(read('../src/components/business/Header.tsx'), /navigation\.filter\(\(item\) => item\.to !== cta\.primary\.to\)/);
});

test('client login stays secondary to the project CTA', () => {
  const header = stripComments(read('../src/components/business/Header.tsx'));
  assert.ok(!/<ButtonLink to=["{][^>]*login/.test(header), 'client login is rendered as a button');
});

/* ---------------------------------------------------------------- contract -- */

test('contact service ids mirror the API exactly', () => {
  assert.deepEqual([...contactServiceIds], [...backendServiceIds]);
  contactServiceIds.forEach((id) => assert.ok(getContactIntent(id), `${id} has no form intent`));
  assert.deepEqual(contactIntents.map((intent) => intent.id).sort(), [...contactServiceIds].sort());
  /* The chooser shows every intent exactly once, "not sure" included. */
  const shown = [...intentOrder.core, ...intentOrder.other, intentOrder.notSure];
  assert.deepEqual([...shown].sort(), [...contactServiceIds].sort());
  assert.equal(intentOrder.notSure, 'consulting');
});

test('only sources the API accepts are ever sent', () => {
  const schemaSource = read('../../backend/src/schemas/contact.ts');
  const patterns = [...schemaSource.matchAll(/\/\^(solutions|case):\(([^)]+)\)\$\//g)].map(([, kind, ids]) => [kind, new Set(ids.split('|'))]);
  const backendAccepts = (source) => {
    if (source === 'home') return true;
    const [kind, id] = source.split(':');
    if (kind === 'service') return backendServiceIds.includes(id);
    return patterns.some(([k, ids]) => k === kind && ids.has(id));
  };
  const candidates = [
    'home',
    ...businessSystems.map((system) => `solutions:${system.id}`),
    ...caseStudies.map((study) => `case:${study.slug}`),
    ...primaryServices.map((service) => `service:${service.id}`),
    ...contactServiceIds.map((id) => `service:${id}`)
  ];
  candidates.forEach((source) => {
    assert.ok(isValidSourceContext(source), `${source} should prefill the form`);
    assert.equal(Boolean(payloadSourceContext(source)), backendAccepts(source), `${source}: payload and API disagree`);
  });
});

test('guided and quick payloads still parse against the backend schema', () => {
  const guided = buildContactPayload('guided', {
    ...baseValues, serviceId: 'payroll', currentSituation: 'Excel every month', desiredOutcome: 'Checked payroll',
    projectDetails: { 'employee-range': '20-100', approval: '' }, contactName: 'Somchai', email: 'a@b.co', companyName: ''
  }, 'case:payroll-monthly-control');
  assert.equal(guided.contactType, 'guided');
  assert.deepEqual(guided.projectDetails, { 'employee-range': '20-100' }, 'empty answers are dropped');
  assert.ok(contactRequestSchema.safeParse(guided).success, JSON.stringify(contactRequestSchema.safeParse(guided).error?.issues));

  /* Quick: name + one channel + a message. Nothing else is required. */
  const quick = buildContactPayload('quick', { ...baseValues, contactName: 'Mali', lineId: 'mali.line', notes: 'Need a website for our shop' });
  assert.deepEqual(Object.keys(quick).sort(), ['contactName', 'contactType', 'email', 'lineId', 'notes', 'phone', 'serviceId', 'sourceContext', 'website'].sort());
  assert.ok(contactRequestSchema.safeParse(quick).success);

  /* A case the API does not list still prefills the form, but is not sent. */
  const nas = buildContactPayload('quick', { ...baseValues, serviceId: 'document-management', contactName: 'Mali', phone: '081 234 5678', notes: 'Shared drive is a mess' }, 'case:nas-file-storage');
  assert.equal(nas.sourceContext, undefined);
  assert.ok(contactRequestSchema.safeParse(nas).success);

  /* The legacy shape is untouched. */
  assert.ok(contactRequestSchema.safeParse({ name: 'Old Form', email: 'a@b.co', projectType: 'website', budget: 'not-sure', timeline: 'planning', message: 'Legacy clients still work' }).success);
});

/* ----------------------------------------------------------------- handoff -- */

test('every service prefills a topic the form and the API accept', () => {
  primaryServices.forEach((service) => {
    const href = contactHref(service.id, `service:${service.id}`);
    const prefill = resolveContactPrefill(href.split('?')[1]);
    assert.ok(prefill.serviceId, `${service.id} does not prefill`);
    assert.ok(backendServiceIds.includes(prefill.serviceId));
    assert.equal(prefill.sourceContext, `service:${service.id}`);
  });
  assert.equal(toContactServiceId('file-management'), 'document-management');
  assert.equal(contactHref('payroll', 'service:payroll'), '/contact?service=payroll&source=service%3Apayroll');
});

test('case studies and solutions carry their context', () => {
  caseStudies.forEach((study) => {
    const service = contactServiceFromRoute(study.serviceRoute);
    assert.ok(service, `${study.slug} has no contact topic`);
    const prefill = resolveContactPrefill(contactHref(service, `case:${study.slug}`).split('?')[1]);
    assert.deepEqual(prefill, { serviceId: service, sourceContext: `case:${study.slug}` });
  });
  businessSystems.forEach((system) => assert.ok(backendServiceIds.includes(systemToContactService[system.id]), `${system.id} maps to an unknown topic`));
  Object.values(solutionToContactService).forEach((id) => assert.ok(backendServiceIds.includes(id)));
  /* WorkDetail passes the same prefill to its closing CTA. */
  assert.match(read('../src/pages/business/WorkDetail.tsx'), /<BigCTA[^>]*contactTo=\{contactService \? contactHref\(contactService, `case:\$\{study\.slug\}`\)/);
});

test('unknown or unsafe prefill values are dropped', () => {
  assert.deepEqual(resolveContactPrefill('?service=unknown&source=https%3A%2F%2Fevil.example'), { serviceId: undefined, sourceContext: undefined });
  assert.deepEqual(resolveContactPrefill('?service=%3Cscript%3E&source=case%3Aprivate-client'), { serviceId: undefined, sourceContext: undefined });
  assert.equal(resolveContactPrefill('?source=case:payroll-monthly-control:extra').sourceContext, undefined);
  assert.equal(resolveContactPrefill('?service=internal-tools').serviceId, undefined, 'supporting services without a topic do not prefill');
  assert.equal(contactHref('nope', 'service:nope'), '/contact');
});

test('switching language keeps the contact query and hash', () => {
  const location = { pathname: '/contact', search: '?service=payroll&source=case%3Apayroll-monthly-control', hash: '' };
  assert.equal(switchLocalePath(location, 'en'), '/en/contact?service=payroll&source=case%3Apayroll-monthly-control');
  assert.equal(switchLocalePath({ ...location, pathname: '/zh/contact' }, 'th'), '/contact?service=payroll&source=case%3Apayroll-monthly-control');
  assert.equal(switchLocalePath({ pathname: '/en/services', search: '', hash: '#payroll' }, 'zh'), '/zh/services#payroll');
});

/* ----------------------------------------------------------------- honesty -- */

test('direct channels come from the canonical company record', () => {
  assert.equal(company.phone, '0638693614');
  assert.equal(company.email, 'pdablissoffice@gmail.com');
  assert.equal(company.lineOA, '@593oiwec');
  assert.equal(company.lineUrl, 'https://line.me/R/ti/p/@593oiwec');
  const channels = read('../src/components/business/DirectChannels.tsx');
  assert.match(channels, /href: company\.lineUrl/);
  assert.match(channels, /href: `tel:\$\{company\.phone\}`/);
  assert.match(channels, /href: `mailto:\$\{company\.email\}`/);
  assert.match(channels, /target: '_blank', rel: 'noopener noreferrer'/);
  /* No component types a contact value by hand. */
  const dirs = ['../src/components/business/', '../src/pages/business/'];
  dirs.forEach((dir) =>
    sourceFiles(dir).forEach((file) => {
      const source = read(dir + file);
      ['0638693614', '063-869-3614', 'pdablissoffice@gmail.com', '593oiwec'].forEach((value) =>
        assert.ok(!source.includes(value), `${file} hardcodes ${value}`)
      );
    })
  );
  LOCALES.forEach((locale) => assert.match(businessHours.time[locale], /08:30\s*–\s*17:30/));
});

test('no promised response time, booking or sales urgency', () => {
  const copy = [...strings(ui), ...strings(contactText), ...strings(businessHours), company.businessHours.note].join('\n');
  [
    /within\s+(\d+|one|an?)\s*(minutes?|hours?|days?|business days?)/i, /24\s*(hours?|\/\s*7)/i, /same[- ]day/i,
    /ภายใน\s*\d+\s*(นาที|ชั่วโมง|ชม\.|วัน)/, /\d+\s*(小时|分钟|个工作日|天)内/,
    /book a call|booking|นัดหมาย|预约/i,
    /limited|only \d+|today only|slots?\b|hurry|เหลือเพียง|จำนวนจำกัด|วันนี้เท่านั้น|限时|名额/i
  ].forEach((pattern) => assert.ok(!pattern.test(copy), `contact copy matches ${pattern}`));
});

test('budget and timeline stay optional and non-committal', () => {
  LOCALES.forEach((locale) => {
    assert.match(contactText.form.budget[locale], /ถ้ามี|if you have one|如有/);
    assert.match(contactText.form.timeline[locale], /ถ้ามี|if known|如有/);
    assert.match(contactText.form.budgetNote[locale], /ไม่ใช่ราคาเสนอ|not a quotation|不构成报价/);
  });
  assert.equal(baseValues.budgetRange, 'not-defined');
});

/* ------------------------------------------------------------ completeness -- */

test('EP42 copy exists in all three languages', () => {
  const keys = [
    [ui.cta, 'discussProject'], [ui.dock, 'formEyebrow'], [ui.dock, 'channels'], [ui.dock, 'title'],
    [contactText.form, 'stepOf'], [contactText.form, 'privacyLink'], [contactText.form, 'otherTopics'],
    [contactText.form, 'successNext'], [contactText.form, 'failedChannels'], [contactText.form, 'retry'],
    [contactText.validation, 'phone'], [contactText.validation, 'email'], [contactText.contactPage, 'nextStepsLabel']
  ];
  keys.forEach(([group, key]) =>
    LOCALES.forEach((locale) => assert.ok(group[key]?.[locale]?.trim(), `${key} is missing ${locale}`))
  );
  LOCALES.forEach((locale) => {
    assert.match(contactText.form.stepOf[locale], /\{current\}.*\{total\}.*\{title\}/);
    /* EN and ZH are not Thai. */
    if (locale !== 'th') keys.forEach(([group, key]) => assert.ok(!/[฀-๿]/.test(group[key][locale]), `${key}.${locale} contains Thai`));
  });
  assert.equal(contactText.intentText.en.consulting.label, 'Not sure yet');
  assert.equal(contactText.intentText.zh.consulting.label, '还不确定，希望我们协助判断');
  assert.equal(getContactIntent('consulting').label, 'ยังไม่แน่ใจ / อยากให้ช่วยแนะนำ');
});

/* --------------------------------------------------------------- link audit -- */

test('every internal CTA link resolves and keeps its locale', () => {
  const routes = new Set(['/', '/services', '/solutions', '/work', '/about', '/insights', '/contact', '/privacy', '/terms', '/cookies', '/login']);
  const slugs = new Set(caseStudies.map((study) => study.slug));
  const serviceIds = new Set(primaryServices.map((service) => service.id));
  const aboutIds = new Set(['process', 'technology', 'quality', 'support', 'company']);
  const files = ['../src/components/business/', '../src/pages/business/'].flatMap((dir) =>
    sourceFiles(dir).map((file) => dir + file)
  );
  files.forEach((path) => {
    const source = stripComments(read(path));
    /* Corporate links go through LocaleLink so /en and /zh stay in their language. */
    if (!/LanguageSwitcher|Login\.tsx/.test(path)) {
      assert.ok(!/import \{[^}]*\bLink\b[^}]*\} from ['"]react-router-dom['"]/.test(source), `${path} uses a locale-blind Link`);
    }
    for (const [, to] of source.matchAll(/\bto=["']([^"']+)["']/g)) {
      if (/^(https?:|mailto:|tel:|#)/.test(to)) continue;
      const [pathname, hash] = to.split('#');
      if (pathname.startsWith('/work/')) {
        assert.ok(slugs.has(pathname.slice(6)), `${path}: ${to} is not a case study`);
        continue;
      }
      assert.ok(routes.has(pathname.split('?')[0]), `${path}: ${to} is not a public route`);
      if (hash && pathname === '/about') assert.ok(aboutIds.has(hash), `${path}: ${to} is not an About section`);
      if (hash && pathname === '/services') assert.ok(serviceIds.has(hash) || ['scope', 'service-map'].includes(hash), `${path}: ${to} is not a Services section`);
    }
  });
});
