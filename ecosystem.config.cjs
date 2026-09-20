/**
 * PM2 process definition for the PDA BLISS production server (Windows).
 *
 * ONE PROCESS, ON PURPOSE.
 *
 * The backend serves both the JSON API and the built frontend from a single
 * port, so there is nothing to run for the frontend. A second PM2 entry running
 * `vite preview` would be a development server supervising a production site —
 * slower, unsupported for this use, and a second port to expose for no gain.
 *
 * NO SECRETS HERE. This file is committed. Real configuration lives in
 * `backend/.env` on the server, which is gitignored and never leaves the
 * machine. Only non-sensitive process settings belong in this file.
 *
 * Usage (from the repository root, on the server):
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *
 * `pm2 save` records the process list so the machine's existing PM2 startup
 * mechanism restores it after a reboot. This file deliberately does not touch
 * that global configuration.
 */
module.exports = {
  apps: [
    {
      name: 'pda-surprise',

      // Run from the backend workspace so `FRONTEND_DIST=../frontend/dist` and
      // `LEAD_STORE_PATH=./data/leads.jsonl` resolve the way .env expects.
      cwd: './backend',
      script: './dist/server.js',

      // A single Node process. The workload is I/O-bound and the lead store is
      // an append-only file, so cluster mode would add write contention for no
      // throughput benefit at this scale.
      exec_mode: 'fork',
      instances: 1,

      // Everything else (PORT, CORS_ORIGIN, SERVE_FRONTEND, PUBLIC_ORIGIN, …)
      // comes from backend/.env, which dotenv loads at startup.
      env: {
        NODE_ENV: 'production'
      },

      // --- restart policy ----------------------------------------------------
      autorestart: true,
      // Give up if it crashes 10 times in a row — a boot-time config error
      // should surface as a stopped process, not an endless restart loop that
      // buries the reason in log noise.
      max_restarts: 10,
      min_uptime: '20s',
      restart_delay: 2000,
      // Restart if the process leaks past this; normal usage sits far below it.
      max_memory_restart: '512M',

      // --- shutdown ----------------------------------------------------------
      // The server closes Fastify on SIGINT/SIGTERM and force-exits after 10s,
      // so give it a little more than that before PM2 kills it outright.
      kill_timeout: 12000,
      listen_timeout: 10000,
      wait_ready: false,

      // --- logs --------------------------------------------------------------
      time: true,
      merge_logs: true,
      out_file: './logs/pda-surprise-out.log',
      error_file: './logs/pda-surprise-error.log',

      // Never watch files in production.
      watch: false
    }
  ]
};
