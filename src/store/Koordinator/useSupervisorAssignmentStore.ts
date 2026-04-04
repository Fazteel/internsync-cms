import { create } from "zustand";
import { supervisorAssignmentService } from "../../services/Koordinator/supervisorAssignmentService";

export interface Teacher {
  id: number;
  name: string;
}

export interface PlottingStudent {
  id: number;
  name: string;
  nis: string;
  major: string;
  supervisor_id?: number | null;
  supervisor_name?: string | null;
  status: "Belum Diplot" | "Sudah Diplot";
}

interface AssignmentState {
  plottingStudents: PlottingStudent[];
  teachers: Teacher[];
  isLoading: boolean;
  fetchPlottingStudents: () => Promise<void>;
  fetchTeachers: () => Promise<void>;
  assignTeacher: (studentId: number, teacherId: number) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  plottingStudents: [],
  teachers: [],
  isLoading: false,

  fetchPlottingStudents: async () => {
    set({ isLoading: true });
    try {
      const data = await supervisorAssignmentService.getPlottingStudents();
      set({ plottingStudents: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Gagal ambil data plotting:", error);
    }
  },

  fetchTeachers: async () => {
    try {
      const data = await supervisorAssignmentService.getTeachers();
      set({ teachers: data });
    } catch (error) {
      console.error("Gagal ambil data guru:", error);
    }
  },

  assignTeacher: async (studentId, teacherId) => {
    try {
      await supervisorAssignmentService.assignTeacher(studentId, teacherId);
    } catch (error) {
      console.error("Gagal assign pembimbing:", error);
      throw error;
    }
  },
}));