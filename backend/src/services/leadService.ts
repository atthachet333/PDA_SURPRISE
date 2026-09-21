import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';
import { createId, createReference } from '../lib/ids.js';
import type { ContactRequest, StoredLead } from '../schemas/contact.js';

/**
 * Lead persistence lives behind this interface so the storage target can move to
 * PostgreSQL (or a CRM) without touching the route layer.
 */
export interface LeadRepository {
  save(lead: StoredLead): Promise<void>;
  list(limit?: number): Promise<StoredLead[]>;
}

class MemoryLeadRepository implements LeadRepository {
  private readonly leads: StoredLead[] = [];

  async save(lead: StoredLead): Promise<void> {
    this.leads.unshift(lead);
    if (this.leads.length > 500) this.leads.length = 500;
  }

  async list(limit = 50): Promise<StoredLead[]> {
    return this.leads.slice(0, limit);
  }
}

class FileLeadRepository implements LeadRepository {
  private readonly file: string;
  private readonly mirror = new MemoryLeadRepository();

  constructor(filePath: string) {
    this.file = resolve(process.cwd(), filePath);
  }

  async save(lead: StoredLead): Promise<void> {
    await mkdir(dirname(this.file), { recursive: true });
    await appendFile(this.file, `${JSON.stringify(lead)}\n`, 'utf8');
    await this.mirror.save(lead);
  }

  async list(limit = 50): Promise<StoredLead[]> {
    return this.mirror.list(limit);
  }
}

const repository: LeadRepository =
  env.LEAD_STORE === 'file' ? new FileLeadRepository(env.LEAD_STORE_PATH) : new MemoryLeadRepository();

export interface CreateLeadContext {
  source: string;
  userAgent?: string;
}

export async function createLead(
  input: ContactRequest,
  context: CreateLeadContext
): Promise<{ reference: string; receivedAt: string }> {
  const { website: _honeypot, ...payload } = input;
  const lead: StoredLead = {
    ...payload,
    companyName: payload.companyName || undefined,
    email: payload.email || undefined,
    phone: payload.phone || undefined,
    lineId: payload.lineId || undefined,
    sourceContext: payload.sourceContext || undefined,
    id: createId(),
    reference: createReference(),
    receivedAt: new Date().toISOString(),
    source: context.source,
    userAgent: context.userAgent
  };

  await repository.save(lead);

  // Notification fan-out (email / LINE / CRM) plugs in here. The trusted,
  // injection-safe formatter lives in contactNotification.ts.
  return { reference: lead.reference, receivedAt: lead.receivedAt };
}

export const leadRepository = repository;
