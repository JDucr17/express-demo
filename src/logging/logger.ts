import pino from "pino";

import { config } from "../config/config";

export const logger = pino({
  level: config.logLevel,

  ...(config.isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
      },
    },
  }),
});
