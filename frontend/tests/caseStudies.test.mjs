import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import {
  caseStudies,
  homeWorkPreview,
  projectLiveLink,
  projectsForFilter,
  workFilters
} from '../src/data/caseStudies.ts';
import { isSafePublicUrl } from '../src/lib/externalLinks.ts';
import { metrics } from '../src/data/company.ts';
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

test('every project is filterable and filters count correctly', () => {
  const filterIds = new Set(workFilters.map((entry) => entry.id));
  assert.equal(projectsForFilter('all').length, caseStudies.length);
  caseStudies.forEach((study) => {
    assert.ok(study.filters.length > 0, `${study.slug} has no filter`);
    study.filters.forEach((filter) => assert.ok(filterIds.has(filter), `${study.slug} uses unknown filter ${filter}`));
  });
  workFilters.filter((entry) => entry.id !== 'all').forEach((entry) => {
    const expected = caseStudies.filter((study) => study.filters.includes(entry.id)).length;
    assert.equal(projectsForFilter(entry.id).length, expected);
  });
});

test('project cards carry the required content', () => {
  caseStudies.forEach((study) => {
    assert.ok(study.projectType.trim(), `${study.slug} needs a project type`);
    assert.ok(study.delivered.trim(), `${study.slug} needs a delivered line`);
    assert.ok(study.tags.length >= 2 && study.tags.length <= 4, `${study.slug} needs 2-4 tags`);
  });
  assert.equal(caseStudies.filter((study) => study.featured).length, 3);
  assert.ok(homeWorkPreview.length >= 3 && homeWorkPreview.length <= 5);
});

test('screenshots are reviewed local files that exist', () => {
  caseStudies.forEach((study) => {
    if (!study.screenshot) return;
    assert.equal(study.screenshot.reviewed, true);
    for (const src of [study.screenshot.src, study.screenshot.srcSmall].filter(Boolean)) {
      assert.ok(src.startsWith('/images/work/'), `${study.slug} screenshot is not local`);
      assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `${src} is missing`);
    }
  });
});

test('external URL gate rejects unsafe destinations', () => {
  const unsafe = [
    undefined,
    '',
    'http://example.co.th',
    'https://localhost:3000',
    'https://127.0.0.1',
    'https://192.168.1.20/app',
    'https://10.0.0.5',
    'https://172.20.1.1',
    'https://nas.local',
    'https://intranet',
    'https://user:pass@example.co.th',
    'https://example.co.th/?token=abc',
    'https://example.co.th/admin',
    'javascript:alert(1)'
  ];
  unsafe.forEach((url) => assert.equal(isSafePublicUrl(url), false, `accepted ${url}`));
  assert.equal(isSafePublicUrl('https://example.co.th/services'), true);
});

test('only public projects with a safe URL render a live link', () => {
  caseStudies.forEach((study) => {
    const live = projectLiveLink(study);
    if (live) {
      assert.equal(study.visibility, 'public');
      assert.ok(isSafePublicUrl(study.liveUrl));
    }
    /* Even a mistakenly set URL must never surface on a private project. */
    if (study.visibility !== 'public') {
      assert.equal(projectLiveLink({ ...study, liveUrl: 'https://example.co.th' }), null);
    }
  });
});

test('company-level verified metrics are unchanged', () => {
  assert.deepEqual(metrics.map((metric) => metric.value), [6, 4]);
});
