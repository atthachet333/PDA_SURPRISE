import {
  budgetLabels,
  contactServiceLabels,
  timelineLabels,
  trustedQuestions
} from '../contact/contactConfig.js';
import type { ContactRequest } from '../schemas/contact.js';

const htmlEscape = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const cleanSubjectPart = (value: string) => value
  .replace(/[\r\n\t]+/g, ' ')
  .replace(/[\u0000-\u001f\u007f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 100);

function answerLabel(serviceId: NonNullable<ContactRequest['serviceId']>, questionId: string, value: string | string[]): string {
  const question = trustedQuestions[serviceId][questionId];
  const values = Array.isArray(value) ? value : [value];
  return values.map((answer) => question?.options?.[answer] ?? answer).join(', ');
}

export interface ContactNotification {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/** Mail-ready output only. Delivery remains intentionally outside this service. */
export function formatContactNotification(lead: ContactRequest): ContactNotification {
  const serviceLabel = lead.serviceId ? contactServiceLabels[lead.serviceId] : 'General enquiry';
  const sender = cleanSubjectPart(lead.companyName || lead.contactName) || 'New contact';
  const sections: Array<[string, Array<[string, string | undefined]>]> = [
    ['CONTACT', [
      ['Name', lead.contactName],
      ['Company', lead.companyName || undefined],
      ['Email', lead.email || undefined],
      ['Phone', lead.phone || undefined],
      ['LINE ID', lead.lineId || undefined]
    ]],
    ['REQUEST TYPE', [
      ['Mode', lead.contactType],
      ['Service', serviceLabel]
    ]]
  ];

  if (lead.contactType === 'guided') {
    sections.push(
      ['CURRENT SITUATION', [['Details', lead.currentSituation], ['Industry', lead.industry || undefined], ['Existing website', lead.existingWebsite || undefined]]],
      ['GOAL', [['Desired outcome', lead.desiredOutcome], ['Budget range', lead.budgetRange ? budgetLabels[lead.budgetRange] : undefined], ['Timeline', lead.timeline ? timelineLabels[lead.timeline] : undefined]]],
      ['PROJECT DETAILS', Object.entries(lead.projectDetails).map(([questionId, value]) => [trustedQuestions[lead.serviceId][questionId]?.label ?? questionId, answerLabel(lead.serviceId, questionId, value)])],
      ['NOTES', [['Notes', lead.notes || undefined]]]
    );
  } else {
    sections.push(['MESSAGE', [['Notes', lead.notes]]]);
  }
  sections.push(['SOURCE', [['Context', lead.sourceContext || 'direct']]]);

  const text = sections.map(([heading, rows]) => {
    const visible = rows.filter(([, value]) => value);
    if (!visible.length) return '';
    return `${heading}\n${visible.map(([label, value]) => `${label}: ${value}`).join('\n')}`;
  }).filter(Boolean).join('\n\n');

  const html = sections.map(([heading, rows]) => {
    const visible = rows.filter(([, value]) => value);
    if (!visible.length) return '';
    return `<section><h2>${htmlEscape(heading)}</h2><dl>${visible.map(([label, value]) => `<dt>${htmlEscape(label)}</dt><dd>${htmlEscape(value ?? '')}</dd>`).join('')}</dl></section>`;
  }).filter(Boolean).join('');

  return {
    subject: `[PDA BLISS] ${cleanSubjectPart(serviceLabel)} enquiry — ${sender}`,
    text,
    html,
    replyTo: lead.email || undefined
  };
}
