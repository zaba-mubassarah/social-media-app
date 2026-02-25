import { app } from "./app";
import { env } from "./config/env";
import { startNotificationWorker, stopNotificationWorker } from "./jobs/notification.worker";
import { connectDatabase, disconnectDatabase } from "./shared/db/mongoose";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`API running on http://${env.HOST}:${env.PORT}`);
  });

  startNotificationWorker();

  const shutdown = async () => {
    stopNotificationWorker();
    await disconnectDatabase();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
};

void startServer();
