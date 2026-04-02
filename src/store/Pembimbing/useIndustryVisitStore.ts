import { create } from "zustand";
import api from "../../lib/axios";

interface IndustryVisitRequest {
  id: number;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  feedback?: string;
}

export interface AssignedIndustry {
  id: number;
  name: string;
}

interface IndustryVisit {
  visits: IndustryVisitRequest[];
  assignedIndustries: AssignedIndustry[];
  isLoading: boolean;

  fetchVisit: () => Promise<void>;
  fetchAssignedIndustries: () => Promise<void>;
  submitVisit: (data: {
    industry_id: string;
    planned_date: string;
    purpose: string;
  }) => Promise<void>;
}

export const useIndustiryVisit = create<IndustryVisit>((set) => ({
  visits: [],
  assignedIndustries: [],
  isLoading: false,

  fetchVisit: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/pembimbing/visits");
      set({ visits: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal narik riwayat dinas", error);
      set({ isLoading: false });
    }
  },

  fetchAssignedIndustries: async () => {
    try {
      const response = await api.get("/api/v1/pembimbing/visits-industries");
      set({ assignedIndustries: response.data });
    } catch (error) {
      console.error("Gagal narik daftar industri lu", error);
    }
  },

  submitVisit: async (data) => {
    await api.post("/api/v1/pembimbing/visits", data);
    await useIndustiryVisit.getState().fetchVisit();
  },
}));
