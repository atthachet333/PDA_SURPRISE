import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';
import { contactRequestSchema } from '../schemas/contact.js';
import { createLead } from '../services/leadService.js';

export const contactRoutes: FastifyPluginAsync = async (app) => {
  await app.register(async (scoped) => {
    await scoped.register(import('@fastify/rate-limit'), {
      max: env.CONTACT_RATE_MAX,
      timeWindow: env.CONTACT_RATE_WINDOW,
      keyGenerator: (request) => request.ip,
      // Returned to the shared error handler, which wraps it in the standard
      // envelope. statusCode must be present or it is treated as a crash.
      errorResponseBuilder: () => ({
        statusCode: 429,
        code: 'RATE_LIMITED',
        error: 'Too Many Requests',
        message: 'Too many enquiries from this address. Please try again shortly.'
      })
    });

    scoped.post('/contact', async (request, reply) => {
      const parsed = contactRequestSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Some fields need attention.',
            fields: parsed.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message
            }))
          }
        });
      }

      // Honeypot filled => silently accept without persisting.
      if (parsed.data.website) {
        return reply.status(202).send({ ok: true, data: { reference: 'PDA-QUEUED', receivedAt: new Date().toISOString() } });
      }

      const result = await createLead(parsed.data, {
        source: 'website-contact-form',
        userAgent: request.headers['user-agent']
      });

      request.log.info({ reference: result.reference, projectType: parsed.data.projectType }, 'new lead captured');

      return reply.status(201).send({ ok: true, data: result });
    });
  });
};
