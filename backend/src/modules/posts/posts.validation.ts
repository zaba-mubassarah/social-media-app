import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500),
    media: z.array(z.string().url()).max(4).optional().default([])
  }),
  params: z.object({}),
  query: z.object({})
});

export const listFeedSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: z.object({
    limit: z.coerce.number().min(1).max(50).optional(),
    cursor: z.string().optional(),
    username: z.string().min(1).max(50).optional()
  })
});
