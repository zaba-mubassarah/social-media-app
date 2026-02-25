import { InferSchemaType, Schema, Types, model } from "mongoose";

const notificationOutboxSchema = new Schema(
  {
    recipientUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    eventType: { type: String, enum: ["post_liked", "comment_created"], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["pending", "processing", "sent", "failed"], default: "pending" },
    retryCount: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lastError: { type: String, default: null }
  },
  { timestamps: true }
);

notificationOutboxSchema.index({ status: 1, nextAttemptAt: 1 });

export type NotificationOutboxDocument = InferSchemaType<typeof notificationOutboxSchema>;
export const NotificationOutboxModel = model("NotificationOutbox", notificationOutboxSchema);
