import assert from 'node:assert/strict';
import test from 'node:test';
import {
  homeServicePreview,
  primaryServices,
  serviceDistinctions,
  services,
  supportingServices
} from '../src/data/services.ts';
import { caseStudies } from '../src/data/caseStudies.ts';
import { isValidSourceContext, toContactServiceId } from '../src/data/contactRouting.ts';
import { serviceVisuals } from '../src/data/visuals.ts';

/**
 * The service catalogue is the page's whole argument, so these tests guard the
 * things a copy edit can silently break: the canonical set, the links out to
 * real work, and the promise that nothing claims a case study it does not have.
 */

/** The eight families the owner sells, in selling order. */
const CANONICAL_SERVICE_IDS = [
  'business-systems',
  'payroll',
  'hr-line-bot',
  'document-management',
  'file-management',
  'web-applications',
  'mobile-applications',
  'websites'
];

test('the canonical service set is present, complete and in order', () => {
  assert.deepEqual(primaryServices.map((service) => service.id), CANONICAL_SERVICE_IDS);
  assert.equal(primaryServices.length, 8);
  primaryServices.forEach((service) => assert.equal(service.primary, true));
});

test('no service id is duplicated across the catalogue', () => {
  const ids = services.map((service) => service.id);
  assert.equal(new Set(ids).size, ids.length);
  const overlap = supportingServices.filter((service) =>
    CANONICAL_SERVICE_IDS.includes(service.id)
  );
  assert.deepEqual(overlap, [], 'a supporting capability must not shadow a core service');
});

test('every core service answers all four visitor questions', () => {
  primaryServices.forEach((service) => {
    assert.ok(service.title.trim(), `${service.id} has no title`);
    assert.ok(service.summary.trim(), `${service.id} has no summary`);
    assert.ok(service.problem.trim(), `${service.id} has no problem statement`);
    assert.ok(service.problems.length >= 3, `${service.id} needs at least three symptoms`);
    assert.ok(service.deliverables.length >= 3, `${service.id} needs at least three deliverables`);
    assert.ok(service.targetUsers.length >= 2, `${service.id} needs at least two audiences`);
    assert.ok(Array.isArray(service.relatedProjects), `${service.id} relatedProjects must be an array`);
  });
});

test('related case-study references all resolve to real projects', () => {
  const slugs = new Set(caseStudies.map((study) => study.slug));
  primaryServices.forEach((service) => {
    service.relatedProjects.forEach((slug) => {
      assert.ok(slugs.has(slug), `${service.id} references unknown case study "${slug}"`);
    });
    /* No service may claim the same project twice. */
    assert.equal(new Set(service.relatedProjects).size, service.relatedProjects.length);
  });
});

test('every case study with a service route points at a real service', () => {
  const serviceIds = new Set(services.map((service) => service.id));
  caseStudies.forEach((study) => {
    const [path, hash] = study.serviceRoute.split('#');
    assert.equal(path, '/services', `${study.slug} has an unexpected service route`);
    assert.ok(hash && serviceIds.has(hash), `${study.slug} points at unknown service "${hash}"`);
  });
});

test('service CTAs resolve to valid contact destinations', () => {
  primaryServices.forEach((service) => {
    assert.ok(toContactServiceId(service.id), `${service.id} cannot prefill the contact form`);
    assert.ok(
      isValidSourceContext(`service:${service.id}`),
      `${service.id} is not an accepted contact source context`
    );
  });
  /* The related-work CTA links to /work/<slug>, so the slug has to exist. */
  primaryServices.flatMap((service) => service.relatedProjects).forEach((slug) => {
    assert.ok(isValidSourceContext(`case:${slug}`), `case:${slug} is not an accepted source context`);
  });
});

test('every core service has a visual and an icon', () => {
  primaryServices.forEach((service) => {
    assert.ok(serviceVisuals[service.id], `${service.id} has no visual slot`);
    assert.ok(service.icon, `${service.id} has no icon`);
  });
});

test('the differentiation block covers the families visitors confuse', () => {
  const serviceIds = new Set(primaryServices.map((service) => service.id));
  const covered = serviceDistinctions.map((entry) => entry.serviceId);
  ['websites', 'web-applications', 'business-systems', 'mobile-applications', 'file-management'].forEach((id) => {
    assert.ok(covered.includes(id), `differentiation is missing ${id}`);
  });
  serviceDistinctions.forEach((entry) => {
    assert.ok(serviceIds.has(entry.serviceId), `${entry.id} anchors to unknown service`);
    assert.ok(entry.is.trim() && entry.forWhom.trim(), `${entry.id} is missing copy`);
  });
});

test('the homepage preview is a subset, not the whole page', () => {
  const ids = new Set(primaryServices.map((service) => service.id));
  assert.ok(homeServicePreview.length >= 4 && homeServicePreview.length <= 6);
  assert.ok(homeServicePreview.length < primaryServices.length);
  homeServicePreview.forEach((service) => assert.ok(ids.has(service.id)));
});

/**
 * Claims the delivered systems do not support must not reappear in a later
 * copy edit. Each phrase below was removed for a specific reason: no automatic
 * tax or social-security calculation is offered, app-store publishing is scoped
 * per project, and no backup or security guarantee is made.
 */
test('service copy makes no unsupported compliance or guarantee claims', () => {
  const banned = [
    'ประกันสังคม',
    'ภาษีหัก ณ ที่จ่าย',
    'App Store',
    'Play Store',
    'ครบวงจร',
    'รับประกันความปลอดภัย'
  ];
  const haystack = services
    .map((service) =>
      [service.summary, service.detail, ...service.deliverables, ...(service.problems ?? []), ...(service.targetUsers ?? [])].join(' ')
    )
    .join(' ');
  banned.forEach((phrase) => {
    assert.ok(!haystack.includes(phrase), `service copy re-introduced an unsupported claim: "${phrase}"`);
  });
});
