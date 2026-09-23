export type ContactServiceId =
  | 'business-systems'
  | 'payroll'
  | 'websites'
  | 'web-applications'
  | 'mobile-applications'
  | 'document-management'
  | 'file-management'
  | 'hr-line-bot'
  | 'automation'
  | 'custom-software'
  | 'consulting';

const contactServiceIds = new Set<ContactServiceId>([
  'business-systems', 'payroll', 'websites', 'web-applications', 'mobile-applications',
  'document-management', 'file-management', 'hr-line-bot', 'automation', 'custom-software', 'consulting'
]);
const systemIds = new Set(['erp', 'payroll', 'hr-line-bot', 'documents', 'nas-files', 'webapp', 'mobile-app', 'website']);
const caseSlugs = new Set([
  'erp-inventory-costing', 'payroll-monthly-control', 'hr-line-leave-approval', 'document-file-workflow',
  'nas-file-storage', 'corporate-website-system', 's2-accounting-website'
]);

export function isContactServiceId(value: string | null | undefined): value is ContactServiceId {
  return Boolean(value && contactServiceIds.has(value as ContactServiceId));
}

export const systemToContactService: Readonly<Record<string, ContactServiceId>> = {
  erp: 'business-systems', payroll: 'payroll', 'hr-line-bot': 'hr-line-bot', documents: 'document-management',
  'nas-files': 'file-management', webapp: 'web-applications', 'mobile-app': 'mobile-applications', website: 'websites'
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

export function isValidSourceContext(source: string | null | undefined): boolean {
  if (!source) return false;
  if (source === 'home') return true;
  const [kind, id, extra] = source.split(':');
  if (extra !== undefined || !id) return false;
  if (kind === 'solutions') return systemIds.has(id);
  if (kind === 'case') return caseSlugs.has(id);
  if (kind === 'service') return isContactServiceId(id);
  return false;
}

export function resolveContactPrefill(search: string): { serviceId?: ContactServiceId; sourceContext?: string } {
  const params = new URLSearchParams(search);
  const service = params.get('service');
  const source = params.get('source');
  return {
    serviceId: isContactServiceId(service) ? service : undefined,
    sourceContext: isValidSourceContext(source) ? source ?? undefined : undefined
  };
}

export function contactHref(serviceId: ContactServiceId, sourceContext: string): string {
  const params = new URLSearchParams({ service: serviceId });
  if (isValidSourceContext(sourceContext)) params.set('source', sourceContext);
  return `/contact?${params.toString()}`;
}

export function contactServiceFromRoute(route: string): ContactServiceId | undefined {
  const id = route.split('#')[1];
  return isContactServiceId(id) ? id : undefined;
}
