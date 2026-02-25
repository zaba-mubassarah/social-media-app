import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { upsertDeviceTokenController } from "./users.controller";
import { upsertDeviceTokenSchema } from "./users.validation";

const router = Router();

router.post(
  "/me/device-tokens",
  requireAuth,
  validate(upsertDeviceTokenSchema),
  upsertDeviceTokenController
);

export const usersRoutes = router;
