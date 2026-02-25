import { Types } from "mongoose";
import { DeviceTokenModel } from "./device-token.model";

export const upsertDeviceToken = async (params: {
  userId: Types.ObjectId;
  token: string;
  platform: "ios" | "android" | "web";
  provider?: "fcm" | "expo" | "apns";
}): Promise<void> => {
  await DeviceTokenModel.updateOne(
    { userId: params.userId, token: params.token },
    { $set: { isActive: true, platform: params.platform, provider: params.provider ?? "fcm" } },
    { upsert: true }
  );
};

export const deactivateDeviceTokens = async (userId: Types.ObjectId): Promise<void> => {
  await DeviceTokenModel.updateMany({ userId }, { $set: { isActive: false } });
};
