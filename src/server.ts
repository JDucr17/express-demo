import { app } from "@/app";
import { config } from "@/config/config";
import { logger } from "@/logging/logger";
import { onShutdown } from "@/server/shutdown";

const server = app.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`);
});

onShutdown(server);
