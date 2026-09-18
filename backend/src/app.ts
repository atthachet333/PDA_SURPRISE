import Fastify, { type FastifyInstance } from 'fastify';
import { env, isProduction } from './config/env.js';
import { registerErrorHandling } from './plugins/errorHandler.js';
import { apiRoutes } from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isProduction
      ? { level: 'info' }
      : {
          level: 'info',
          transport: undefined,
          redact: ['req.headers.authorization', 'req.headers.cookie']
        },
    trustProxy: true,
    bodyLimit: 256 * 1024
  });

  await app.register(import('@fastify/sensible'));
  await app.register(import('@fastify/helmet'), {
    // The API serves JSON only; CSP is enforced by the frontend host.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
  await app.register(import('@fastify/cors'), {
    origin: (origin, callback) => {
      if (!origin || env.CORS_ORIGIN.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed'), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  registerErrorHandling(app);

  await app.register(apiRoutes, { prefix: '/api' });

  return app;
}
