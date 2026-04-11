import { create } from "zustand";
import { koordinatorVisitService, KoordinatorVisitPayload } from "../../services/Koordinator/koordinatorIndustryVisitService";

export interface KoordinatorVisitRecord {
  id: number;
  pembimbing_name: string;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  feedback?: string;
}

export interface FormOption {
  id: number;
  name: string;
}

interface KoordinatorVisitState {
  visits: KoordinatorVisitRecord[];
  formOptions: {
    industries: FormOption[];
    pembimbings: FormOption[];
  };
  isLoading: boolean;
  
  fetchVisits: () => Promise<void>;
  fetchFormOptions: () => Promise<void>;
  submitVisit: (data: KoordinatorVisitPayload) => Promise<void>;
}

export const useKoordinatorIndustryVisitStore = create<KoordinatorVisitState>((set, get) => ({
  visits: [],
  formOptions: { industries: [], pembimbings: [] },
  isLoading: false,

  fetchVisits: async () => {
    set({ isLoading: true });
    try {
      const data = await koordinatorVisitService.getVisits();
      set({ visits: data, isLoading: false });
    } catch (error) {
      console.error("Gagal ambil data kunjungan:", error);
      set({ isLoading: false });
    }
  },

  fetchFormOptions: async () => {
    try {
      const data = await koordinatorVisitService.getFormOptions();
      set({ formOptions: data });
    } catch (error) {
      console.error("Gagal ambil opsi form:", error);
    }
  },

  submitVisit: async (data) => {
    await koordinatorVisitService.submitVisit(data);
    await get().fetchVisits();
  }
}));