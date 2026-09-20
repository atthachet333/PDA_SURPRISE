import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  CANONICAL_PLACE_COUNT,
  CANONICAL_PROVINCE_COUNT,
  CANONICAL_PROVINCES,
  CANONICAL_VISITED_PLACES,
  STORY_PLACE_HIGHLIGHTS
} from '../src/data/journey.ts';

test('derives canonical place and province counts from their rosters', () => {
  assert.equal(CANONICAL_PLACE_COUNT, CANONICAL_VISITED_PLACES.length);
  assert.equal(CANONICAL_PLACE_COUNT, 19);
  assert.equal(CANONICAL_PROVINCE_COUNT, CANONICAL_PROVINCES.length);
  assert.equal(CANONICAL_PROVINCE_COUNT, 10);
});

test('keeps Status absent and TURR in the canonical roster', () => {
  const labels = CANONICAL_VISITED_PLACES.map((place) => place.label);
  assert.equal(labels.some((label) => /status/i.test(label)), false);
  assert.equal(labels.at(-1), 'ร้าน TURR เกษตร');
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(new Set(CANONICAL_VISITED_PLACES.map((place) => place.id)).size, CANONICAL_VISITED_PLACES.length);
});

test('keeps narrative highlights separate from geographic count data', () => {
  assert.equal(STORY_PLACE_HIGHLIGHTS.some((highlight) => highlight.kind === 'event'), true);
  assert.equal(STORY_PLACE_HIGHLIGHTS.some((highlight) => 'coordinatesPending' in highlight), false);
});

test('renders counts from roster lengths instead of duplicate numeric truth', async () => {
  const scene = await readFile(new URL('../src/scenes/surprise/Scene05Map.tsx', import.meta.url), 'utf8');
  const data = await readFile(new URL('../src/data/anniversary.ts', import.meta.url), 'utf8');

  assert.match(scene, /\{provinces\.length\}/);
  assert.match(scene, /\{visitedPlaces\.length\}/);
  assert.doesNotMatch(scene, />\s*(?:10|19)\s*</);
  assert.doesNotMatch(data, /id: 'places', value: 19\b/);
  assert.doesNotMatch(data, /id: 'provinces', value: 10\b/);
});
