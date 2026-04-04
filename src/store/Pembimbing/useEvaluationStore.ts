import { create } from "zustand";
import api from "../../lib/axios";


export interface studentEvaluation {
  internship_id: number;
  name: string;
  nis: string;
  industry: string;
  status: "Aktif" | "Selesai";
  evaluationScore: number | null;
  evaluationNotes: string;
}

interface EvaluationState {
  evaluations: studentEvaluation[];
  isLoading: boolean;

  fetchEvaluations: () => Promise<void>;
    submitEvaluation: (
      data: {
        internship_id: number;
        score: number;
        notes: string
      }) => Promise<void>;
  }

export const useEvaluationStore = create<EvaluationState>((set) => ({
  evaluations: [],
  isLoading: false,

  fetchEvaluations: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/pembimbing/evaluations", {
        headers: { 'Cache-Control': 'no-cache'}
      });
      set({ evaluations: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal narik data evaluasi", error);
      set({ isLoading: false });
    }
  },

  submitEvaluation: async (data) => {
    await api.post("/api/v1/pembimbing/evaluations", data);
    await useEvaluationStore.getState().fetchEvaluations(); 
  },
}));
