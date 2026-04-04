import { create } from "zustand";
import { summaryService } from "../../services/Koordinator/summaryService";

interface StudentSummary {
    id: number;
    nis: string;
    name: string;
    major: string;
    industry: string;
    supervisor: string;
    status: string;
    finalScore: number | null;
}

export interface SummaryFilter {
  search?: string;
  major?: string;
  status?: string;
}

interface SummaryState {
    data: StudentSummary[];
    isLoading: boolean;
    fetchSummary: (filters: SummaryFilter) => Promise<void>;
    downloadExcel: (filters: SummaryFilter) => Promise<void>;
    downloadStudentPdf: (id: number) => Promise<void>;
}

export const useSummaryStore = create<SummaryState>((set) => ({
    data: [],
    isLoading: false,
    fetchSummary: async (filters) => {
        set({ isLoading: true });
        try {
            const data = await summaryService.getSummary(filters);
            set({ data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },
    downloadExcel: async (filters) => {
        await summaryService.exportExcel(filters);
    },
    downloadStudentPdf: async (id) => {
        await summaryService.exportPdf(id);
    }
}));
