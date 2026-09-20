import Fastify, { type FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './config/env.js';
import { registerErrorHandling } from './plugins/errorHandler.js';
import { apiRoutes } from './routes/index.js';

/**
 * Paths that must never be cached by a browser or by Cloudflare, because a
 * stale copy means a visitor keeps running an old build after a deploy.
 */
const NO_STORE = new Set(['/index.html', '/', '/robots.txt', '/sitemap.xml', '/site.webmanifest']);

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      /*
       * Redaction applies in EVERY environment, not just development.
       *
       * It was previously configured only on the development branch, which is
       * precisely backwards: production is where the logs are retained,
       * shipped and read by other people. The contact form body is redacted
       * too — a lead's name, email, phone and free-text project description
       * have no business being duplicated into a log file when they are
       * already stored deliberately by the lead service.
       */
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["set-cookie"]',
          'req.body',
          'res.headers["set-cookie"]'
        ],
        remove: true
      }
    },

    /*
     * Trust a BOUNDED number of proxy hops rather than `true`.
     *
     * `trustProxy: true` tells Fastify to believe the left-most address in any
     * `X-Forwarded-For` header the client sends. Since the rate limiter keys on
     * `request.ip`, that let anyone rotate a header value and bypass the limit
     * entirely. In the production topology the only hop is the `cloudflared`
     * process on this machine, so one hop is the honest number.
     */
    trustProxy: (_address: string, hop: number) => hop < env.TRUST_PROXY_HOPS,

    bodyLimit: env.BODY_LIMIT_BYTES,

    /*
     * Correlates a client-visible error with the matching server log line. The
     * log label is left at Fastify's default `reqId`; the dedicated option for
     * renaming it is deprecated in Fastify 5 and removed in 6, and a second
     * name for the same value is not worth carrying a deprecation warning for.
     */
    requestIdHeader: 'x-request-id'
  });

  await app.register(import('@fastify/sensible'));

  await app.register(import('@fastify/helmet'), {
    /*
     * CSP is set per-response below rather than by helmet, because this process
     * serves two very different things: a JSON API that needs no policy, and an
     * HTML app that needs one permitting its own inline styles, Google Fonts,
     * blob workers and WebGL.
     */
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    /* The A&I experience uses WebGL and audio; COEP would break both. */
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  });

  /*
   * CORS IS SCOPED TO /api, NOT REGISTERED GLOBALLY.
   *
   * Vite emits its module scripts and stylesheet as `<... crossorigin>`, which
   * makes the browser send an `Origin` header even for SAME-ORIGIN requests.
   * With the plugin mounted globally, those requests were checked against the
   * allowlist, the site's own origin was not in it, and the callback rejected
   * them with an Error - so every asset came back 500 with a JSON body and the
   * app never mounted. curl never sends `Origin`, so it looked perfectly
   * healthy from the command line.
   *
   * Static files have no business going through a CORS check. Only the API
   * does, and only when something is calling it from another origin.
   */
  const allowedOrigins = new Set(env.CORS_ORIGIN);
  if (env.PUBLIC_ORIGIN) allowedOrigins.add(env.PUBLIC_ORIGIN);

  /* Echo the request id so a visitor can quote it and we can find the log line. */
  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  await app.register(
    async (api) => {
      await api.register(import('@fastify/cors'), {
        origin: (origin, callback) => {
          // No Origin header: a same-origin navigation, curl, or a server-side
          // caller. Nothing for CORS to decide.
          if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
          }
          /*
           * Deny by omitting the CORS headers, not by throwing.
           *
           * Throwing produced a 500 — a client-side condition reported as a
           * server fault, and logged as one, which buries real errors in noise.
           * Omitting the headers is how CORS is meant to work: the response is
           * produced, and the browser refuses to expose it to the calling page.
           *
           * CORS is a browser mechanism, never access control. Anything that is
           * not a browser ignores it entirely, which is why the API's real
           * protection is validation and rate limiting rather than this list.
           */
          callback(null, false);
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
      });

      await api.register(apiRoutes);
    },
    { prefix: '/api' }
  );

  /*
   * SINGLE-ORIGIN PRODUCTION TOPOLOGY.
   *
   * When enabled, this process also serves the built frontend, so the public
   * site and its API share one origin. That means no CORS in production, no
   * second public port, and one thing for Cloudflare Tunnel to point at.
   * Registered AFTER the API so `/api/*` always wins.
   */
  if (env.SERVE_FRONTEND) {
    const root = resolve(process.cwd(), env.FRONTEND_DIST);

    if (!existsSync(root)) {
      throw new Error(
        `SERVE_FRONTEND is true but no build was found at ${root}. Run "npm run build" first, or point FRONTEND_DIST at the built frontend.`
      );
    }

    await app.register(import('@fastify/static'), {
      root,
      /*
       * `cacheControl: false` hands the header to us entirely.
       *
       * With the plugin's own `maxAge` left on, it writes `Cache-Control` for
       * every file and the per-file values below never take effect — measured
       * `public, max-age=0` on a content-hashed asset that should have been
       * immutable for a year.
       *
       * Vite writes content-hashed filenames into /assets, so those are
       * immutable. Everything else — index.html above all — must revalidate, or
       * a visitor keeps the previous build's HTML, and therefore the previous
       * build's asset URLs, after a deploy.
       */
      cacheControl: false,
      /* v10 hands this a FastifyReply rather than a raw ServerResponse. */
      setHeaders(reply, path) {
        const url = path.split('\\').join('/');
        if (/\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(url)) {
          reply.header('Cache-Control', 'public, max-age=31536000, immutable');
          return;
        }
        if (/\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|mp3)$/i.test(url)) {
          /* Unversioned public assets: cached, but revalidated daily. */
          reply.header('Cache-Control', 'public, max-age=86400');
          return;
        }
        reply.header('Cache-Control', 'no-cache');
      }
    });

    /* Content policy for the HTML app only; the API needs none. */
    app.addHook('onSend', async (request, reply) => {
      const url = request.url.split('?')[0] ?? '';
      if (url.startsWith('/api/')) return;

      if (NO_STORE.has(url)) reply.header('Cache-Control', 'no-cache');

      reply.header(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          /* Vite injects a small inline module; Tailwind needs inline styles. */
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          /* WebGL textures and generated placeholders use blob: and data:. */
          "img-src 'self' data: blob:",
          "media-src 'self' blob:",
          /* Three.js can spin up workers from a blob URL. */
          "worker-src 'self' blob:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'"
        ].join('; ')
      );
    });
  }

  /*
   * Registered LAST: the not-found handler needs @fastify/static to have
   * decorated the reply with sendFile before it can serve the SPA shell, and
   * Fastify permits only one not-found handler for the root prefix.
   */
  registerErrorHandling(app, { spaFallback: env.SERVE_FRONTEND });

  return app;
}
