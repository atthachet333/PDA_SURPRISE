import { buildApp } from './app.js';
import { env } from './config/env.js';

async function main(): Promise<void> {
  const app = await buildApp();

  let shuttingDown = false;

  /**
   * Graceful shutdown, with a hard deadline.
   *
   * PM2 sends SIGINT and then kills the process after a grace period. Closing
   * Fastify lets in-flight requests finish, but a stuck connection must not be
   * able to hold the process open past the restart — otherwise a deploy leaves
   * the old process holding the port and the new one fails to bind.
   */
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, 'shutting down');

    const deadline = setTimeout(() => {
      app.log.error('shutdown timed out, forcing exit');
      process.exit(1);
    }, 10_000);
    deadline.unref();

    try {
      await app.close();
      clearTimeout(deadline);
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  /*
   * A process that has hit an uncaught exception is in an unknown state, so it
   * is logged and then handed back to the supervisor for a clean restart rather
   * than being kept alive. Swallowing these is how a server ends up serving
   * corrupted responses for hours.
   */
  process.on('uncaughtException', (error) => {
    app.log.fatal({ err: error }, 'uncaught exception, restarting');
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    app.log.fatal({ err: reason }, 'unhandled rejection, restarting');
    void shutdown('unhandledRejection');
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(
      {
        port: env.PORT,
        servingFrontend: env.SERVE_FRONTEND,
        environment: env.NODE_ENV
      },
      'PDA BLISS server ready'
    );
  } catch (error) {
    app.log.error(error, 'failed to start server');
    process.exit(1);
  }
}

void main();
