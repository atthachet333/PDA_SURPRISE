import assert from 'node:assert/strict';
import test from 'node:test';
import { caseStudies } from '../src/data/caseStudies.ts';
import { services } from '../src/data/services.ts';
import { businessSystems } from '../src/data/systemUniverse.ts';

test('case studies have unique IDs and slugs', () => {
  const ids = caseStudies.map((study) => study.id);
  const slugs = caseStudies.map((study) => study.slug);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('case studies contain required problem and solution content', () => {
  caseStudies.forEach((study) => {
    assert.ok(study.title.trim(), `${study.slug} needs a title`);
    assert.ok(study.problem.trim(), `${study.slug} needs a problem`);
    assert.ok(study.solution.trim(), `${study.slug} needs a solution`);
    assert.ok(study.outcomes.length, `${study.slug} needs qualitative outcomes`);
  });
});

test('case study flows are non-empty with unique IDs', () => {
  caseStudies.forEach((study) => {
    assert.ok(study.flow.length > 0, `${study.slug} has no flow`);
    const stepIds = study.flow.map((step) => step.id);
    assert.equal(new Set(stepIds).size, stepIds.length, `${study.slug} has duplicate flow IDs`);
    study.flow.forEach((step) => {
      assert.ok(step.title.trim());
      assert.ok(step.actor.trim());
      assert.ok(step.description.trim());
      assert.ok(step.output.trim());
    });
  });
});

test('related systems and service routes are valid', () => {
  const systemIds = new Set(businessSystems.map((system) => system.id));
  const serviceIds = new Set(services.map((service) => service.id));
  caseStudies.forEach((study) => {
    const match = study.serviceRoute.match(/^\/services#([a-z-]+)$/);
    assert.ok(match, `${study.slug} has an invalid service route`);
    assert.ok(serviceIds.has(match[1]), `${study.slug} references missing service ${match[1]}`);
    assert.equal(new Set(study.relatedSystems).size, study.relatedSystems.length);
    study.relatedSystems.forEach((systemId) => assert.ok(systemIds.has(systemId), `${study.slug} references missing system ${systemId}`));
  });
});

test('screens cannot publish without privacy-review fields', () => {
  caseStudies.flatMap((study) => study.screens).forEach((screen) => {
    assert.equal(screen.reviewed, true);
    assert.ok(screen.src.startsWith('/images/work/'));
    assert.ok(screen.alt.trim());
    assert.ok(screen.caption.trim());
  });
});
