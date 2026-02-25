import { Types } from "mongoose";
import { LikeModel } from "./like.model";
import { PostModel } from "../posts/post.model";
import { ApiError } from "../../shared/utils/api-error";
import { StatusCodes } from "http-status-codes";
import { enqueueNotification } from "../notifications/notifications.service";
import { UserModel } from "../users/user.model";

export const likePost = async (params: { postId: Types.ObjectId; userId: Types.ObjectId }) => {
  const post = await PostModel.findById(params.postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const existing = await LikeModel.findOne({ postId: params.postId, userId: params.userId });
  if (existing) {
    return { liked: true };
  }

  await LikeModel.create({ postId: params.postId, userId: params.userId });
  await PostModel.updateOne({ _id: params.postId }, { $inc: { likeCount: 1 } });

  if (String(post.authorId) !== String(params.userId)) {
    const actor = await UserModel.findById(params.userId).select("name");
    await enqueueNotification({
      recipientUserId: post.authorId as Types.ObjectId,
      eventType: "post_liked",
      payload: {
        actorId: params.userId.toString(),
        actorName: actor?.name ?? "Someone",
        postId: params.postId.toString()
      }
    });
  }

  return { liked: true };
};

export const unlikePost = async (params: { postId: Types.ObjectId; userId: Types.ObjectId }) => {
  const deleted = await LikeModel.findOneAndDelete({
    postId: params.postId,
    userId: params.userId
  });

  if (deleted) {
    await PostModel.updateOne({ _id: params.postId }, { $inc: { likeCount: -1 } });
  }

  return { liked: false };
};

export const toggleLikePost = async (params: { postId: Types.ObjectId; userId: Types.ObjectId }) => {
  const existing = await LikeModel.findOne({ postId: params.postId, userId: params.userId });
  if (existing) {
    return unlikePost(params);
  }
  return likePost(params);
};
