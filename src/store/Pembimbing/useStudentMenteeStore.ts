import { create } from "zustand";
import {
  fetchStudentsService,
  fetchStudentDetailService,
  reportProblemService,
} from "../../services/Pembimbing/studentMenteeService";

interface StudentMentee {
  id: number;
  nis: string;
  name: string;
  major: string;
  industry: string;
  status: "Aktif" | "Selesai" | "Bermasalah" | "Menunggu";
  is_flagged: boolean;
  departure_date: string;
  final_end_date: string;
  duration_label: string;
  passed_label: string;
  progress_percent: number;
}

interface StudentDetail {
  id: number;
  nis: string;
  name: string;
  major: string;
  industry: string;
  address: string;
  duration: number;
  status: "Aktif" | "Selesai" | "Bermasalah" | "Menunggu";
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
  progressPercent: number;
}

interface StudentMenteeState {
  students: StudentMentee[];
  studentDetail: StudentDetail | null;
  isLoading: boolean;
  fetchStudents: () => Promise<void>;
  fetchStudentDetail: (id: string) => Promise<void>;
  reportProblem: (id: string, reason: string) => Promise<void>;
}

export const useStudentMenteeStore = create<StudentMenteeState>((set, get) => ({
  students: [],
  studentDetail: null,
  isLoading: false,

  fetchStudents: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchStudentsService();
      set({ students: data, isLoading: false });
    } catch (err) {
      console.error("Gagal narik siswa", err);
      set({ isLoading: false });
    }
  },

  fetchStudentDetail: async (id) => {
    set({ isLoading: true });
    try {
      const data = await fetchStudentDetailService(id);
      set({ studentDetail: data, isLoading: false });
    } catch (err) {
      console.error("Gagal buka detail siswa", err);
      set({ isLoading: false });
    }
  },

  reportProblem: async (id, reason) => {
    set({ isLoading: true });
    try {
      await reportProblemService(id, reason);
      await get().fetchStudentDetail(id);
      set({ isLoading: false });
    } catch (err) {
      console.error("Gagal lapor masalah", err);
      set({ isLoading: false });
      throw err;
    }
  },
}));