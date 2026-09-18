import type { FastifyPluginAsync } from 'fastify';

/** Reserved namespace for the internal admin dashboard (lead + portfolio CMS). */
export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.all('/admin/*', async (_request, reply) =>
    reply.status(501).send({
      ok: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Admin API is not enabled yet.' }
    })
  );
};
