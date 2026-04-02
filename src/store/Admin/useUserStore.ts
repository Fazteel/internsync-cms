import { create } from 'zustand';
import { userService, UserPayload } from '../../services/Admin/userService';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  identifier: string;
  role: string;
  status: "Aktif" | "Nonaktif";
  jurusan?: string;
  kelas?: string;
}

interface BackendUser {
  id: number;
  name: string;
  email: string;
  nip?: string | null;
  is_active: boolean;
  roles: { name: string }[];
  student?: {
    nis?: string;
    major?: { major_name: string };
    classroom?: { name: string };
    jurusan?: string;
    kelas?: string;
  } | null;
}

interface UserState {
  users: UserAccount[];
  isLoading: boolean;
  fetchUsers: (search?: string, role?: string) => Promise<void>;
  addUser: (data: UserPayload) => Promise<void>;
  editUser: (id: number, data: UserPayload) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  importExcel: (file: File) => Promise<void>;
  resendActivationEmail: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async (search?: string, role?: string) => {
    set({ isLoading: true });
    try {
      const data = await userService.getUsers(search, role);
      const mappedUsers = data.map((u: BackendUser) => ({
        id: u.id,
        name: u.name,
        email: u.email || "",
        identifier: u.nip || u.student?.nis || "",
        role: u.roles && u.roles.length > 0 ? u.roles[0].name : "Siswa",
        status: u.is_active ? "Aktif" : "Nonaktif",
        jurusan: u.student?.major?.major_name || u.student?.jurusan || "",
        kelas: u.student?.classroom?.name || u.student?.kelas || ""
      }));
      set({ users: mappedUsers, isLoading: false });
    } catch (error: unknown) {
      console.error("Gagal load users:", error);
      set({ isLoading: false });
    }
  },

  addUser: async (data: UserPayload) => {
    await userService.createUser(data);
  },

  editUser: async (id: number, data: UserPayload) => {
    await userService.updateUser(id, data);
  },

  removeUser: async (id: number) => {
    await userService.deleteUser(id);
  },

  importExcel: async (file: File) => {
    return await userService.importExcel(file);
  },

  resendActivationEmail: async (id: number) => {
    return await userService.resendActivationEmail(id);
  },
}));