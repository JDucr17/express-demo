import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import { sql } from "drizzle-orm";

import departamentoRouter from "./modules/departamento/routes";

import { config } from "@/config/config";
import { requestLogger } from "@/logging/middleware";
import { db } from "@/db/config";
import { errorMiddleware } from "@/middleware/error-middleware";

export const app = express();

// Health checks
app.get("/health/livez", (req, res) => res.json({ status: "ok" }));
app.get("/health/readyz", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(requestLogger);

// API Version 1
const v1Router = Router();
v1Router.use(departamentoRouter);
app.use("/api/v1", v1Router);

// Future versions can be added here

// Global Error Handler
app.use(errorMiddleware);
