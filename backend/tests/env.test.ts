import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { isPublicHttpsOrigin } = await import('../src/config/env.js');
const backendDir = fileURLToPath(new URL('..', import.meta.url));

test('PUBLIC_ORIGIN must be a public https origin', () => {
  for (const origin of ['https://pda.example.com', 'https://pda.example.com/', 'https://www.example.co.th:8443']) {
    assert.ok(isPublicHttpsOrigin(origin), origin);
  }
  for (const origin of [
    'http://pda.example.com',
    'https://localhost',
    'https://127.0.0.1',
    'https://192.168.1.10',
    'https://10.1.2.3',
    'https://172.20.0.1',
    'https://server.lan',
    'https://intranet',
    'https://[::1]',
    'https://pda.example.com/app',
    'https://pda.example.com/?x=1',
    'https://user:pw@pda.example.com',
    'not a url'
  ]) {
    assert.ok(!isPublicHttpsOrigin(origin), origin);
  }
});

/** Boots only the env module in a child process with the given variables. */
function bootEnv(extra: Record<string, string>) {
  return spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "await import('./src/config/env.ts')"], {
    cwd: backendDir,
    encoding: 'utf8',
    env: { PATH: process.env.PATH ?? '', NODE_ENV: 'production', SERVE_FRONTEND: 'true', ...extra }
  });
}

test('production refuses to start with a private or non-https PUBLIC_ORIGIN', () => {
  for (const origin of ['https://localhost', 'https://192.168.1.10', 'http://pda.example.com']) {
    const result = bootEnv({ PUBLIC_ORIGIN: origin });
    assert.notEqual(result.status, 0, origin);
    assert.match(result.stderr, /Refusing to start in production/, origin);
  }
});

test('production starts with a public https PUBLIC_ORIGIN, or none yet', () => {
  assert.equal(bootEnv({ PUBLIC_ORIGIN: 'https://pda.example.com' }).status, 0);
  assert.equal(bootEnv({ PUBLIC_ORIGIN: '' }).status, 0);
});
