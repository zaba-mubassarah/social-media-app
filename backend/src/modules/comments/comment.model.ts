import { InferSchemaType, Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, maxlength: 300 }
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1, _id: -1 });

export type CommentDocument = InferSchemaType<typeof commentSchema>;
export const CommentModel = model("Comment", commentSchema);
