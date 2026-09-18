const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: ApiFieldError[];

  constructor(message: string, options: { code?: string; status?: number; fields?: ApiFieldError[] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code ?? 'UNKNOWN';
    this.status = options.status ?? 0;
    this.fields = options.fields ?? [];
  }
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; fields?: ApiFieldError[] };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init
    });
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', {
      code: 'NETWORK_ERROR'
    });
  }

  const text = await response.text();
  let payload: unknown = undefined;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError('The server returned an unexpected response.', {
        code: 'BAD_RESPONSE',
        status: response.status
      });
    }
  }

  const envelope = payload as ApiEnvelope<T> | undefined;

  if (!response.ok || envelope?.ok === false) {
    throw new ApiError(envelope?.error?.message ?? `Request failed (${response.status}).`, {
      code: envelope?.error?.code,
      status: response.status,
      fields: envelope?.error?.fields
    });
  }

  return (envelope && 'data' in envelope ? (envelope.data as T) : (payload as T));
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface PublicConfig {
  company: { name: string; shortName: string; email: string; phone: string; location: string };
  features: Record<string, boolean>;
  forms: { projectTypes: string[]; budgetRanges: string[]; timelines: string[] };
}

export interface ContactPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  website?: string;
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  publicConfig: () => request<PublicConfig>('/config/public'),
  submitContact: (payload: ContactPayload) =>
    request<{ reference: string; receivedAt: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
