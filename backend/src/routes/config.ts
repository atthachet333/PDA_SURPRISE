import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';
import { budgetRanges, contactServiceIds, projectTypes, timelines } from '../schemas/contact.js';

/**
 * Non-secret configuration the frontend is allowed to read at runtime.
 * Never place credentials or internal endpoints here.
 */
export const configRoutes: FastifyPluginAsync = async (app) => {
  app.get('/config/public', async () => ({
    company: {
      name: 'PDA BLISS COMPANY LIMITED',
      shortName: 'PDA BLISS',
      email: env.COMPANY_EMAIL,
      phone: env.COMPANY_PHONE,
      location: env.COMPANY_LOCATION
    },
    features: {
      contactForm: true,
      clientPortal: false,
      privateWorkspace: true
    },
    forms: {
      projectTypes,
      contactServiceIds,
      budgetRanges,
      timelines
    }
  }));
};
