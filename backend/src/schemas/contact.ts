import { z } from 'zod';

/**
 * Mirrors the service catalogue in `frontend/src/data/services.ts`. The seven
 * primary services come first. Existing values are never removed, so leads
 * already stored stay valid.
 */
export const projectTypes = [
  'business-system',
  'payroll',
  'website',
  'web-application',
  'mobile-application',
  'hr-line-bot',
  'document-management',
  'custom-software',
  'automation',
  'integration',
  'data-analytics',
  'cloud-infrastructure',
  'consulting',
  'other'
] as const;

export const budgetRanges = [
  'under-100k',
  '100k-300k',
  '300k-800k',
  '800k-2m',
  'above-2m',
  'not-sure'
] as const;

export const timelines = ['asap', '1-3-months', '3-6-months', '6-plus-months', 'planning'] as const;

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const contactRequestSchema = z.object({
  name: trimmed(2, 120),
  company: trimmed(0, 160).optional().or(z.literal('')),
  email: z.string().trim().email().max(180),
  phone: trimmed(0, 40).optional().or(z.literal('')),
  projectType: z.enum(projectTypes),
  budget: z.enum(budgetRanges),
  timeline: z.enum(timelines),
  message: trimmed(10, 4000),
  /*
   * Honeypot: real users never fill this, bots that autofill every input do.
   *
   * It accepts ANY string on purpose. It was previously `.max(0)`, which made a
   * filled honeypot fail validation with a 400 naming the `website` field -
   * telling the bot exactly which input to leave alone next time, and making
   * the silent-accept branch in the route unreachable. Accepting it here lets
   * the route swallow the submission quietly instead.
   */
  website: z.string().max(200).optional()
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;

export interface StoredLead extends Omit<ContactRequest, 'website'> {
  id: string;
  reference: string;
  receivedAt: string;
  source: string;
  userAgent?: string;
}
