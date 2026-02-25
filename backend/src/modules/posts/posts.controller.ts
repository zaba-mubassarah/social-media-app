import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../shared/utils/async-handler";
import { createPost, listFeed } from "./posts.service";

export const createPostController = asyncHandler(async (req: Request, res: Response) => {
  const post = await createPost({
    authorId: req.user!.id,
    content: req.body.content,
    media: req.body.media ?? []
  });

  res.status(StatusCodes.CREATED).json(post);
});

export const listFeedController = asyncHandler(async (req: Request, res: Response) => {
  const result = await listFeed({
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    cursor: req.query.cursor ? String(req.query.cursor) : undefined,
    username: req.query.username ? String(req.query.username) : undefined
  });

  res.status(StatusCodes.OK).json(result);
});
