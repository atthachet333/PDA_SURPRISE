import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DAY_MS,
  DEFAULT_ARCHIVE_YEAR_ID,
  STORY_RELEASE_YEAR_ID,
  deriveRelationshipYear,
  finaleProgress,
  nextAnniversaryAt,
  relationshipDaysAt,
  relationshipYearAt,
  relationshipYears,
  yearTwoPreview
} from '../src/data/relationshipYears.ts';

test('declared relationship years have unique ids and contiguous boundaries', () => {
  assert.equal(new Set(relationshipYears.map((year) => year.id)).size, relationshipYears.length);
  for (let index = 1; index < relationshipYears.length; index += 1) {
    const previous = relationshipYears[index - 1];
    const current = relationshipYears[index];
    assert.equal(Date.parse(current.startDate) - Date.parse(previous.endDate), DAY_MS);
  }
});

test('Bangkok boundary changes from Year 01 to Year 02 at local midnight', () => {
  assert.equal(relationshipYearAt('2026-10-11T16:59:59Z').number, 1);
  assert.equal(relationshipYearAt('2026-10-11T17:00:00Z').number, 2);
  assert.equal(relationshipYearAt('2026-10-13').number, 2);
  assert.equal(relationshipDaysAt('2026-10-12'), 365);
});

test('future boundaries remain derivable without declared scene copies', () => {
  assert.deepEqual(
    { start: deriveRelationshipYear(4).startDate, end: deriveRelationshipYear(4).endDate },
    { start: '2028-10-12', end: '2029-10-11' }
  );
  assert.equal(relationshipYearAt('2035-10-12').number, 11);
  assert.equal(nextAnniversaryAt('2028-10-11'), '2028-10-12');
});

test('a relationship year spanning February 2028 contains the leap day', () => {
  const yearThree = deriveRelationshipYear(3);
  const days = (Date.parse(yearThree.endDate) - Date.parse(yearThree.startDate)) / DAY_MS + 1;
  assert.equal(days, 366);
});

test('release state is independent from the device calendar', () => {
  assert.equal(STORY_RELEASE_YEAR_ID, 'year-01');
  assert.equal(DEFAULT_ARCHIVE_YEAR_ID, STORY_RELEASE_YEAR_ID);
  assert.equal(yearTwoPreview.releaseState, 'preview');
  assert.equal(finaleProgress(yearTwoPreview, '2026-12-01'), 0);
});
