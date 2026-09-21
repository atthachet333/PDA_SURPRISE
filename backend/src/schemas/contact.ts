import { z } from 'zod';
import {
  budgetRanges,
  contactServiceIds,
  timelines,
  trustedQuestions,
  type ContactServiceId
} from '../contact/contactConfig.js';

export { budgetRanges, contactServiceIds, timelines } from '../contact/contactConfig.js';

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalText = (max: number) => trimmed(0, max).optional().or(z.literal(''));
const optionalEmail = z.string().trim().email().max(180).optional().or(z.literal(''));
const optionalPhone = z.string().trim().max(40).regex(/^[0-9+().\-\s]*$/, 'Invalid phone number').optional().or(z.literal(''));
const optionalUrl = z.string().trim().url().max(300).optional().or(z.literal(''));
const detailValue = z.union([trimmed(1, 600), z.array(trimmed(1, 120)).min(1).max(8)]);

const commonFields = {
  contactName: trimmed(2, 120),
  companyName: optionalText(160),
  email: optionalEmail,
  phone: optionalPhone,
  lineId: optionalText(80),
  sourceContext: optionalText(100),
  website: z.string().max(200).optional()
};

function validateContactChannel(data: { email?: string; phone?: string; lineId?: string }, context: z.RefinementCtx) {
  if (!data.email && !data.phone && !data.lineId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Provide email, phone, or LINE ID.' });
  }
}

function validSourceContext(value: string | undefined): boolean {
  if (!value) return true;
  if (value === 'home') return true;
  if (/^solutions:(erp|payroll|hr-line-bot|documents|nas-files|webapp|mobile-app|website)$/.test(value)) return true;
  if (/^case:(erp-inventory-costing|payroll-monthly-control|hr-line-leave-approval|document-file-workflow|corporate-website-system)$/.test(value)) return true;
  return new RegExp(`^service:(${contactServiceIds.join('|')})$`).test(value);
}

const guidedRequestSchema = z.object({
  contactType: z.literal('guided'),
  serviceId: z.enum(contactServiceIds),
  currentSituation: trimmed(3, 1200),
  desiredOutcome: trimmed(3, 1200),
  projectDetails: z.record(detailValue).default({}),
  budgetRange: z.enum(budgetRanges).optional(),
  timeline: z.enum(timelines).optional(),
  industry: optionalText(120),
  existingWebsite: optionalUrl,
  notes: optionalText(1600),
  ...commonFields
}).superRefine((data, context) => {
  validateContactChannel(data, context);
  if (!validSourceContext(data.sourceContext)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sourceContext'], message: 'Invalid source context.' });
  }

  const questions = trustedQuestions[data.serviceId];
  const entries = Object.entries(data.projectDetails);
  if (entries.length > 12) {
    context.addIssue({ code: z.ZodIssueCode.too_big, maximum: 12, inclusive: true, type: 'array', path: ['projectDetails'], message: 'Too many project detail fields.' });
  }
  entries.forEach(([questionId, value]) => {
    const question = questions[questionId];
    if (!question) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['projectDetails', questionId], message: 'Question is not valid for the selected service.' });
      return;
    }
    if (!question.options) return;
    const answers = Array.isArray(value) ? value : [value];
    answers.forEach((answer) => {
      if (!question.options?.[answer]) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['projectDetails', questionId], message: 'Invalid answer option.' });
      }
    });
  });
});

const quickRequestSchema = z.object({
  contactType: z.literal('quick'),
  serviceId: z.enum(contactServiceIds).optional(),
  notes: trimmed(10, 4000),
  ...commonFields
}).superRefine((data, context) => {
  validateContactChannel(data, context);
  if (!validSourceContext(data.sourceContext)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sourceContext'], message: 'Invalid source context.' });
  }
});

const legacyProjectTypes = [
  'business-system', 'payroll', 'website', 'web-application', 'mobile-application',
  'hr-line-bot', 'document-management', 'custom-software', 'automation', 'integration',
  'data-analytics', 'cloud-infrastructure', 'consulting', 'other'
] as const;
export const projectTypes = legacyProjectTypes;
export const legacyBudgetRanges = ['under-100k', '100k-300k', '300k-800k', '800k-2m', 'above-2m', 'not-sure'] as const;
export const legacyTimelines = ['asap', '1-3-months', '3-6-months', '6-plus-months', 'planning'] as const;

const legacyServiceMap: Record<(typeof legacyProjectTypes)[number], ContactServiceId> = {
  'business-system': 'business-systems', payroll: 'payroll', website: 'websites',
  'web-application': 'web-applications', 'mobile-application': 'mobile-applications',
  'hr-line-bot': 'hr-line-bot', 'document-management': 'document-management',
  'custom-software': 'custom-software', automation: 'automation', integration: 'custom-software',
  'data-analytics': 'custom-software', 'cloud-infrastructure': 'custom-software', consulting: 'consulting', other: 'consulting'
};

const legacyRequestSchema = z.object({
  name: trimmed(2, 120),
  company: optionalText(160),
  email: z.string().trim().email().max(180),
  phone: optionalPhone,
  projectType: z.enum(legacyProjectTypes),
  budget: z.enum(legacyBudgetRanges),
  timeline: z.enum(legacyTimelines),
  message: trimmed(10, 4000),
  website: z.string().max(200).optional()
}).transform((data) => ({
  contactType: 'quick' as const,
  serviceId: legacyServiceMap[data.projectType],
  contactName: data.name,
  companyName: data.company,
  email: data.email,
  phone: data.phone,
  lineId: '',
  notes: data.message,
  sourceContext: '',
  website: data.website,
  legacyBudget: data.budget,
  legacyTimeline: data.timeline
}));

export const contactRequestSchema = z.union([guidedRequestSchema, quickRequestSchema, legacyRequestSchema]);
export type ContactRequest = z.infer<typeof contactRequestSchema>;

export interface StoredLead extends Omit<ContactRequest, 'website'> {
  id: string;
  reference: string;
  receivedAt: string;
  source: string;
  userAgent?: string;
}
