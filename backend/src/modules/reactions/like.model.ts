import { InferSchemaType, Schema, Types, model } from "mongoose";

const likeSchema = new Schema(
  {
    postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type LikeDocument = InferSchemaType<typeof likeSchema>;
export const LikeModel = model("Like", likeSchema);
