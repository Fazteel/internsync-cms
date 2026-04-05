import { create } from "zustand";
import api from "../../lib/axios";

interface Permission {
  id: number;
  studentName: string;
  start_date: string;
  end_date: string;
  raw_start_date: string;
  raw_end_date: string;
  type: "Sakit" | "Izin";
  reason: string;
  attachment: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

interface PermissionState {
  permissions: Permission[];
  isLoading: boolean;
  fetchPermissions: () => Promise<void>;
  submitPermission: (formData: FormData) => Promise<void>;
  verifyPermission: (id: number, status: string) => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  isLoading: false,

  fetchPermissions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/siswa/permissions");
      set({ permissions: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  submitPermission: async (formData) => {
    set({ isLoading: true });
    try {
      await api.post("/api/v1/siswa/permissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await get().fetchPermissions();
    } finally {
      set({ isLoading: false });
    }
  },

  verifyPermission: async (id, status) => {
    try {
      await api.put(`/api/v1/pembimbing/permissions/${id}/verify`, { status });
      await get().fetchPermissions();
    } catch {
      console.error("Gagal verifikasi izin");
    }
  },
}));