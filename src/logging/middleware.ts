import type { IncomingMessage } from 'http';
import { logger } from './logger.js';
import pinoHttp from 'pino-http';
export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req: IncomingMessage) => req.url === '/health',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ...(req.method === 'POST' && { contentLength: req.headers['content-length'] }),
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'user.email',
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
});
