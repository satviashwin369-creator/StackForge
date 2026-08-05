import { create } from "zustand";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/api-client";
import { authService } from "@/lib/api/services";
import type { UserProfile } from "@/lib/types/models";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authService.login({ email, password });
    setAuthToken(res.data.access_token);
    const user = await authService.me();
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, fullName) => {
    const res = await authService.register({
      email,
      password,
      full_name: fullName,
    });
    setAuthToken(res.data.access_token);
    const user = await authService.me();
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearAuthToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await authService.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
