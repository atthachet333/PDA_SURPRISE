import type { FastifyError, FastifyInstance } from 'fastify';
import { isProduction } from '../config/env.js';

interface Options {
  /**
   * When true, an unknown NON-API GET returns the SPA shell instead of a JSON
   * 404, so a deep link or a refresh on /solutions or /us is routed by the
   * client. Fastify allows only one not-found handler per prefix, so the SPA
   * fallback has to live here rather than being registered separately.
   */
  spaFallback: boolean;
}

export function registerErrorHandling(app: FastifyInstance, { spaFallback }: Options): void {
  app.setNotFoundHandler(async (request, reply) => {
    const isApi = request.url.startsWith('/api/');

    if (spaFallback && !isApi) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return reply.status(405).send({
          ok: false,
          error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported for page routes.' }
        });
      }
      reply.header('Cache-Control', 'no-cache');
      return reply.type('text/html; charset=utf-8').sendFile('index.html');
    }

    return reply.status(404).send({
      ok: false,
      error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} does not exist.` }
    });
  });

  setStandardErrorHandler(app);
}

/** Register inside an encapsulated API scope so parser errors use our envelope. */
export function setStandardErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(async (rawError, request, reply) => {
    const error = rawError as FastifyError;
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;

    if (status >= 500) {
      request.log.error({ err: error }, 'unhandled request error');
    }

    return reply.status(status).send({
      ok: false,
      error: {
        code: status === 429 ? 'RATE_LIMITED' : error.code ?? (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
        /*
         * A 5xx in production says nothing about why. `error.message` from a
         * crash routinely carries a filesystem path, a dependency's internals
         * or a fragment of a query — none of which a stranger should read. The
         * real message is in the server log, findable by the request id that
         * every response carries.
         */
        message:
          status === 429
            ? 'Too many enquiries from this address. Please try again shortly.'
            : status >= 500 && isProduction
            ? 'Something went wrong on our side. Please try again.'
            : error.message
      },
      /* Lets a visitor quote one value that finds the exact log line. */
      requestId: request.id
    });
  });
}
