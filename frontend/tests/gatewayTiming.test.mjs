import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ARRIVAL_CUES,
  ARRIVAL_CUES_FROM_GATEWAY,
  ARRIVAL_ENTRY_FROM_GATEWAY,
  ARRIVAL_SETTLE_FROM_GATEWAY_MS,
  ARRIVAL_SETTLE_MS,
  ARRIVAL_STEP,
  GATEWAY_CUES,
  GATEWAY_SETTLE_MS,
  GATEWAY_STATUS,
  GATEWAY_STEP,
  lastCueMs
} from '../src/lib/gatewayTiming.ts';

/*
 * These are contract tests, not animation tests. They assert the things that
 * were actually wrong on the running site and would be easy to reintroduce:
 * a status that moves backwards, a gateway path that is slower than opening
 * /us directly, and a settle that lands before the sequence it is meant to
 * guarantee. Nothing here depends on a frame, a renderer or a snapshot.
 */

test('every cue table moves forward in both step and time', () => {
  for (const [name, cues] of [
    ['gateway', GATEWAY_CUES],
    ['arrival', ARRIVAL_CUES],
    ['arrival-from-gateway', ARRIVAL_CUES_FROM_GATEWAY]
  ]) {
    cues.forEach(([step, ms], index) => {
      if (index === 0) return;
      const [prevStep, prevMs] = cues[index - 1];
      assert.ok(step > prevStep, `${name}: step went backwards at index ${index}`);
      assert.ok(ms > prevMs, `${name}: time went backwards at index ${index}`);
    });
  }
});

test('each sequence ends on its READY step', () => {
  assert.equal(GATEWAY_CUES.at(-1)[0], GATEWAY_STEP.READY);
  assert.equal(ARRIVAL_CUES.at(-1)[0], ARRIVAL_STEP.READY);
  assert.equal(ARRIVAL_CUES_FROM_GATEWAY.at(-1)[0], ARRIVAL_STEP.READY);
});

test('the settle guarantee lands after the last cue it protects', () => {
  assert.ok(GATEWAY_SETTLE_MS > lastCueMs(GATEWAY_CUES));
  assert.ok(ARRIVAL_SETTLE_MS > lastCueMs(ARRIVAL_CUES));
  assert.ok(ARRIVAL_SETTLE_FROM_GATEWAY_MS > lastCueMs(ARRIVAL_CUES_FROM_GATEWAY));
});

test('the gateway is ready within five seconds', () => {
  // Anything longer stops being a crossing and becomes a loading screen.
  assert.ok(lastCueMs(GATEWAY_CUES) <= 5000, 'gateway takes too long to become actionable');
  assert.ok(lastCueMs(GATEWAY_CUES) >= 3000, 'gateway resolves too fast to read as a crossing');
});

test('arriving through the gateway is shorter than opening /us directly', () => {
  // The whole point of the boundary fix: someone who has just watched the
  // gateway and the portal must not sit through the full arrival as well.
  assert.ok(
    lastCueMs(ARRIVAL_CUES_FROM_GATEWAY) < lastCueMs(ARRIVAL_CUES),
    'the gateway path must not be slower than the direct path'
  );
  assert.ok(ARRIVAL_SETTLE_FROM_GATEWAY_MS < ARRIVAL_SETTLE_MS);
});

test('the gateway path skips the arrival opening flash', () => {
  // The flash renders only while step < ORBIT. Entering past it is what stops
  // a second white frame landing on top of the portal's own white.
  assert.ok(
    ARRIVAL_ENTRY_FROM_GATEWAY > ARRIVAL_STEP.ORBIT,
    'entering at or before ORBIT would replay the white flash'
  );
});

test('gateway status has one label per step and never repeats backwards', () => {
  const steps = Object.values(GATEWAY_STEP).sort((a, b) => a - b);
  for (const step of steps) {
    assert.equal(typeof GATEWAY_STATUS[step], 'string', `missing status for step ${step}`);
    assert.ok(GATEWAY_STATUS[step].length > 0, `empty status for step ${step}`);
  }

  // A label reappearing after a later one has shown reads as the connection
  // dropping and retrying. LINKING WORLDS → ESTABLISHED → LINKING WORLDS was
  // exactly that, and it shipped.
  const labels = steps.map((step) => GATEWAY_STATUS[step]);
  assert.equal(new Set(labels).size, labels.length, 'a gateway status label repeats');
});
