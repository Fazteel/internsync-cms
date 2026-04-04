import { create } from "zustand";
import { approvalVisitService } from "../../services/Hubin/approvalVisitService";

export interface VisitApproval {
  id: number;
  teacherName: string;
  industry: string;
  plannedDate: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback?: string;
  file_path?: string;
}

interface ApprovalVisitState {
  visits: VisitApproval[];
  isLoading: boolean;
  fetchVisits: () => Promise<void>;
  verifyVisit: (id: number, status: "Approved" | "Rejected", feedback?: string) => Promise<void>;
  generateVisitLetter: (id: number) => Promise<string>;
  viewVisitLetter: (id: number) => Promise<void>;
}

export const useApprovalVisitStore = create<ApprovalVisitState>((set) => ({
  visits: [],
  isLoading: false,

  fetchVisits: async () => {
    set({ isLoading: true });
    try {
      const data = await approvalVisitService.getVisit();
      set({ visits: data, isLoading: false });
    } catch (error) {
      console.error("Gagal memuat data:", error);
      set({ isLoading: false });
    }
  },

  verifyVisit: async (id, status, feedback) => {
    await approvalVisitService.updateVisit(id, status, feedback);

    set((state) => ({
      visits: state.visits.map((visit) =>
        visit.id === id
          ? { ...visit, status, feedback }
          : visit
      ),
    }));
  },

  generateVisitLetter: async (id: number) => {
    return approvalVisitService.generateLetter(id);
  },

  viewVisitLetter: async (id: number) => {
    const url = await approvalVisitService.viewLetter(id);
    window.open(url, '_blank');
  }
}));