import { create } from "zustand";
import { reportService } from "../../services/Hubin/reportService";

interface ReportSummary {
    total_students: number;
    active_industries: number;
    completed_internships: number;
    ongoing_internships: number;
}

interface DistributionItem {
    industry_name: string;
    major_name: string;
    total_students: number;
    completed_count: number;
    avg_score: number | null;
}

interface ReportState {
    summary: ReportSummary | null;
    distribution: DistributionItem[];
    downloadReport: (format: "excel" | "pdf") => Promise<void>,
    isLoading: boolean;
    fetchMasterReport: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
    summary: null,
    distribution: [],
    isLoading: false,
    fetchMasterReport: async () => {
        set({ isLoading: true });
        try {
            const data = await reportService.getMasterData();
            set({
                summary: data.summary,
                distribution: data.distribution,
                isLoading: false
            });
        } catch {
            set({ isLoading: false });
        }
    },

    downloadReport: async (format: "excel" | "pdf") => {
        await reportService.exportMaster(format);
    }
}));