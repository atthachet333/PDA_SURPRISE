import type { FastifyPluginAsync } from 'fastify';

/**
 * Placeholder namespace for the client portal authentication surface.
 * Routes are intentionally not implemented yet — the mount point exists so
 * sessions/JWT/refresh handling can be added without restructuring the app.
 */
export const authRoutes: FastifyPluginAsync = async (app) => {
  app.all('/auth/*', async (_request, reply) =>
    reply.status(501).send({
      ok: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Client authentication is not enabled yet.' }
    })
  );
};
