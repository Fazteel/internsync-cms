import { create } from "zustand";
import { industryVisitService, VisitPayload } from "../../services/Pembimbing/industryVisitService";

export interface IndustryVisitRecord {
  id: number;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  feedback?: string;
  file_path?: string;
}

export interface AssignedIndustry {
  id: number;
  name: string;
}

interface IndustryVisitState {
  visits: IndustryVisitRecord[];
  assignedIndustries: AssignedIndustry[];
  isLoading: boolean;
  
  fetchVisits: () => Promise<void>;
  fetchAssignedIndustries: () => Promise<void>;
  submitVisit: (data: VisitPayload) => Promise<void>;
  viewVisitLetter: (id: number) => Promise<void>;
}

export const useIndustryVisitStore = create<IndustryVisitState>((set, get) => ({
  visits: [],
  assignedIndustries: [],
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

  fetchAssignedIndustries: async () => {
    try {
      const data = await industryVisitService.getAssignedIndustries();
      set({ assignedIndustries: data });
    } catch (error) {
      console.error("Gagal ambil daftar industri:", error);
    }
  },

  submitVisit: async (data) => {
    await industryVisitService.submitVisit(data);
    await get().fetchVisits();
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
