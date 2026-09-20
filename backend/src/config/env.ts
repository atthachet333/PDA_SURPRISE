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

  /**
   * The public origin the site is served from, e.g. https://example.com.
   *
   * Used to build absolute URLs for canonical tags, robots.txt and sitemap.xml.
   * OWNER INPUT: the production hostname has not been chosen yet. Until it is,
   * this stays empty and the frontend emits relative URLs only, which are
   * correct but weaker for SEO. Nothing breaks while it is unset.
   */
  PUBLIC_ORIGIN: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value.replace(/\/$/, '') : '')),

  /**
   * Whether this process also serves the built frontend.
   *
   * The production topology is ONE origin: Fastify serves `frontend/dist` and
   * `/api` from the same port, so the browser never makes a cross-origin call,
   * CORS is not involved at all, and Cloudflare Tunnel has a single thing to
   * point at. In development this stays false and Vite serves the frontend on
   * 1368, proxying /api here.
   */
  SERVE_FRONTEND: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  /** Where the built frontend lives, relative to the backend working directory. */
  FRONTEND_DIST: z.string().default('../frontend/dist'),

  /**
   * How many proxy hops to trust for the client IP.
   *
   * `true` would trust ANY `X-Forwarded-For` a client sends, which lets anyone
   * forge an address and walk straight through the per-IP rate limit. Behind
   * Cloudflare Tunnel the only hop is the local `cloudflared` process, so 1 is
   * correct. Set to 0 to use the socket address directly (no proxy).
   */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(1),

  LEAD_STORE: z.enum(['file', 'memory']).default('file'),
  LEAD_STORE_PATH: z.string().default('./data/leads.jsonl'),
  CONTACT_RATE_MAX: z.coerce.number().int().positive().default(5),
  CONTACT_RATE_WINDOW: z.string().default('10 minutes'),
  /** Max accepted request body. A contact form needs kilobytes, not megabytes. */
  BODY_LIMIT_BYTES: z.coerce.number().int().positive().default(64 * 1024),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

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

/**
 * PRODUCTION PRECONDITIONS — fail fast, at boot, before serving anything.
 *
 * These are the settings that are harmless to get wrong in development and
 * actively dangerous to get wrong in production. A process that refuses to
 * start is far easier to diagnose than one that starts and quietly allows every
 * origin, or rate-limits the whole internet as a single client.
 */
if (isProduction) {
  const problems: string[] = [];

  // A cross-origin deployment must name its real origins. The single-origin
  // topology does not use CORS at all, so localhost defaults are only a problem
  // when the frontend is served from somewhere else.
  const onlyLocalhostOrigins = env.CORS_ORIGIN.every((origin) => /localhost|127\.0\.0\.1/.test(origin));
  if (!env.SERVE_FRONTEND && onlyLocalhostOrigins) {
    problems.push(
      'CORS_ORIGIN still only contains localhost. Set the real public origin(s), or set SERVE_FRONTEND=true to serve the frontend from this process on one origin.'
    );
  }

  if (env.CORS_ORIGIN.some((origin) => origin === '*')) {
    problems.push('CORS_ORIGIN must not be "*" in production.');
  }

  if (env.PUBLIC_ORIGIN && !env.PUBLIC_ORIGIN.startsWith('https://')) {
    problems.push('PUBLIC_ORIGIN must be https:// in production.');
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start in production with unsafe configuration:\n${problems
        .map((problem) => `  - ${problem}`)
        .join('\n')}`
    );
  }
}
