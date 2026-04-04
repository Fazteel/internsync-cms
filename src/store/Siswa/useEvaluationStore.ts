import { create } from "zustand";
import { evaluationService } from "../../services/Siswa/evaluationService";

interface EvaluationData {
  isEvaluated: boolean;
  score: number;
  grade: string;
  evaluator: string;
  date: string;
  industry: string;
  notes: string;
}

interface EvaluationState {
  data: EvaluationData | null;
  isLoading: boolean;
  fetchEvaluation: () => Promise<void>;
  downloadResult: () => Promise<void>;
}

export const useEvaluationStore = create<EvaluationState>((set) => ({
  data: null,
  isLoading: false,
  fetchEvaluation: async () => {
    set({ isLoading: true });
    try {
      const data = await evaluationService.getEvaluation();
      set({ data, isLoading: false });
    } catch (error) {
        console.error("Gagal mengambil data evaluasi: ", error);
      set({ isLoading: false });
    }
  },
  downloadResult: async () => {
    await evaluationService.downloadPdf();
  }
}));