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
      /*
       * The rate limiter sends this object as the response body DIRECTLY - it
       * does not pass through the shared error handler - so it has to carry the
       * standard envelope itself. It previously returned a bare
       * `{statusCode, code, error, message}`, which is the one endpoint in the
       * API whose failure shape the client could not read: `lib/api.ts` looks
       * for `error.message` and would have fallen back to a generic string
       * instead of telling the visitor to wait.
       *
       * `statusCode` stays at the top level because the plugin reads it.
       */
      errorResponseBuilder: (request) => ({
        statusCode: 429,
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many enquiries from this address. Please try again shortly.'
        },
        requestId: request.id
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
          },
          requestId: request.id
        });
      }

      /*
       * Honeypot filled => accept and discard.
       *
       * The response is deliberately indistinguishable from a real success, so
       * a bot gets no signal that it was caught and no reason to try a
       * different shape. Nothing is persisted and nothing is logged beyond the
       * counter below.
       */
      if (parsed.data.website && parsed.data.website.trim().length > 0) {
        request.log.info({ reason: 'honeypot' }, 'contact submission discarded');
        return reply.status(202).send({ ok: true, data: { reference: 'PDA-QUEUED', receivedAt: new Date().toISOString() } });
      }

      /* Lowercase the email so the same address is not stored three ways. */
      const lead = { ...parsed.data, email: parsed.data.email?.toLowerCase() || '' };

      const result = await createLead(lead, {
        source: 'website-contact-form',
        userAgent: request.headers['user-agent']
      });

      /*
       * The lead's own words are NOT logged - name, email, phone and message
       * are already stored deliberately by the lead service, and duplicating
       * them into the log stream would scatter personal data into a second
       * place with a different retention story. The reference is enough to
       * find the record.
       */
      request.log.info(
        { reference: result.reference, contactType: lead.contactType, serviceId: lead.serviceId },
        'new lead captured'
      );

      return reply.status(201).send({ ok: true, data: result });
    });
  });
};
