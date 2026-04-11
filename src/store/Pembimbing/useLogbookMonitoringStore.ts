import { create } from "zustand";
import api from "../../lib/axios";

export interface StudentLogbook {
  id: number;
  student_id: number;
  studentName: string;
  nis: string;
  industry: string;
  date: string;
  activity: string;
  attachment: string;
  attachment_url: string | null;
  created_at: string;
}

interface LogbookMonitoringState {
  logbooks: StudentLogbook[];
  isLoading: boolean;
  fetchLogbooks: (studentId?: string) => Promise<void>;
  exportPdf: (studentId?: string) => Promise<void>;
}

export const useLogbookMonitoringStore = create<LogbookMonitoringState>((set) => ({
  logbooks: [],
  isLoading: false,

  fetchLogbooks: async (studentId) => {
    set({ isLoading: true });
    try {
      const url = studentId ? `/api/v1/pembimbing/logbooks?student_id=${studentId}` : `/api/v1/pembimbing/logbooks`;
      const response = await api.get(url);
      set({ logbooks: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal load logbooks", error)
      set({ isLoading: false });
    }
  },

  exportPdf: async (studentId) => {
    try {
      const url = studentId ? `/api/v1/pembimbing/logbooks/export-pdf?student_id=${studentId}` : `/api/v1/pembimbing/logbooks/export-pdf`;
      const response = await api.post(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Logbook_Report_${new Date().getTime()}.pdf`;
      link.click();
    } catch (error) {
      console.error("Gagal export PDF", error);
    }
  }
}));