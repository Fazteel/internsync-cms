import { create } from 'zustand';
import { authService } from '../services/authService';

export interface User {
  id: number;
  email: string;
  is_active?: boolean | number;
  roles?: { id: number; name: string }[];
  student?: {
    id: number;
    name: string;
    nis: string;
    jurusan?: string | null;
    kelas?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null;
  teacher?: {
    id: number;
    name: string;
    nip: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setAuth: (userData) => set({ user: userData, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  }
}));