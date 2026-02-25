import axios from "axios";
import { NativeModules, Platform } from "react-native";
import { useAuthStore } from "../../store/auth-store";

const resolveHostFromBundle = (): string | null => {
  const scriptUrl = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (!scriptUrl) {
    return null;
  }

  const match = scriptUrl.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1] ?? null;
};

const resolveApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  const bundleHost = resolveHostFromBundle();
  if (bundleHost) {
    return `http://${bundleHost}:5000/v1`;
  }

  return Platform.OS === "android" ? "http://10.0.2.2:5000/v1" : "http://localhost:5000/v1";
};

const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

const notifyPending = (token: string | null): void => {
  pending.forEach((cb) => cb(token));
  pending = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      throw error;
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        throw error;
      }
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const existingUser = useAuthStore.getState().user;
      if (!existingUser) {
        throw error;
      }
      await useAuthStore.getState().setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: existingUser
      });
      notifyPending(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      await useAuthStore.getState().clearAuth();
      notifyPending(null);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
);
