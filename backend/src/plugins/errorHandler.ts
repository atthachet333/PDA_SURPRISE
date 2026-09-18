import type { FastifyError, FastifyInstance } from 'fastify';
import { isProduction } from '../config/env.js';

export function registerErrorHandling(app: FastifyInstance): void {
  app.setNotFoundHandler(async (request, reply) =>
    reply.status(404).send({
      ok: false,
      error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} does not exist.` }
    })
  );

  app.setErrorHandler(async (rawError, request, reply) => {
    const error = rawError as FastifyError;
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;

    if (status >= 500) {
      request.log.error({ err: error }, 'unhandled request error');
    }

    return reply.status(status).send({
      ok: false,
      error: {
        code: error.code ?? (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
        message:
          status >= 500 && isProduction
            ? 'Something went wrong on our side. Please try again.'
            : error.message
      }
    });
  });
}
