import { Server } from 'http';
import { logger } from '../logging/logger.js';
import { closeDb } from '../db/config.js';

const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || '10000', 10) || 10000;

function forceCloseConnections(server: Server) {
  server.closeIdleConnections();
  server.closeAllConnections();
}
//Promise wrapper for server.close()
function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
//Main shutdown logic
async function performShutdown(server: Server, signal: string, exitCode: number) {
  logger.info({ signal }, 'Starting graceful shutdown');

  //Force exit timer
  const timer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    forceCloseConnections(server);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
  timer.unref();

  try {
    await closeServer(server);
    logger.info('HTTP server closed');

    await closeDb();

    clearTimeout(timer);

    //Flush logs here in the future if we write buffer to separate file.

    logger.info('Graceful shutdown complete');
    process.exit(exitCode);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}
//
export function onShutdown(server: Server) {
  let shuttingDown = false;

  const handleShutdown = (signal: string, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    void performShutdown(server, signal, exitCode);
  };

  process.once('SIGTERM', () => handleShutdown('SIGTERM'));
  process.once('SIGINT', () => handleShutdown('SIGINT'));

  process.once('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    handleShutdown('UNCAUGHT_EXCEPTION', 1);
  });
  // Handle unhandled promise rejections (async errors outside Express)
  process.once('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    handleShutdown('UNHANDLED_REJECTION', 1);
  });
}
