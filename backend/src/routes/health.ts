import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';

const startedAt = Date.now();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'pdabliss-api',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  }));
};
