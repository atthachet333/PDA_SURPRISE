import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

/* A throwaway "built frontend" so the single-origin topology can be exercised. */
const dist = mkdtempSync(join(tmpdir(), 'pda-dist-'));
mkdirSync(join(dist, 'assets'));
writeFileSync(join(dist, 'index.html'), '<!doctype html><title>shell</title>');
writeFileSync(join(dist, 'assets', 'Home-AbCdEf12.js'), 'export {};');

process.env.NODE_ENV = 'test';
process.env.LEAD_STORE = 'memory';
process.env.LOG_LEVEL = 'silent';
process.env.SERVE_FRONTEND = 'true';
process.env.FRONTEND_DIST = dist;

const { buildApp } = await import('../src/app.js');
const app = await buildApp();
test.after(async () => {
  await app.close();
  rmSync(dist, { recursive: true, force: true });
});

test('a page route deep link gets the SPA shell', async () => {
  for (const url of ['/', '/en/work/erp-inventory-costing', '/zh/does-not-exist', '/about?x=1']) {
    const response = await app.inject({ method: 'GET', url });
    assert.equal(response.statusCode, 200, url);
    assert.match(response.headers['content-type'] as string, /text\/html/, url);
  }
});

test('an existing hashed asset is served immutable', async () => {
  const response = await app.inject({ method: 'GET', url: '/assets/Home-AbCdEf12.js' });
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['cache-control'] as string, /immutable/);
});

test('a missing file is a real 404, never the HTML shell', async () => {
  for (const url of ['/assets/About-OldHash1.js', '/assets/whatever', '/sitemap.xml', '/favicon.ico', '/brand/nope.png?v=2']) {
    const response = await app.inject({ method: 'GET', url });
    assert.equal(response.statusCode, 404, url);
    assert.doesNotMatch(response.headers['content-type'] as string, /text\/html/, url);
  }
});

test('an unknown API route stays a JSON 404', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/nope' });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().ok, false);
});
