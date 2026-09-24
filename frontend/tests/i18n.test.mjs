import assert from 'node:assert/strict';
import test from 'node:test';
import * as ui from '../src/i18n/ui.ts';
import * as companyText from '../src/i18n/company.ts';
import * as home from '../src/i18n/home.ts';
import * as work from '../src/i18n/work.ts';
import * as contact from '../src/i18n/contact.ts';
import * as visuals from '../src/i18n/visuals.ts';
import * as insightsText from '../src/i18n/insights.ts';
import * as solutionsText from '../src/i18n/solutions.ts';
import * as universeText from '../src/i18n/systemUniverse.ts';
import * as solutionsPageText from '../src/i18n/solutionsPage.ts';
import * as servicesText from '../src/i18n/services.ts';
import * as casesText from '../src/i18n/caseStudies.ts';
import * as about from '../src/i18n/about.ts';
import * as legal from '../src/i18n/legal.ts';
import { aftercare, philosophy, standards } from '../src/data/about.ts';
import { targetMarket } from '../src/data/company.ts';
import { pageMeta } from '../src/lib/seo.ts';
import en from '../src/i18n/content/en.ts';
import zh from '../src/i18n/content/zh.ts';
import { caseStudies, projectAccessNote, projectCaseLink } from '../src/data/caseStudies.ts';
import { primaryServices, serviceDistinctions, services, supportingServices } from '../src/data/services.ts';
import { capabilityMarkers, company, metrics, process, strengths, techStack } from '../src/data/company.ts';
import { contactBudgetOptions, contactIntents, contactSteps, contactTimelineOptions } from '../src/data/contactFlow.ts';
import { solutions } from '../src/data/solutions.ts';
import { businessSystems } from '../src/data/systemUniverse.ts';
import { insights } from '../src/data/insights.ts';
import { heroVisuals, portfolioVisuals, serviceVisuals, showreelVisuals } from '../src/data/visuals.ts';

/**
 * TH, EN and 中文 must be three complete presentations of the same company.
 *
 *   completeness   every EN/ZH counterpart exists, is non-empty, and every
 *                  list has exactly as many items as its Thai source
 *   no mixing      no Thai script leaks into an English or Chinese string
 *   claims         EN/ZH never claim more than the Thai (the EP38 caveats)
 *
 * No silent fallback: a missing translation fails here, not at runtime.
 */

const THAI = /[฀-๿]/;
const LOCALES = ['th', 'en', 'zh'];
const OTHER = ['en', 'zh'];
/** The lazily loaded EN / ZH content packs. */
const PACKS = { en, zh };

/**
 * Thai text allowed inside EN/ZH values: proper nouns and legal Thai that
 * must stay exactly as registered.
 */
const ALLOWED_THAI = new Set([company.legalNameTh, company.addressOneLine, ...company.address.lines, company.addressNote, company.tagline, company.description, company.businessHours.days, company.businessHours.time, company.businessHours.note]);

const isLocalized = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && LOCALES.every((key) => key in value) && Object.keys(value).length === 3;

/** Walks any structure and yields every { th, en, zh } triple with its path. */
function* triples(value, path = '') {
  if (isLocalized(value)) {
    yield [path, value];
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) yield* triples(item, `${path}[${index}]`);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) yield* triples(item, path ? `${path}.${key}` : key);
  }
}

function assertText(value, where) {
  if (Array.isArray(value)) {
    assert.ok(value.length > 0, `${where} is an empty list`);
    value.forEach((item, index) => assertText(item, `${where}[${index}]`));
    return;
  }
  assert.equal(typeof value, 'string', `${where} is not text`);
  assert.ok(value.trim().length > 0, `${where} is empty`);
}

function assertNotThai(value, where) {
  const values = Array.isArray(value) ? value : [value];
  values.forEach((text) => {
    if (ALLOWED_THAI.has(text)) return;
    assert.ok(!THAI.test(text), `${where} contains Thai script: "${text}"`);
  });
}

/** Every string in a structure, for overlays that are not triples. */
function* strings(value, path = '') {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, item] of value.entries()) yield* strings(item, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, item] of Object.entries(value)) yield* strings(item, path ? `${path}.${k}` : k);
}

const MODULES = { ui, companyText, home, work, contact, visuals, insightsText, solutionsText, universeText, solutionsPageText, servicesText, casesText, about, legal, pageMeta };

test('every localised triple is complete, and EN/ZH carry no Thai', () => {
  let count = 0;
  for (const [name, module] of Object.entries(MODULES)) {
    for (const [path, triple] of triples(module)) {
      count += 1;
      LOCALES.forEach((locale) => assertText(triple[locale], `${name}.${path}.${locale}`));
      OTHER.forEach((locale) => assertNotThai(triple[locale], `${name}.${path}.${locale}`));
      if (Array.isArray(triple.th)) {
        OTHER.forEach((locale) =>
          assert.equal(triple[locale].length, triple.th.length, `${name}.${path}.${locale} has a different number of lines`)
        );
      }
    }
  }
  assert.ok(count > 300, `expected the full vocabulary, found only ${count} triples`);
});

test('global chrome: nav, CTAs, theme, header, footer, cookie banner, dock', () => {
  assert.deepEqual(Object.keys(ui.nav), ['home', 'services', 'solutions', 'work', 'about', 'insights', 'contact']);
  assert.deepEqual(ui.themeLabel, {
    light: { th: 'สว่าง', en: 'Light', zh: '浅色' },
    dark: { th: 'มืด', en: 'Dark', zh: '深色' },
    system: { th: 'ตามระบบ', en: 'System', zh: '跟随系统' }
  });
  ['startProject', 'viewWork', 'viewAllServices', 'contactUs', 'seeRelatedWork', 'viewCaseStudy', 'visitWebsite', 'back', 'nextCase', 'learnMore'].forEach((key) =>
    assert.ok(ui.cta[key], `CTA vocabulary is missing ${key}`)
  );
  ['title', 'body', 'acceptAll', 'necessaryOnly', 'settings', 'policy'].forEach((key) => assert.ok(ui.cookie[key], `cookie banner is missing ${key}`));
  assert.equal(ui.footerServiceLinks.length, 8);
  assert.deepEqual(
    ui.footerServiceLinks.map((link) => link.id),
    primaryServices.map((service) => service.id),
    'footer service links must follow the canonical service order'
  );
});

test('all 8 core and 8 supporting services have complete EN and ZH text', () => {
  assert.equal(primaryServices.length, 8);
  OTHER.forEach((locale) => {
    const overlay = PACKS[locale].services;
    services.forEach((service) => {
      const text = overlay[service.id];
      assert.ok(text, `${locale}: service ${service.id} is untranslated`);
      ['title', 'summary', 'detail'].forEach((field) => assertText(text[field], `${locale}.${service.id}.${field}`));
      assert.equal(text.deliverables.length, service.deliverables.length, `${locale}.${service.id}.deliverables`);
      if (service.primary) {
        assertText(text.problem, `${locale}.${service.id}.problem`);
        assert.equal(text.problems.length, service.problems.length, `${locale}.${service.id}.problems`);
        assert.equal(text.targetUsers.length, service.targetUsers.length, `${locale}.${service.id}.targetUsers`);
      }
      for (const [path, value] of strings(text)) assertNotThai(value, `${locale}.${service.id}.${path}`);
    });
    assert.deepEqual(Object.keys(overlay).sort(), services.map((service) => service.id).sort(), `${locale} has stray service ids`);
  });
  assert.equal(supportingServices.length, 8);
});

test('the differentiation block keeps every family distinct in EN and ZH', () => {
  OTHER.forEach((locale) => {
    serviceDistinctions.forEach((entry) => {
      const text = PACKS[locale].distinctions[entry.id];
      assert.ok(text, `${locale}: distinction ${entry.id} is untranslated`);
      ['label', 'is', 'forWhom'].forEach((field) => assertText(text[field], `${locale}.${entry.id}.${field}`));
    });
    const labels = serviceDistinctions.map((entry) => PACKS[locale].distinctions[entry.id].label);
    assert.equal(new Set(labels).size, labels.length, `${locale}: two families share a label`);
  });
});

test('all 7 case studies are translated field by field, item by item', () => {
  assert.equal(caseStudies.length, 7);
  OTHER.forEach((locale) => {
    caseStudies.forEach((study) => {
      const text = PACKS[locale].caseStudies[study.slug];
      assert.ok(text, `${locale}: case ${study.slug} is untranslated`);
      ['title', 'subtitle', 'projectType', 'delivered', 'problem', 'context', 'solution'].forEach((field) =>
        assertText(text[field], `${locale}.${study.slug}.${field}`)
      );
      ['tags', 'before', 'after', 'outcomes', 'technicalNotes'].forEach((field) =>
        assert.equal(text[field].length, study[field].length, `${locale}.${study.slug}.${field} item count`)
      );
      assert.equal(text.features.length, study.features.length, `${locale}.${study.slug}.features groups`);
      study.features.forEach((group, index) =>
        assert.equal(text.features[index].length, group.items.length, `${locale}.${study.slug}.features[${index}]`)
      );
      assert.equal(text.flow.length, study.flow.length, `${locale}.${study.slug}.flow steps`);
      text.flow.forEach((step, index) => ['title', 'actor', 'description', 'output'].forEach((field) => assertText(step[field], `${locale}.${study.slug}.flow[${index}].${field}`)));
      if (study.screenshot) assertText(text.screenshotAlt, `${locale}.${study.slug}.screenshotAlt`);
      for (const [path, value] of strings(text)) assertNotThai(value, `${locale}.${study.slug}.${path}`);
    });
  });
});

test('localising a case study never changes identity, visibility or links', () => {
  caseStudies.forEach((study) => {
    OTHER.forEach((locale) => {
      const localized = casesText.localizeCaseStudy(study, PACKS[locale]);
      ['id', 'slug', 'visibility', 'featured', 'liveUrl', 'serviceRoute', 'category', 'status', 'visual'].forEach((field) =>
        assert.deepEqual(localized[field], study[field], `${locale}.${study.slug}.${field} changed`)
      );
      assert.deepEqual(localized.filters, study.filters);
      assert.deepEqual(localized.relatedSystems, study.relatedSystems);
      assert.deepEqual(localized.flow.map((step) => step.id), study.flow.map((step) => step.id));
      assert.equal(localized.screenshot?.src, study.screenshot?.src);
      assert.equal(projectCaseLink(localized, locale).href, `/work/${study.slug}`);
      assertNotThai(projectAccessNote(localized, locale), `${locale}.${study.slug} access note`);
    });
  });
});

test('contact: every intent, question and option is translated; values never change', () => {
  OTHER.forEach((locale) => {
    contactIntents.forEach((intent) => {
      const localized = contact.localizeIntent(intent, locale);
      assert.equal(localized.id, intent.id);
      for (const [path, value] of strings({ label: localized.label, shortLabel: localized.shortLabel, description: localized.description })) {
        assertText(value, `${locale}.${intent.id}.${path}`);
        assertNotThai(value, `${locale}.${intent.id}.${path}`);
      }
      intent.questions.forEach((question, index) => {
        const q = localized.questions[index];
        assert.equal(q.id, question.id, 'question ids must not change');
        assert.equal(q.kind, question.kind);
        assertNotThai(q.label, `${locale}.${intent.id}.${question.id}.label`);
        if (question.helper) assertNotThai(q.helper, `${locale}.${intent.id}.${question.id}.helper`);
        if (question.placeholder) assertNotThai(q.placeholder, `${locale}.${intent.id}.${question.id}.placeholder`);
        assert.deepEqual(q.options?.map((option) => option.value), question.options?.map((option) => option.value), 'option values must not change');
        q.options?.forEach((option) => assertNotThai(option.label, `${locale}.${intent.id}.${question.id}.${option.value}`));
      });
    });
    [
      [contactBudgetOptions, contact.budgetLabel],
      [contactTimelineOptions, contact.timelineLabel]
    ].forEach(([options, labels]) => {
      const localized = contact.localizeOptions(options, labels, locale);
      assert.deepEqual(localized.map((option) => option.value), options.map((option) => option.value));
      localized.forEach((option) => assertNotThai(option.label, `${locale} option ${option.value}`));
    });
  });
  contactSteps.forEach((step) => assert.ok(contact.stepLabel[step.id], `step ${step.id} has no label`));
});

test('company-level lists mirror their Thai sources item for item', () => {
  assert.equal(home.processSteps.length, process.length);
  assert.equal(home.strengthItems.length, strengths.length);
  assert.equal(home.capabilityMarkerText.length, capabilityMarkers.length);
  assert.equal(work.metricText.length, metrics.length);
  techStack.forEach((group) => {
    const text = home.techText[group.group];
    assert.ok(text, `tech group ${group.group} is untranslated`);
    group.items.forEach((item) => assert.ok(text.notes[item.name], `tech note ${item.name} is untranslated`));
  });
  /* Thai values in the overlays are the Thai source, not a second copy. */
  home.processSteps.forEach((step, index) => assert.equal(step.title.th, process[index].title));
  home.strengthItems.forEach((item, index) => assert.equal(item.title.th, strengths[index].title));
});

test('solutions, system universe, insights and visual captions are complete', () => {
  OTHER.forEach((locale) => {
    solutions.forEach((solution) => {
      const text = PACKS[locale].solutions[solution.id];
      assert.ok(text, `${locale}: solution ${solution.id} is untranslated`);
      assert.equal(text.benefits.length, solution.benefits.length);
      assert.equal(text.highlights.length, solution.highlights.length);
      for (const [path, value] of strings(text)) assertNotThai(value, `${locale}.${solution.id}.${path}`);
    });
    businessSystems.forEach((system) => {
      const text = PACKS[locale].systems[system.id];
      assert.ok(text, `${locale}: system ${system.id} is untranslated`);
      assert.equal(text.capabilities.length, system.capabilities.length);
      assert.equal(text.connections.length, system.connections.length, `${locale}.${system.id} connection labels`);
      for (const [path, value] of strings(text)) assertNotThai(value, `${locale}.${system.id}.${path}`);
    });
    insights.forEach((insight) => {
      const text = PACKS[locale].insights[insight.slug];
      assert.ok(text, `${locale}: insight ${insight.slug} is untranslated`);
      assertNotThai(text.title, insight.slug);
      assertNotThai(text.excerpt, insight.slug);
    });
  });
  [...heroVisuals, ...showreelVisuals, ...Object.values(serviceVisuals), ...Object.values(portfolioVisuals)]
    .filter((slot) => slot.titleTh)
    .forEach((slot) => assert.ok(visuals.slotTitle[slot.id], `visual ${slot.id} has no localised caption`));
});

test('page SEO exists for every public page in every locale', () => {
  const pages = ['home', 'services', 'solutions', 'work', 'insights', 'about', 'contact', 'privacy', 'cookiePolicy', 'terms', 'notFound'];
  pages.forEach((page) => {
    const meta = pageMeta[page];
    assert.ok(meta, `${page} has no metadata`);
    LOCALES.forEach((locale) => {
      assertText(meta.title[locale], `${page}.title.${locale}`);
      assertText(meta.description[locale], `${page}.description.${locale}`);
    });
    assert.notEqual(meta.title.en, meta.title.th);
    assert.notEqual(meta.title.zh, meta.title.en);
    assert.ok(meta.path.startsWith('/') && !/^\/(en|zh)(\/|$)/.test(meta.path), `${page} path must be locale-neutral`);
  });
  /* Contact metadata carries the canonical phone and email in every language. */
  LOCALES.forEach((locale) => {
    assert.ok(pageMeta.contact.description[locale].includes(company.phoneDisplay));
    assert.ok(pageMeta.contact.description[locale].includes(company.email));
  });
});

/**
 * EN/ZH may never claim more than the Thai. These are the EP38 corrections:
 * no automatic tax / social-security compliance for payroll, no app-store
 * publishing promise, no backup or security guarantee, no "one-stop".
 */
test('EN and ZH service copy keeps the EP38 caveats and adds no claims', () => {
  const banned = {
    en: [/social security/i, /withholding tax/i, /\bApp Store\b/, /\bPlay Store\b/, /guarantee/i, /end-to-end/i, /one-stop/i, /\bbest\b/i, /error-free/i, /revolutionary/i, /next-generation/i],
    zh: [/社保|社会保险/, /预扣税|代扣税/, /App Store/, /Play Store/, /保证|担保/, /一站式/, /最佳|最好/, /零差错|零错误/, /革命性/]
  };
  OTHER.forEach((locale) => {
    const haystack = services
      .map((service) => [...strings(PACKS[locale].services[service.id])].map(([, value]) => value).join(' '))
      .join(' ');
    banned[locale].forEach((pattern) => assert.ok(!pattern.test(haystack), `${locale} service copy matches ${pattern}`));
  });

  /* The caveats themselves must survive translation. */
  const en = PACKS.en.services;
  const zh = PACKS.zh.services;
  assert.match(en['file-management'].detail, /agreed with you for each project/);
  assert.match(zh['file-management'].detail, /按项目与您共同确定/);
  assert.match(en['mobile-applications'].detail, /scoped with you for each project/);
  assert.match(zh['mobile-applications'].detail, /按项目与您共同确定/);
  assert.match(en['web-applications'].deliverables.join(' '), /as agreed in scope/);
  assert.match(zh['web-applications'].deliverables.join(' '), /按约定范围/);
  assert.match(en.payroll.deliverables.join(' '), /agreed shift, overtime and deduction rules/);
  assert.match(zh.payroll.deliverables.join(' '), /按约定的班次、加班和扣款规则/);
  assert.match(en.cloud.detail, /within the scope agreed/);
});

test('case-study outcomes stay qualitative in every language', () => {
  const figure = /\d+\s*%|ROI|\bx\d|\d+\s*(times|倍)/i;
  OTHER.forEach((locale) => {
    caseStudies.forEach((study) => {
      PACKS[locale].caseStudies[study.slug].outcomes.forEach((outcome) =>
        assert.ok(!figure.test(outcome), `${locale}.${study.slug} outcome quotes a figure: ${outcome}`)
      );
    });
  });
});

test('business identifiers are identical in every locale', () => {
  assert.equal(company.phone, '0638693614');
  assert.equal(company.email, 'pdablissoffice@gmail.com');
  assert.equal(company.lineOA, '@593oiwec');
  assert.equal(company.legalName, 'PDA BLISS COMPANY LIMITED');
  assert.equal(company.legalNameTh, 'บริษัท พีดีเอ บลิส จำกัด');
  /* No Chinese legal name is invented: Chinese pages use the registered English one. */
  assert.equal(companyText.legalNameDisplay.zh, 'PDA BLISS COMPANY LIMITED');
  /* Hours are the same in every language: Mon–Sat 08:30–17:30. */
  OTHER.forEach((locale) => assert.match(companyText.businessHours.time[locale], /08:30\s*–\s*17:30/));
  assert.match(companyText.businessHours.days.en, /Monday – Saturday/);
  assert.match(companyText.businessHours.days.zh, /周一至周六/);
  /* The address keeps its postcode and house number in every rendering. */
  LOCALES.forEach((locale) => {
    const address = companyText.addressLines[locale].join(' ');
    assert.match(address, /14\/14/);
    assert.match(address, /10800/);
  });
});

test('about and legal pages mirror their Thai sources', () => {
  assert.equal(about.philosophyText.length, philosophy.length);
  assert.equal(about.standardText.length, standards.items.length);
  assert.equal(about.aftercareText.length, aftercare.items.length);
  assert.equal(about.marketGroupText.length, targetMarket.groups.length);
  /* Thai values are the Thai source itself, not a second copy that could drift. */
  about.philosophyText.forEach((item, index) => assert.equal(item.body.th, philosophy[index].body));
  about.standardText.forEach((item, index) => assert.equal(item.body.th, standards.items[index].body));
  about.marketGroupText.forEach((item, index) => assert.equal(item.label.th, targetMarket.groups[index].label));

  [legal.privacyPage, legal.cookiePage, legal.termsPage].forEach((page) => {
    assert.ok(page.sections.length >= 3, `${page.eyebrow} lost sections`);
    page.sections.forEach((section) => {
      /* Placeholders are the same in every language, so no detail goes missing. */
      const slots = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');
      OTHER.forEach((locale) => assert.equal(slots(section.body[locale]), slots(section.body.th), `${page.eyebrow}: ${section.title.en} placeholders differ`));
    });
  });
  /* The contact details a privacy question needs are present in every language. */
  const contactSection = legal.privacyPage.sections.at(-1);
  LOCALES.forEach((locale) => {
    assert.match(contactSection.body[locale], /\{email\}/);
    assert.match(contactSection.body[locale], /\{phone\}/);
  });
  assert.equal(solutionsPageText.businessFlows.length, 2);
});
