import assert from 'node:assert/strict';
import test from 'node:test';
import { businessSystems } from '../src/data/systemUniverse.ts';

test('system universe has unique, non-empty IDs and labels', () => {
  const ids = businessSystems.map((system) => system.id);
  assert.equal(new Set(ids).size, ids.length);
  businessSystems.forEach((system) => {
    assert.ok(system.id.trim());
    assert.ok(system.nameTh.trim());
    assert.ok(system.nameEn.trim());
    assert.ok(system.shortDescription.trim());
    assert.ok(system.capabilities.length >= 3);
  });
});

test('system universe connections target valid systems without self-links or duplicates', () => {
  const ids = new Set(businessSystems.map((system) => system.id));
  const edgePairs = [];
  businessSystems.forEach((system) => {
    const targets = system.connections.map((connection) => connection.targetId);
    assert.equal(new Set(targets).size, targets.length, `${system.id} has duplicate connections`);
    targets.forEach((targetId) => {
      assert.ok(ids.has(targetId), `${system.id} points to missing ${targetId}`);
      assert.notEqual(targetId, system.id, `${system.id} points to itself`);
      edgePairs.push([system.id, targetId].sort().join('|'));
    });
    system.connections.forEach((connection) => assert.ok(connection.label.trim()));
  });
  assert.equal(new Set(edgePairs).size, edgePairs.length, 'contains a duplicate undirected edge');
});

test('system routes are public service anchors', () => {
  businessSystems.forEach((system) => assert.match(system.route, /^\/services#[a-z-]+$/));
});
