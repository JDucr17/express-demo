import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth.js';
import { config } from './config/index.js';
import { onShutdown } from './server/shutdown.js';
import { logger } from './logging/logger.js';
import { requestLogger } from './logging/middleware.js';
import { db } from './db/config.js';
import { sql } from 'drizzle-orm';
import { errorHandler } from './middleware/error-handler.js';
import cursoRouter from './modules/curso/curso-routes.js';
import departamentoRouter from './modules/departamento/departamento-router.js';

const app = express();
const port = config.port;

// Health check
app.get('/health/livez', (req, res) => res.json({ status: 'ok' }));
app.get('/health/readyz', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});

app.use(
  cors({
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

app.use(requestLogger);


//Better auth handler
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use('/api', cursoRouter);
app.use('/api',departamentoRouter);
//Global Error Handler
app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`Server started on port ${config.port}`);
});

onShutdown(server);
