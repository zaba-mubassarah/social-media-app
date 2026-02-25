import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; name: string } | null;
  hydrated: boolean;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; name: string };
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
  setAuth: async (payload) => {
    await SecureStore.setItemAsync(ACCESS_KEY, payload.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, payload.refreshToken);
    set({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user
    });
  },
  clearAuth: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },
  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY)
    ]);
    set({ accessToken, refreshToken, hydrated: true });
  }
}));
