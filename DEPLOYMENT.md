# Deployment — PDA BLISS / PDA Surprise

**The deploy procedure lives in [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md).**
It is the only one; this page used to hold an older version and now only
points there, so the two can never disagree.

In one paragraph: a Windows Server host runs one Node.js process under PM2
(`pda-surprise`, `ecosystem.config.cjs`). Fastify serves the JSON API and the
built frontend from `127.0.0.1:1369`, and Cloudflare Tunnel is the only public
way in. Each deploy is a separate, fully built release folder checked by
`npm run release:check`. Rollback restarts the previous folder without
rebuilding.

The runbook covers requirements (Node 22+), every environment variable, the
server folder layout, the owner-supplied music file, PM2, Cloudflare, the
EP47 deploy phases, the smoke checklist, rollback, logs, common failures and
the launch blockers.
