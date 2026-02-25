import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { decodeCursor, encodeCursor } from "../../shared/utils/cursor";
import { ApiError } from "../../shared/utils/api-error";
import { PostModel } from "../posts/post.model";
import { CommentModel } from "./comment.model";
import { enqueueNotification } from "../notifications/notifications.service";
import { UserModel } from "../users/user.model";

export const addComment = async (params: {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
}) => {
  const post = await PostModel.findById(params.postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const comment = await CommentModel.create({
    postId: params.postId,
    userId: params.userId,
    text: params.text
  });

  await PostModel.updateOne({ _id: params.postId }, { $inc: { commentCount: 1 } });

  if (String(post.authorId) !== String(params.userId)) {
    const actor = await UserModel.findById(params.userId).select("name");
    await enqueueNotification({
      recipientUserId: post.authorId as Types.ObjectId,
      eventType: "comment_created",
      payload: {
        actorId: params.userId.toString(),
        actorName: actor?.name ?? "Someone",
        postId: params.postId.toString()
      }
    });
  }

  return comment;
};

export const listComments = async (params: {
  postId: Types.ObjectId;
  limit?: number;
  cursor?: string;
}) => {
  const limit = params.limit ?? 20;
  const query: Record<string, unknown> = { postId: params.postId };

  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor);
    query.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } }
    ];
  }

  const comments = await CommentModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = comments.length > limit;
  const data = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(new Date(data[data.length - 1].createdAt), String(data[data.length - 1]._id))
      : null;

  return { data, nextCursor };
};
