import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { asyncHandler } from "../../shared/utils/async-handler";
import { likePost, toggleLikePost, unlikePost } from "./reactions.service";

export const likePostController = asyncHandler(async (req: Request, res: Response) => {
  const result = await likePost({
    postId: new Types.ObjectId(String(req.params.postId)),
    userId: req.user!.id
  });

  res.status(StatusCodes.OK).json(result);
});

export const unlikePostController = asyncHandler(async (req: Request, res: Response) => {
  const result = await unlikePost({
    postId: new Types.ObjectId(String(req.params.postId)),
    userId: req.user!.id
  });

  res.status(StatusCodes.OK).json(result);
});

export const toggleLikePostController = asyncHandler(async (req: Request, res: Response) => {
  const result = await toggleLikePost({
    postId: new Types.ObjectId(String(req.params.postId)),
    userId: req.user!.id
  });

  res.status(StatusCodes.OK).json(result);
});
