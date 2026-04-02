import { create } from "zustand";
import api from "../../lib/axios";

interface StudentMentee {
  id: number;
  nis: string;
  name: string;
  major: string;
  industry: string;
  duration: number;
  monthsCompleted: number;
  status: "Aktif" | "Selesai" | "Bermasalah" | "Menunggu";
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
}

export const useStudentMenteeStore = create<StudentMenteeState>((set) => ({
    students: [],
    studentDetail: null,
    isLoading: false,
  
     fetchStudents: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/v1/pembimbing/students");
      set({
        students: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Gagal narik data siswa bimbingan", error);
      set({ isLoading: false });
    }
  },

  fetchStudentDetail: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/api/v1/pembimbing/students/${id}`);
      set({
        studentDetail: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Gagal membuka detail siswa bimbingan", error);
      set({ isLoading: false });
    }
  },
}));