import { create } from "zustand";
import { industryVisitService } from "../../services/Pembimbing/industryVisitService";

export interface IndustryVisitRecord {
  id: number;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  feedback?: string;
  file_path?: string;
}

interface IndustryVisitState {
  visits: IndustryVisitRecord[];
  isLoading: boolean;
  
  fetchVisits: () => Promise<void>;
  viewVisitLetter: (id: number) => Promise<void>;
}

export const useIndustryVisitStore = create<IndustryVisitState>((set) => ({
  visits: [],
  isLoading: false,

  fetchVisits: async () => {
    set({ isLoading: true });
    try {
      const data = await industryVisitService.getVisits();
      set({ visits: data, isLoading: false });
    } catch (error) {
      console.error("Gagal ambil data kunjungan:", error);
      set({ isLoading: false });
    }
  },

  viewVisitLetter: async (id) => {
    try {
      const fileUrl = await industryVisitService.getLetterUrl(id);
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Gagal membuka SPPD:", error);
      throw error;
    }
  }
}));