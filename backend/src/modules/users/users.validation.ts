import { z } from "zod";

export const upsertDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    platform: z.enum(["ios", "android", "web"]),
    provider: z.enum(["fcm", "expo", "apns"]).optional().default("fcm")
  }),
  params: z.object({}),
  query: z.object({})
});
