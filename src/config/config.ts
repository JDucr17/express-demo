import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
  port: Number.parseInt(process.env.PORT || "3005"),
  logLevel: process.env.LOG_LEVEL || "debug",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sac_mate",
};
