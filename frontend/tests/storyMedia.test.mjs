import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  auditStoryMedia,
  storyMediaSlots,
  PEAK_MEDIA,
  TURR_MEDIA,
  STORY_MEDIA_EXCEPTIONS,
  MILESTONE_IDS,
  PORSCHE_MEDIA
} from '../src/data/storyMedia.ts';
import { anniversary } from '../src/data/anniversary.ts';
import { livingMemoryFor } from '../src/data/memoryVideos.ts';

const manifest = JSON.parse(readFileSync(new URL('../../tools/anniversary-media-curation.json', import.meta.url), 'utf8'));

/* Runtime path → source file, so a hero and its archive copy count as one. */
const SOURCE = new Map();
for (const file of manifest.files) {
  for (const path of [...(file.productionAssets ?? []), file.thumb].filter(Boolean)) SOURCE.set(path, file.sourceFilename);
}
for (const clip of manifest.videoCuration) {
  if (clip.runtimeVideo) SOURCE.set(clip.runtimeVideo, clip.sourceFilename);
}
const sourceOf = (src) => SOURCE.get(src) ?? src;

test('every story slot points at a local file that exists', () => {
  for (const slot of storyMediaSlots()) {
    assert.match(slot.src, /^\/(images|videos)\//, `${slot.scene}/${slot.slot} is not a local path`);
    assert.doesNotMatch(slot.src, /\.(mov|heic)$/i, `${slot.scene}/${slot.slot} ships a raw container`);
    assert.ok(existsSync(new URL(`../public${slot.src}`, import.meta.url)), `${slot.src} is missing on disk`);
  }
});

test('the main story passes the duplication audit by source file', () => {
  const issues = auditStoryMedia(storyMediaSlots(), { sourceOf });
  assert.deepEqual(issues, [], issues.map((issue) => `${issue.kind}: ${issue.src} (${issue.detail})`).join('\n'));
});

test('the audit catches adjacent, cross-event and overused sources', () => {
  const a = '/images/a.webp';
  const slots = [
    { scene: 's1', slot: 'x', src: a, event: 'peak' },
    { scene: 's2', slot: 'y', src: a, event: 'turr' },
    { scene: 's3', slot: 'z', src: a, event: 'peak' }
  ];
  const kinds = auditStoryMedia(slots).map((issue) => issue.kind).sort();
  assert.deepEqual(kinds, ['adjacent', 'adjacent', 'cross-event', 'overused']);
});

test('exceptions must carry a reason and are never silent', () => {
  const slots = [
    { scene: 's1', slot: 'x', src: '/a', event: 'daily' },
    { scene: 's2', slot: 'y', src: '/a', event: 'daily' }
  ];
  assert.deepEqual(auditStoryMedia(slots, { exceptions: [{ src: '/a', reason: 'the same frame, deliberately echoed' }] }), []);
  const kinds = auditStoryMedia(slots, { exceptions: [{ src: '/a', reason: '' }] }).map((issue) => issue.kind);
  assert.ok(kinds.includes('bad-exception') && kinds.includes('adjacent'));
  for (const exception of STORY_MEDIA_EXCEPTIONS) assert.ok(exception.reason.length >= 12);
});

test('Peak and TURR are locked to their owner-confirmed sources', () => {
  assert.equal(sourceOf(PEAK_MEDIA.hero), 'IMG_3416.HEIC');
  assert.equal(sourceOf(TURR_MEDIA.still), 'IMG_3479.PNG');
  assert.equal(sourceOf(TURR_MEDIA.video), '6769b2a3e5a248d4833bef137f530def.MOV');
  assert.notEqual(sourceOf(PEAK_MEDIA.hero), sourceOf(TURR_MEDIA.still));
  assert.equal(livingMemoryFor('journey')?.video, TURR_MEDIA.video);

  /* No slot for either event borrows the other event's media. */
  const peakSources = new Set([sourceOf(PEAK_MEDIA.hero)]);
  const turrSources = new Set([TURR_MEDIA.still, TURR_MEDIA.video, TURR_MEDIA.recap].map(sourceOf));
  for (const slot of storyMediaSlots()) {
    if (slot.event === 'peak') assert.ok(!turrSources.has(sourceOf(slot.src)), `${slot.slot} shows TURR media as Peak`);
    if (slot.event === 'turr') assert.ok(!peakSources.has(sourceOf(slot.src)), `${slot.slot} shows Peak media as TURR`);
  }
});

test('the 12 OCT recap never repeats the 12 OCT hero', () => {
  const recap = anniversary.timeline.find((moment) => moment.id === 't2');
  assert.equal(recap?.image, TURR_MEDIA.recap);
  assert.notEqual(recap?.image, TURR_MEDIA.still);
  assert.equal(anniversary.memories.find((memory) => memory.id === 'm19')?.image, TURR_MEDIA.recap);
});

test('milestones keep the established order: pre-wedding, wedding, 20 DEC, 28 JUL', () => {
  const order = anniversary.timeline.map((moment) => moment.id).filter((id) => MILESTONE_IDS.includes(id));
  assert.deepEqual(order, ['t8b', 't8c', 't7b', 't8']);
  assert.equal(anniversary.timeline.find((moment) => moment.id === 't7b')?.label, '20 DEC 2025');
  assert.equal(anniversary.timeline.find((moment) => moment.id === 't8')?.label, '28 JUL 2026');
  /* The ceremony stays undated. */
  assert.doesNotMatch(anniversary.timeline.find((moment) => moment.id === 't8c')?.label ?? '', /\d/);
});

test('Porsche media, when present, is only privacy-cleared local derivatives', () => {
  const bySource = new Map(manifest.files.flatMap((file) => (file.productionAssets ?? []).map((path) => [path, file])));
  for (const item of PORSCHE_MEDIA) {
    assert.match(item.src, /^\/images\/memories\/.+\.webp$/);
    const file = bySource.get(item.src);
    assert.ok(file, `${item.src} has no manifest record`);
    assert.equal(file.privacy, 'safe-after-crop', `${item.src} was not privacy-cropped`);
  }
});
