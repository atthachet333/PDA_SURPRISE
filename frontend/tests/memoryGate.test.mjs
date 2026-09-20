import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatMemoryDate,
  isRegistrationDateAnswer,
  parseMemoryDateInput,
  parseMemoryDateParts
} from '../src/lib/memoryGate.ts';
import {
  MEMORY_GATE_SESSION_KEY,
  readMemoryGateUnlock,
  writeMemoryGateUnlock
} from '../src/lib/memoryGateSession.ts';

const REGISTRATION_DATE = '2026-07-28';

test('accepts every specified Gregorian and Buddhist Era form', () => {
  for (const input of [
    '28/07/2026',
    '28-07-2026',
    '28.07.2026',
    '28072026',
    '28/07/2569',
    '28-07-2569',
    '28.07.2569',
    '28072569'
  ]) {
    assert.equal(isRegistrationDateAnswer(parseMemoryDateInput(input), REGISTRATION_DATE), true, input);
  }
});

test('validates real calendar dates and rejects malformed input', () => {
  for (const input of [
    '31/02/2026',
    '00/07/2026',
    '28/13/2026',
    '28/07/26',
    '2026-07-28',
    '28/07-2026',
    'hello'
  ]) {
    assert.equal(parseMemoryDateInput(input), null, input);
  }

  assert.equal(parseMemoryDateParts('31', '04', '2026'), null);
  assert.equal(parseMemoryDateParts('28', '07', '2569')?.iso, REGISTRATION_DATE);
});

test('rejects the complete wrong-answer matrix', () => {
  for (const input of [
    '27/07/2026',
    '29/07/2026',
    '28/08/2026',
    '28/07/2025',
    '28/07/2570',
    ''
  ]) {
    assert.equal(isRegistrationDateAnswer(parseMemoryDateInput(input), REGISTRATION_DATE), false, input);
  }
  assert.equal(isRegistrationDateAnswer(parseMemoryDateParts('28', '07', ''), REGISTRATION_DATE), false);
});

test('derives every displayed date from the canonical ISO date', () => {
  assert.deepEqual(formatMemoryDate(REGISTRATION_DATE), {
    day: '28',
    month: '07',
    gregorianYear: '2026',
    buddhistYear: '2569',
    english: '28 JULY 2026',
    thai: '28 กรกฎาคม 2569',
    dotted: '28 · 07 · 2026'
  });
});

test('persists one session unlock and tolerates unavailable storage', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };

  assert.equal(readMemoryGateUnlock(storage), false);
  assert.equal(writeMemoryGateUnlock(storage), true);
  assert.equal(values.get(MEMORY_GATE_SESSION_KEY), '1');
  assert.equal(readMemoryGateUnlock(storage), true);
  assert.equal(readMemoryGateUnlock(null, true), true);
});
