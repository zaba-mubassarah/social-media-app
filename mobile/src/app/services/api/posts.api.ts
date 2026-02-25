import { api } from "./client";

export type Post = {
  _id: string;
  authorId: string | { _id: string; name?: string; email?: string };
  content: string;
  media: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type Comment = {
  _id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
};

export const postsApi = {
  createPost: (payload: { content: string; media?: string[] }) => api.post("/posts", payload),
  listFeed: (params?: { cursor?: string; limit?: number; username?: string }) =>
    api.get("/posts", { params }),
  likePost: (postId: string) => api.put(`/posts/${postId}/like`),
  unlikePost: (postId: string) => api.delete(`/posts/${postId}/like`),
  toggleLikePost: (postId: string) => api.post(`/posts/${postId}/like`),
  addComment: (postId: string, text: string) => api.post(`/posts/${postId}/comment`, { text }),
  listComments: (postId: string, params?: { cursor?: string; limit?: number }) =>
    api.get(`/posts/${postId}/comments`, { params })
};
