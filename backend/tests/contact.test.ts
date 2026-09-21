import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NODE_ENV = 'test';
process.env.LEAD_STORE = 'memory';
process.env.LOG_LEVEL = 'silent';
process.env.CONTACT_RATE_MAX = '5';

const { buildApp } = await import('../src/app.js');
const { contactRequestSchema } = await import('../src/schemas/contact.js');
const { formatContactNotification } = await import('../src/services/contactNotification.js');

const guidedPayload = {
  contactType: 'guided',
  serviceId: 'business-systems',
  currentSituation: 'ใช้ Spreadsheet แยกกันหลายฝ่าย',
  desiredOutcome: 'รวมสถานะสต็อกและต้นทุนไว้ใน Workflow เดียว',
  projectDetails: { modules: ['stock', 'costing'], 'operational-users': '10-50' },
  budgetRange: 'not-defined',
  timeline: '1-3-months',
  contactName: 'Test User',
  email: 'test@example.com',
  phone: '',
  lineId: '',
  sourceContext: 'solutions:erp',
  website: ''
} as const;

async function withApp(run: (app: Awaited<ReturnType<typeof buildApp>>) => Promise<void>) {
  const app = await buildApp();
  try { await run(app); } finally { await app.close(); }
}

test('accepts a valid structured submission', async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: 'POST', url: '/api/contact', payload: guidedPayload });
    assert.equal(response.statusCode, 201);
    assert.ok(response.json().data.reference);
    assert.ok(response.headers['x-request-id']);
  });
});

test('accepts quick and legacy submissions without sending email', async () => {
  await withApp(async (app) => {
    const quick = await app.inject({ method: 'POST', url: '/api/contact', payload: { contactType: 'quick', contactName: 'Quick User', email: '', phone: '0812345678', lineId: '', notes: 'อยากปรึกษาเรื่องระบบภายในองค์กร', website: '' } });
    assert.equal(quick.statusCode, 201);
    const legacy = await app.inject({ method: 'POST', url: '/api/contact', payload: { name: 'Legacy User', company: '', email: 'legacy@example.com', phone: '', projectType: 'website', budget: 'not-sure', timeline: 'planning', message: 'Existing frontend payload remains supported.', website: '' } });
    assert.equal(legacy.statusCode, 201);
  });
});

test('rejects unknown services and enum values with requestId', async () => {
  await withApp(async (app) => {
    const service = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, serviceId: 'made-up-service' } });
    assert.equal(service.statusCode, 400);
    assert.equal(service.json().error.code, 'VALIDATION_ERROR');
    assert.ok(service.json().requestId);
    const budget = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, budgetRange: 'unlimited' } });
    assert.equal(budget.statusCode, 400);
  });
});

test('rejects questions and options that do not belong to the selected service', async () => {
  await withApp(async (app) => {
    const wrongQuestion = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, projectDetails: { 'website-type': 'corporate' } } });
    assert.equal(wrongQuestion.statusCode, 400);
    const wrongOption = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, projectDetails: { modules: ['stock', 'inject-me'] } } });
    assert.equal(wrongOption.statusCode, 400);
  });
});

test('rejects oversized values and bodies', async () => {
  await withApp(async (app) => {
    const value = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, currentSituation: 'x'.repeat(1201) } });
    assert.equal(value.statusCode, 400);
    const body = await app.inject({ method: 'POST', url: '/api/contact', headers: { 'content-type': 'application/json' }, payload: JSON.stringify({ ...guidedPayload, currentSituation: 'x'.repeat(70_000) }) });
    assert.equal(body.statusCode, 413);
    assert.equal(body.json().ok, false);
    assert.ok(body.json().requestId);
  });
});

test('silently accepts a filled honeypot', async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, website: 'https://spam.example' } });
    assert.equal(response.statusCode, 202);
    assert.equal(response.json().data.reference, 'PDA-QUEUED');
  });
});

test('rate limit keeps the standard error envelope', async () => {
  await withApp(async (app) => {
    for (let index = 0; index < 5; index += 1) {
      const accepted = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...guidedPayload, contactName: `Rate User ${index}` } });
      assert.equal(accepted.statusCode, 201);
    }
    const limited = await app.inject({ method: 'POST', url: '/api/contact', payload: guidedPayload });
    assert.equal(limited.statusCode, 429);
    assert.equal(limited.json().error.code, 'RATE_LIMITED');
    assert.ok(limited.json().requestId);
  });
});

test('formats trusted, injection-safe notification output', () => {
  const parsed = contactRequestSchema.parse({
    ...guidedPayload,
    contactName: 'Header\r\nBcc: attacker@example.com',
    companyName: '<script>alert(1)</script>',
    currentSituation: '<img src=x onerror=alert(1)>'
  });
  const notification = formatContactNotification(parsed);
  assert.doesNotMatch(notification.subject, /[\r\n]/);
  assert.match(notification.subject, /ERP \/ ระบบหลังบ้าน enquiry/);
  assert.doesNotMatch(notification.html, /<script>|<img/);
  assert.match(notification.html, /&lt;script&gt;/);
  assert.match(notification.text, /Stock|สต็อก/);
  assert.equal(notification.replyTo, 'test@example.com');
});
