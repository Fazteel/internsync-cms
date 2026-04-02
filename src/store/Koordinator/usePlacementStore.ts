import { create } from "zustand";
import { placementService, PlacementPayload } from "../../services/Koordinator/placementService";

export interface StudentPlacement {
  id: number;
  nis: string;
  name: string;
  major: string;
  kelas?: string | null;
  industry_id: number | null;
  industry: string | null;
  duration: 3 | 6 | null;
  startDate: string | null;
  supervisor_id?: number | null;
  supervisor_name?: string | null;
  status: "Belum Ditempatkan" | "Sudah Ditempatkan" | "Belum Diplot" | "Sudah Diplot";
}

export interface ActiveIndustry {
  id: number;
  name: string;
  kuota_siswa: number;
  sisa_kuota: number;
}

export interface Teacher {
  id: number;
  name: string;
}

interface PlacementState {
  students: StudentPlacement[];
  industries: ActiveIndustry[];
  teachers: Teacher[];
  isLoading: boolean;
  
  fetchPlacements: () => Promise<void>;
  fetchPlottingStudents: () => Promise<void>;
  fetchIndustries: () => Promise<void>;
  fetchTeachers: () => Promise<void>;
  
  assignPlacement: (data: PlacementPayload) => Promise<void>;
  assignTeacher: (studentId: number, teacherId: number) => Promise<void>;
}

export const usePlacementStore = create<PlacementState>((set) => ({
  students: [],
  industries: [],
  teachers: [],
  isLoading: false,

  fetchPlacements: async () => {
    set({ isLoading: true });
    try {
      const data = await placementService.getStudents();
      set({ students: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error(error);
    }
  },

  fetchPlottingStudents: async () => {
    set({ isLoading: true });
    try {
      const data = await placementService.getPlottingStudents();
      set({ students: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error(error);
    }
  },

  fetchIndustries: async () => {
    try {
      const data = await placementService.getActiveIndustries();
      set({ industries: data });
    } catch (error) {
      console.error(error);
    }
  },

  fetchTeachers: async () => {
    try {
      const data = await placementService.getTeachers();
      set({ teachers: data });
    } catch (error) {
      console.error(error);
    }
  },

  assignPlacement: async (data) => {
    await placementService.assignPlacement(data);
  },

  assignTeacher: async (studentId, teacherId) => {
    await placementService.assignTeacher(studentId, teacherId);
  },
}));