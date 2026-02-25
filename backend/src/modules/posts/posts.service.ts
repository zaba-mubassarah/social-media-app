import { Types } from "mongoose";
import { decodeCursor, encodeCursor } from "../../shared/utils/cursor";
import { UserModel } from "../users/user.model";
import { PostModel } from "./post.model";

export const createPost = async (params: {
  authorId: Types.ObjectId;
  content: string;
  media: string[];
}) => {
  const post = await PostModel.create({
    authorId: params.authorId,
    content: params.content,
    media: params.media
  });
  return post;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const listFeed = async (params: { limit?: number; cursor?: string; username?: string }) => {
  const limit = params.limit ?? 20;
  const query: Record<string, unknown> = {};

  if (params.username) {
    const users = await UserModel.find({
      name: { $regex: new RegExp(escapeRegex(params.username.trim()), "i") }
    })
      .select("_id")
      .limit(100)
      .lean();

    const authorIds = users.map((u) => u._id);
    if (authorIds.length === 0) {
      return { data: [], nextCursor: null };
    }

    query.authorId = { $in: authorIds };
  }

  if (params.cursor) {
    const { createdAt, id } = decodeCursor(params.cursor);
    query.$or = [
      { createdAt: { $lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), _id: { $lt: new Types.ObjectId(id) } }
    ];
  }

  const posts = await PostModel.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate({ path: "authorId", select: "name email" })
    .lean();

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(new Date(data[data.length - 1].createdAt), String(data[data.length - 1]._id))
      : null;

  return {
    data,
    nextCursor
  };
};

export const getPostById = async (postId: Types.ObjectId) => PostModel.findById(postId);
