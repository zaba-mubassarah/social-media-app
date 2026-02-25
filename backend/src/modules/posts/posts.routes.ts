import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { listFeedController, createPostController } from "./posts.controller";
import { createPostSchema, listFeedSchema } from "./posts.validation";

const router = Router();

router.get("/", requireAuth, validate(listFeedSchema), listFeedController);
router.post("/", requireAuth, validate(createPostSchema), createPostController);

export const postsRoutes = router;
