import type { FastifyPluginAsync } from 'fastify';
import { adminRoutes } from './admin.js';
import { authRoutes } from './auth.js';
import { clientRoutes } from './client.js';
import { configRoutes } from './config.js';
import { contactRoutes } from './contact.js';
import { healthRoutes } from './health.js';

export const apiRoutes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(configRoutes);
  await app.register(contactRoutes);
  await app.register(authRoutes);
  await app.register(clientRoutes);
  await app.register(adminRoutes);
};
