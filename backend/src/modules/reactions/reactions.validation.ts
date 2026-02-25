import { z } from "zod";

export const postIdParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    postId: z.string().min(24).max(24)
  }),
  query: z.object({})
});
