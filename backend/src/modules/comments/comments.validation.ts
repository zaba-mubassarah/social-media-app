import { z } from "zod";

export const addCommentSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(300)
  }),
  params: z.object({
    postId: z.string().min(24).max(24)
  }),
  query: z.object({})
});

export const listCommentsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    postId: z.string().min(24).max(24)
  }),
  query: z.object({
    limit: z.coerce.number().min(1).max(50).optional(),
    cursor: z.string().optional()
  })
});
