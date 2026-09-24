/**
 * CONTACT HANDOFF — how a visitor's context reaches /contact.
 *
 *   /contact?service=<contact service id>&source=<kind>:<id>
 *
 * Two contracts meet here:
 *
 *   service   the ten intents the contact API accepts. They MUST mirror
 *             `contactServiceIds` in backend/src/contact/contactConfig.ts — a
 *             value outside that list is rejected on submit (tests enforce it).
 *             Canonical EP38 services map onto them; `file-management` shares
 *             the "Document / File System" intent.
 *   source    where the visitor came from. Every public page context is
 *             accepted for display ("from: Payroll"), but only the forms the
 *             API validates are ever sent — see `payloadSourceContext`.
 *
 * Only public identifiers (service ids, system ids, case-study slugs) travel in
 * the URL. Anything else is dropped rather than echoed back.
 */

export const contactServiceIds = [
  'business-systems',
  'payroll',
  'websites',
  'web-applications',
  'mobile-applications',
  'document-management',
  'hr-line-bot',
  'automation',
  'custom-software',
  'consulting'
] as const;

export type ContactServiceId = (typeof contactServiceIds)[number];

const contactServiceSet = new Set<string>(contactServiceIds);

/** Canonical service ids that share another service's contact intent. */
const serviceAliases: Readonly<Record<string, ContactServiceId>> = {
  'file-management': 'document-management'
};

/** Canonical EP38 service ids that may appear in a `service:` source. */
const coreServiceIds = new Set([
  'business-systems', 'payroll', 'hr-line-bot', 'document-management',
  'file-management', 'web-applications', 'mobile-applications', 'websites'
]);

const systemIds = new Set(['erp', 'payroll', 'hr-line-bot', 'documents', 'nas-files', 'webapp', 'mobile-app', 'website']);
const caseSlugs = new Set([
  'erp-inventory-costing', 'payroll-monthly-control', 'hr-line-leave-approval', 'document-file-workflow',
  'nas-file-storage', 'corporate-website-system', 's2-accounting-website'
]);

/**
 * Case studies the contact API accepts as a source. Mirrors the `case:` pattern
 * in backend/src/schemas/contact.ts. The other public cases still prefill the
 * form and show "from …" — they are simply not sent.
 */
const payloadCaseSlugs = new Set([
  'erp-inventory-costing', 'payroll-monthly-control', 'hr-line-leave-approval', 'document-file-workflow',
  'corporate-website-system'
]);

export function isContactServiceId(value: string | null | undefined): value is ContactServiceId {
  return Boolean(value && contactServiceSet.has(value));
}

/** A canonical service id (or a contact id) → the contact intent it opens. */
export function toContactServiceId(value: string | null | undefined): ContactServiceId | undefined {
  if (!value) return undefined;
  return isContactServiceId(value) ? value : serviceAliases[value];
}

export const systemToContactService: Readonly<Record<string, ContactServiceId>> = {
  erp: 'business-systems', payroll: 'payroll', 'hr-line-bot': 'hr-line-bot', documents: 'document-management',
  'nas-files': 'document-management', webapp: 'web-applications', 'mobile-app': 'mobile-applications', website: 'websites'
};

export const solutionToContactService: Readonly<Record<string, ContactServiceId>> = {
  erp: 'business-systems', 'hr-payroll': 'payroll', crm: 'custom-software', 'sales-inventory': 'business-systems',
  'document-workflow': 'document-management', approval: 'document-management', tracking: 'web-applications',
  booking: 'web-applications', 'internal-tools': 'custom-software', automation: 'automation',
  analytics: 'custom-software', 'customer-portal': 'web-applications'
};

export const solutionToSourceSystem: Readonly<Record<string, string>> = {
  erp: 'erp', 'hr-payroll': 'payroll', 'sales-inventory': 'erp', 'document-workflow': 'documents', approval: 'documents',
  crm: 'webapp', tracking: 'webapp', booking: 'webapp', 'internal-tools': 'webapp', automation: 'webapp',
  analytics: 'webapp', 'customer-portal': 'webapp'
};

/** A source the form may show. Controlled values only; anything else is dropped. */
export function isValidSourceContext(source: string | null | undefined): boolean {
  if (!source) return false;
  if (source === 'home') return true;
  const [kind, id, extra] = source.split(':');
  if (extra !== undefined || !id) return false;
  if (kind === 'solutions') return systemIds.has(id);
  if (kind === 'case') return caseSlugs.has(id);
  if (kind === 'service') return isContactServiceId(id) || coreServiceIds.has(id);
  return false;
}

/** The source as the contact API accepts it, or undefined when it would be rejected. */
export function payloadSourceContext(source: string | null | undefined): string | undefined {
  if (!source || !isValidSourceContext(source)) return undefined;
  if (source === 'home') return source;
  const [kind, id] = source.split(':') as [string, string];
  if (kind === 'solutions') return source;
  if (kind === 'case') return payloadCaseSlugs.has(id) ? source : undefined;
  return isContactServiceId(id) ? source : undefined;
}

export function resolveContactPrefill(search: string): { serviceId?: ContactServiceId; sourceContext?: string } {
  const params = new URLSearchParams(search);
  const source = params.get('source');
  return {
    serviceId: toContactServiceId(params.get('service')),
    sourceContext: isValidSourceContext(source) ? source ?? undefined : undefined
  };
}

/**
 * The link to /contact for a service, system or case. Unknown ids fall back to
 * the plain contact page rather than a prefill the form cannot honour.
 */
export function contactHref(serviceId: string | null | undefined, sourceContext?: string): string {
  const contactId = toContactServiceId(serviceId);
  if (!contactId) return '/contact';
  const params = new URLSearchParams({ service: contactId });
  if (sourceContext && isValidSourceContext(sourceContext)) params.set('source', sourceContext);
  return `/contact?${params.toString()}`;
}

/** `/services#payroll` → the contact intent for that service. */
export function contactServiceFromRoute(route: string): ContactServiceId | undefined {
  return toContactServiceId(route.split('#')[1]);
}
