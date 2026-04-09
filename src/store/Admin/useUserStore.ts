import { create } from 'zustand';
import { userService, UserPayload } from '../../services/Admin/userService';

export interface UserAccount {
  id: number;
  profile_id: number;
  name: string;
  email: string;
  identifier: string;
  role: string;
  status: "Aktif" | "Nonaktif";
  jurusan?: string;
  kelas?: string;
  phone?: string;
  address?: string;
  academic_year_id?: number;
  signature_url?: string;
}

interface BackendStudent {
  id: number;
  nis: string;
  name: string;
  jurusan: string;
  kelas: string;
  phone: string | null;
  address: string | null;
  academic_year_id: number | null;
  user: {
    id: number;
    email: string;
    is_active: boolean;
    roles: { name: string }[];
  };
}

interface BackendTeacher {
  id: number;
  nip: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  signature_path: string | null;
  user: {
    id: number;
    email: string;
    is_active: boolean;
    roles: { name: string }[];
  };
}

interface ImportResult {
  success: number;
  failed: number;
  message: string;
}

interface UserState {
  users: UserAccount[];
  isLoading: boolean;
  fetchUsers: (search?: string, role?: string) => Promise<void>;
  addUser: (data: UserPayload) => Promise<void>;
  editUser: (profile_id: number, data: UserPayload) => Promise<void>;
  removeUser: (profile_id: number, role: string) => Promise<void>;
  importExcel: (file: File) => Promise<ImportResult>;
  resendActivationEmail: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async (search?: string, role?: string) => {
    set({ isLoading: true });
    try {
      const { students, teachers } = await userService.getUsers(search, role);

      const mappedStudents: UserAccount[] = students.map((s: BackendStudent) => ({
        id: s.user.id,
        profile_id: s.id,
        name: s.name,
        email: s.user.email,
        identifier: s.nis,
        role: "Siswa",
        status: s.user.is_active ? "Aktif" : "Nonaktif",
        jurusan: s.jurusan,
        kelas: s.kelas,
        phone: s.phone || "",
        address: s.address || "",
        academic_year_id: s.academic_year_id || undefined
      }));

      const mappedTeachers: UserAccount[] = teachers.map((t: BackendTeacher) => ({
        id: t.user.id,
        profile_id: t.id,
        name: t.name,
        email: t.user.email,
        identifier: t.nip || "",
        role: t.user.roles[0]?.name || "Pembimbing",
        status: t.user.is_active ? "Aktif" : "Nonaktif",
        phone: t.phone || "",
        address: t.address || "",
        signature_url: t.signature_path ? `http://localhost:8000/storage/${t.signature_path}` : undefined
      }));

      set({ users: [...mappedStudents, ...mappedTeachers], isLoading: false });
    } catch (error) {
      console.error("Store error:", error);
      set({ isLoading: false });
    }
  },

  addUser: async (data: UserPayload) => {
    await userService.createUser(data);
    await get().fetchUsers();
  },

  editUser: async (profile_id: number, data: UserPayload) => {
    await userService.updateUser(profile_id, data);
    await get().fetchUsers();
  },

  removeUser: async (profile_id: number, role: string) => {
    await userService.deleteUser(profile_id, role);
    await get().fetchUsers();
  },

  importExcel: async (file: File) => {
    const response = await userService.importExcel(file);
    await get().fetchUsers();
    return response.data;
  },

  resendActivationEmail: async (id: number) => {
    await userService.resendActivationEmail(id);
  },
}));