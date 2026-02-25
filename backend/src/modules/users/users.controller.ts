import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../shared/utils/async-handler";
import { upsertDeviceToken } from "./users.service";

export const upsertDeviceTokenController = asyncHandler(async (req: Request, res: Response) => {
  await upsertDeviceToken({
    userId: req.user!.id,
    token: req.body.token,
    platform: req.body.platform,
    provider: req.body.provider ?? "fcm"
  });

  res.status(StatusCodes.OK).json({ message: "Device token registered" });
});
