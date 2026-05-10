import { create } from "zustand";
import api from "../../lib/axios";

export interface VisitRecord {
  id: number;
  industry: string;
  planned_date: string;
  purpose: string;
  is_filled: boolean;
}

export interface StudentMonitoringForm {
  internship_id: number;
  name: string;
  nis: string;
  kelas: string;
  notes: string;
}

interface EvaluationState {
  visits: VisitRecord[];
  studentsForm: StudentMonitoringForm[];
  isLoading: boolean;
  isFormLoading: boolean;

  fetchVisits: () => Promise<void>;
  fetchMonitoringForm: (visitId: number) => Promise<void>;
  updateStudentNote: (internship_id: number, notes: string) => void;
  submitBulkMonitoring: (visitId: number) => Promise<void>;
  exportMonitoring: (visitId: number) => Promise<void>;
}

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  visits: [],
  studentsForm: [],
  isLoading: false,
  isFormLoading: false,

  fetchVisits: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/pembimbing/monitoring");
      set({ visits: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal narik data jadwal kunjungan", error);
      set({ isLoading: false });
    }
  },

  fetchMonitoringForm: async (visitId) => {
    set({ isFormLoading: true, studentsForm: [] });
    try {
      const response = await api.get(`/api/v1/pembimbing/monitoring/${visitId}`);
      set({ studentsForm: response.data, isFormLoading: false });
    } catch (error) {
      console.error("Gagal narik daftar siswa buat dimonitoring", error);
      set({ isFormLoading: false });
    }
  },

  updateStudentNote: (internship_id, notes) => {
    set((state) => ({
      studentsForm: state.studentsForm.map((s) =>
        s.internship_id === internship_id ? { ...s, notes } : s
      ),
    }));
  },

  submitBulkMonitoring: async (visitId) => {
    const { studentsForm } = get();
    const payload = {
      evaluations: studentsForm.map(s => ({
        internship_id: s.internship_id,
        notes: s.notes
      }))
    };
    await api.post(`/api/v1/pembimbing/monitoring/${visitId}`, payload);
    await get().fetchVisits();
  },

  exportMonitoring: async (visitId) => {
    try {
      const response = await api.get(`/api/v1/pembimbing/monitoring/${visitId}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Monitoring_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Gagal export excel", error);
      throw error;
    }
  }
}));