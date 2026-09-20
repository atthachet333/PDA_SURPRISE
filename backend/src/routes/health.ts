import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';

const startedAt = Date.now();

/**
 * Liveness only, and deliberately cheap.
 *
 * This is what PM2 and Cloudflare poll, so it must not touch the filesystem,
 * the lead store or anything that could make a healthy process look unhealthy.
 * It reports nothing a stranger could use: no paths, no origins, no versions of
 * dependencies, no configuration values.
 *
 * There is no /api/ready: this service has no external dependency whose
 * readiness could differ from its liveness. Adding one would mean inventing a
 * check that always returns true.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'pdabliss-api',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  }));
};
