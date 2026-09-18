import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const csv = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(1369),
  HOST: z.string().min(1).default('0.0.0.0'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:1368,http://127.0.0.1:1368')
    .transform(csv),
  LEAD_STORE: z.enum(['file', 'memory']).default('file'),
  LEAD_STORE_PATH: z.string().default('./data/leads.jsonl'),
  CONTACT_RATE_MAX: z.coerce.number().int().positive().default(5),
  CONTACT_RATE_WINDOW: z.string().default('10 minutes'),
  /**
   * Contact details served at /api/config/public. The CANONICAL source is
   * `frontend/src/data/company.ts` — these defaults must mirror it, never
   * diverge from it.
   */
  COMPANY_EMAIL: z.string().email().default('pdablissoffice@gmail.com'),
  COMPANY_PHONE: z.string().default('0638693614'),
  COMPANY_LOCATION: z.string().default('กรุงเทพมหานคร ประเทศไทย')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
export const isProduction = env.NODE_ENV === 'production';
