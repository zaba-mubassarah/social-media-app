import { api } from "./client";

export const authApi = {
  register: (payload: { email: string; password: string; name: string }) =>
    api.post("/auth/register", payload),
  login: (payload: { email: string; password: string }) => api.post("/auth/login", payload),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken })
};
