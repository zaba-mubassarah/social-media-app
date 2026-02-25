import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import {
  likePostController,
  toggleLikePostController,
  unlikePostController
} from "./reactions.controller";
import { postIdParamsSchema } from "./reactions.validation";

const router = Router();

router.post("/:postId/like", requireAuth, validate(postIdParamsSchema), toggleLikePostController);
router.put("/:postId/like", requireAuth, validate(postIdParamsSchema), likePostController);
router.delete("/:postId/like", requireAuth, validate(postIdParamsSchema), unlikePostController);

export const reactionsRoutes = router;
