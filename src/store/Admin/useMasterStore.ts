import { create } from 'zustand';
import { masterService } from '../../services/Admin/masterService';

export interface Jurusan {
  id: number;
  kode: string;
  nama: string;
  status: "Aktif" | "Nonaktif";
}
export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
  status: "Aktif" | "Nonaktif";
}
export interface Kelas {
  id: number;
  major_id: number;
  nama: string;
  status: "Aktif" | "Nonaktif";
}

interface BackendMajor {
  id: number;
  major_code: string;
  major_name: string;
  is_active: boolean;
}
interface BackendYear {
  id: number;
  name: string;
  semester: 'Ganjil' | 'Genap';
  is_active: boolean;
}
interface BackendClassroom {
  id: number;
  major_id: number;
  name: string;
  is_active: boolean;
}

interface MasterState {
  majors: Jurusan[];
  academicYears: TahunAjaran[];
  classrooms: Kelas[];
  isLoading: boolean;
  fetchMajors: () => Promise<void>;
  fetchAcademicYears: () => Promise<void>;
  fetchClassrooms: () => Promise<void>;
  addMajor: (kode: string, nama: string, isActive: boolean) => Promise<void>;
  editMajor: (id: number, kode: string, nama: string, isActive: boolean) => Promise<void>;
  removeMajor: (id: number) => Promise<void>;
  addAcademicYear: (tahun: string, semester: string, isActive: boolean) => Promise<void>;
  editAcademicYear: (id: number, tahun: string, semester: string, isActive: boolean) => Promise<void>;
  removeAcademicYear: (id: number) => Promise<void>;
  addClassroom: (majorId: number, nama: string, isActive: boolean) => Promise<void>;
  editClassroom: (id: number, majorId: number, nama: string, isActive: boolean) => Promise<void>;
  removeClassroom: (id: number) => Promise<void>;
  importExcel: (file: File) => Promise<void>;
}

export const useMasterStore = create<MasterState>((set) => ({
  majors: [], academicYears: [], classrooms: [], isLoading: false,

  fetchMajors: async () => {
    set({ isLoading: true });
    try {
      const data = await masterService.getMajors();
      const mapped = data.map((item: BackendMajor) => ({ id: item.id, kode: item.major_code, nama: item.major_name, status: item.is_active ? "Aktif" : "Nonaktif" }));
      set({ majors: mapped, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchAcademicYears: async () => {
    set({ isLoading: true });
    try {
      const data = await masterService.getAcademicYears();
      const mapped = data.map((item: BackendYear) => {
        return { id: item.id, tahun: item.name , semester: item.semester, status: item.is_active ? "Aktif" : "Nonaktif" };
      });
      set({ academicYears: mapped, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchClassrooms: async () => {
    set({ isLoading: true });
    try {
      const data = await masterService.getClassrooms();
      const mapped = data.map((item: BackendClassroom) => ({ id: item.id, major_id: item.major_id, nama: item.name, status: item.is_active ? "Aktif" : "Nonaktif" }));
      set({ classrooms: mapped, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  addMajor: async (kode, nama, isActive) =>
    await masterService.createMajor({
      major_code: kode,
      major_name: nama,
      is_active: isActive
    }),
  editMajor: async (id, kode, nama, isActive) =>
    await masterService.updateMajor(id, {
      major_code: kode,
      major_name: nama,
      is_active: isActive
    }),
  removeMajor: async (id) =>
    await masterService.deleteMajor(id),

  addAcademicYear: async (tahun, semester, isActive) => 
    await masterService.createAcademicYear({
      name: tahun,
      semester: semester,
      is_active: isActive
  }),
  editAcademicYear: async (id, tahun, semester, isActive) =>
    await masterService.updateAcademicYear(id, {
      name: tahun,
      semester: semester,
      is_active: isActive
    }),
  removeAcademicYear: async (id) =>
    await masterService.deleteAcademicYear(id),

  addClassroom: async (majorId, nama, isActive) =>
    await masterService.createClassroom({
      major_id: majorId,
      name: nama,
      is_active: isActive
    }),
  editClassroom: async (id, majorId, nama, isActive) =>
    await masterService.updateClassroom(id, {
      major_id: majorId,
      name: nama,
      is_active: isActive
    }),
  removeClassroom: async (id) =>
    await masterService.deleteClassroom(id),

  importExcel: async (file: File) => 
    await masterService.importFromExcel(file),
}));