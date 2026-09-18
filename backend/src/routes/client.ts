import type { FastifyPluginAsync } from 'fastify';

/** Reserved namespace for authenticated client workspace data. */
export const clientRoutes: FastifyPluginAsync = async (app) => {
  app.all('/client/*', async (_request, reply) =>
    reply.status(501).send({
      ok: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Client workspace API is not enabled yet.' }
    })
  );
};
