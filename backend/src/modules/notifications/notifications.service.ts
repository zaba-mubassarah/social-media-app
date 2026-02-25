import { Types } from "mongoose";
import { DeviceTokenModel } from "../users/device-token.model";
import { NotificationOutboxModel } from "./notification-outbox.model";
import { sendPush } from "./fcm";

type NotificationEventType = "post_liked" | "comment_created";

export const enqueueNotification = async (params: {
  recipientUserId: Types.ObjectId;
  eventType: NotificationEventType;
  payload: Record<string, unknown>;
}): Promise<void> => {
  await NotificationOutboxModel.create({
    recipientUserId: params.recipientUserId,
    eventType: params.eventType,
    payload: params.payload,
    status: "pending",
    nextAttemptAt: new Date()
  });
};

const eventTemplate = (
  eventType: NotificationEventType,
  payload: Record<string, unknown>
): { title: string; body: string; data: Record<string, string> } => {
  if (eventType === "post_liked") {
    const actorName = String(payload.actorName ?? "Someone");
    return {
      title: "Your post got a like",
      body: `${actorName} liked your post`,
      data: { type: "post_liked", postId: String(payload.postId ?? "") }
    };
  }

  const actorName = String(payload.actorName ?? "Someone");
  return {
    title: "New comment",
    body: `${actorName} commented on your post`,
    data: { type: "comment_created", postId: String(payload.postId ?? "") }
  };
};

export const processNotificationBatch = async (): Promise<number> => {
  const now = new Date();
  const jobs = await NotificationOutboxModel.find({
    status: "pending",
    nextAttemptAt: { $lte: now }
  })
    .sort({ createdAt: 1 })
    .limit(20);

  for (const job of jobs) {
    job.status = "processing";
    await job.save();

    try {
      const tokens = await DeviceTokenModel.find({
        userId: job.recipientUserId,
        isActive: true,
        provider: "fcm"
      }).select("token");

      const template = eventTemplate(job.eventType, job.payload as Record<string, unknown>);
      await Promise.all(
        tokens.map(async (t) => {
          await sendPush({
            token: t.token,
            title: template.title,
            body: template.body,
            data: template.data
          });
        })
      );

      job.status = "sent";
      job.lastError = null;
      await job.save();
    } catch (error) {
      const retries = job.retryCount + 1;
      job.retryCount = retries;
      job.status = retries >= 5 ? "failed" : "pending";
      job.nextAttemptAt = new Date(Date.now() + retries * 60_000);
      job.lastError = error instanceof Error ? error.message : "Unknown error";
      await job.save();
    }
  }

  return jobs.length;
};
