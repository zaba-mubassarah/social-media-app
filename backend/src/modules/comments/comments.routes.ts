import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { addCommentController, listCommentsController } from "./comments.controller";
import { addCommentSchema, listCommentsSchema } from "./comments.validation";

const router = Router();

router.post("/:postId/comment", requireAuth, validate(addCommentSchema), addCommentController);
router.post("/:postId/comments", requireAuth, validate(addCommentSchema), addCommentController);
router.get("/:postId/comments", requireAuth, validate(listCommentsSchema), listCommentsController);

export const commentsRoutes = router;
