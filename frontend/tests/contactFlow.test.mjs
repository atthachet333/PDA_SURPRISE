import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contactHref,
  contactIntents,
  contactSteps,
  getContactIntent,
  resolveContactPrefill,
  systemToContactService
} from '../src/data/contactFlow.ts';
import { services } from '../src/data/services.ts';
import { businessSystems } from '../src/data/systemUniverse.ts';

test('contact intents and question references are unique', () => {
  const intentIds = contactIntents.map((intent) => intent.id);
  assert.equal(new Set(intentIds).size, intentIds.length);
  contactIntents.forEach((intent) => {
    const questionIds = intent.questions.map((question) => question.id);
    assert.equal(new Set(questionIds).size, questionIds.length, `${intent.id} repeats a question ID`);
    intent.questions.forEach((question) => {
      assert.ok(question.label.trim());
      if (question.kind !== 'text') {
        assert.ok(question.options?.length, `${intent.id}:${question.id} needs options`);
        const values = question.options.map((option) => option.value);
        assert.equal(new Set(values).size, values.length);
      }
    });
  });
});

test('every intent and System Universe prefill maps to a canonical service', () => {
  const serviceIds = new Set(services.map((service) => service.id));
  contactIntents.forEach((intent) => assert.ok(serviceIds.has(intent.id), `missing service ${intent.id}`));
  businessSystems.forEach((system) => {
    const mapped = systemToContactService[system.id];
    assert.ok(mapped, `missing contact mapping for ${system.id}`);
    assert.ok(serviceIds.has(mapped));
  });
});

test('guided flow keeps the five required steps in order', () => {
  assert.deepEqual(contactSteps.map((step) => step.id), ['intent', 'situation', 'outcome', 'contact', 'review']);
});

test('prefill accepts controlled service and source values only', () => {
  assert.deepEqual(resolveContactPrefill('?service=business-systems&source=solutions%3Aerp'), { serviceId: 'business-systems', sourceContext: 'solutions:erp' });
  assert.deepEqual(resolveContactPrefill('?service=payroll&source=case%3Apayroll-monthly-control'), { serviceId: 'payroll', sourceContext: 'case:payroll-monthly-control' });
  assert.deepEqual(resolveContactPrefill('?service=unknown&source=https%3A%2F%2Fevil.example'), { serviceId: undefined, sourceContext: undefined });
  assert.equal(contactHref('websites', 'service:websites'), '/contact?service=websites&source=service%3Awebsites');
});

test('conditional questions differ by intent and stay relevant', () => {
  const erp = getContactIntent('business-systems');
  const website = getContactIntent('websites');
  const payroll = getContactIntent('payroll');
  assert.ok(erp?.questions.some((question) => question.id === 'modules'));
  assert.ok(payroll?.questions.some((question) => question.id === 'attendance-source'));
  assert.ok(website?.questions.some((question) => question.id === 'domain'));
  assert.equal(website?.questions.some((question) => question.id === 'attendance-source'), false);
});
