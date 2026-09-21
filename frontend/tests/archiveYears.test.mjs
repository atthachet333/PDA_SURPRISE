import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ARCHIVE_PAGE_SIZE,
  resetArchiveView,
  resolveMediaYear,
  sanitizeArchiveFilters
} from '../src/data/archiveYears.ts';
import { memoryArchive } from '../src/data/memoryArchive.ts';
import { archiveVideos, memoryVideos } from '../src/data/memoryVideos.ts';
import { relationshipYears } from '../src/data/relationshipYears.ts';

test('all established photo and video records resolve to released Year 01', () => {
  assert.equal(memoryArchive.length, 118);
  assert.equal(archiveVideos.length, 17);
  assert.ok(memoryArchive.every((item) => item.yearId === 'year-01'));
  assert.ok(memoryVideos.every((item) => item.yearId === 'year-01'));
});

test('every assigned media year id is declared', () => {
  const valid = new Set(relationshipYears.map((year) => year.id));
  for (const item of [...memoryArchive, ...memoryVideos]) {
    assert.ok(item.yearId === 'unassigned' || valid.has(item.yearId), `${item.id}: ${item.yearId}`);
  }
});

test('Year 01 filters remain compatible and video clears a photo group', () => {
  assert.deepEqual(
    sanitizeArchiveFilters({ yearId: 'year-01', media: 'photo', group: 'life' }),
    { yearId: 'year-01', media: 'photo', group: 'life' }
  );
  assert.deepEqual(
    sanitizeArchiveFilters({ yearId: 'year-01', media: 'video', group: 'life' }),
    { yearId: 'year-01', media: 'video', group: 'all' }
  );
});

test('switching to preview Year 02 sanitizes stale filters and resets batching', () => {
  assert.deepEqual(
    sanitizeArchiveFilters({ yearId: 'year-02', media: 'photo', group: 'wedding' }),
    { yearId: 'year-02', media: 'all', group: 'all' }
  );
  assert.deepEqual(resetArchiveView('year-02'), {
    yearId: 'year-02', media: 'all', group: 'all', visibleCount: ARCHIVE_PAGE_SIZE
  });
});

test('owner override wins over capture date and undated media is retained', () => {
  assert.deepEqual(
    resolveMediaYear({ captureDate: '2025-11-01T12:00:00', ownerOverride: 'year-02' }),
    { yearId: 'year-02', source: 'owner-override' }
  );
  assert.deepEqual(resolveMediaYear({ captureDate: '2026-10-12T08:00:00' }), {
    yearId: 'year-02', source: 'capture-date'
  });
  assert.deepEqual(resolveMediaYear({ captureDate: null }), {
    yearId: 'unassigned', source: 'release-default'
  });
});
