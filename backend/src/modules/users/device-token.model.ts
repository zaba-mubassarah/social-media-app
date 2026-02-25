import { InferSchemaType, Schema, Types, model } from "mongoose";

const deviceTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    platform: { type: String, enum: ["ios", "android", "web"], required: true },
    provider: { type: String, enum: ["fcm", "expo", "apns"], default: "fcm", index: true },
    token: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

deviceTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

export type DeviceTokenDocument = InferSchemaType<typeof deviceTokenSchema>;
export const DeviceTokenModel = model("DeviceToken", deviceTokenSchema);
