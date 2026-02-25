import { processNotificationBatch } from "../modules/notifications/notifications.service";

let workerTimer: NodeJS.Timeout | null = null;

export const startNotificationWorker = (): void => {
  if (workerTimer) {
    return;
  }

  workerTimer = setInterval(() => {
    void processNotificationBatch();
  }, 5000);
};

export const stopNotificationWorker = (): void => {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
};
