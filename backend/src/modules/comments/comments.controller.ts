import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { asyncHandler } from "../../shared/utils/async-handler";
import { addComment, listComments } from "./comments.service";

export const addCommentController = asyncHandler(async (req: Request, res: Response) => {
  const comment = await addComment({
    postId: new Types.ObjectId(String(req.params.postId)),
    userId: req.user!.id,
    text: req.body.text
  });

  res.status(StatusCodes.CREATED).json(comment);
});

export const listCommentsController = asyncHandler(async (req: Request, res: Response) => {
  const result = await listComments({
    postId: new Types.ObjectId(String(req.params.postId)),
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    cursor: req.query.cursor ? String(req.query.cursor) : undefined
  });

  res.status(StatusCodes.OK).json(result);
});
