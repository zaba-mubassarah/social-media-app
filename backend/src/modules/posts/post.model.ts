import { InferSchemaType, Schema, Types, model } from "mongoose";

const postSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, maxlength: 500 },
    media: { type: [String], default: [] },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1, _id: -1 });

export type PostDocument = InferSchemaType<typeof postSchema>;
export const PostModel = model("Post", postSchema);
