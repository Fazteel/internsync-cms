import { create } from "zustand";
import { placementService, PlacementPayload } from "../../services/Koordinator/placementService";

export interface StudentPlacement {
  id: number;
  nis: string;
  name: string;
  major: string;
  kelas?: string | null;
  industry_id: number | null;
  industry: string | null;
  duration: number | null;
  startDate: string | null;
  endDate: string | null;
  is_extended: boolean;
  supervisor_id?: number | null;
  supervisor_name?: string | null;
  status: "Belum Ditempatkan" | "Sudah Ditempatkan" | "Belum Diplot" | "Sudah Diplot";
}

export interface ActiveIndustry {
  id: number;
  name: string;
  kuota_siswa: number;
  sisa_kuota: number;
}

interface PlacementState {
  students: StudentPlacement[];
  industries: ActiveIndustry[];
  isLoading: boolean;
  fetchPlacements: () => Promise<void>;
  fetchIndustries: () => Promise<void>;
  assignPlacement: (data: PlacementPayload) => Promise<void>;
}

export const usePlacementStore = create<PlacementState>((set) => ({
  students: [],
  industries: [],
  isLoading: false,

  fetchPlacements: async () => {
    set({ isLoading: true });
    try {
      const data = await placementService.getStudents();
      set({ students: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Gagal ambil data placement:", error);
    }
  },

  fetchIndustries: async () => {
    try {
      const data = await placementService.getActiveIndustries();
      set({ industries: data });
    } catch (error) {
      console.error("Gagal ambil data industri:", error);
    }
  },

  assignPlacement: async (data) => {
    try {
      await placementService.assignPlacement(data);
    } catch (error) {
      console.error("Gagal assign placement:", error);
      throw error;
    }
  },
}));