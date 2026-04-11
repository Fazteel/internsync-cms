import { ExtendInternshipPayload } from './../services/internshipService';
import { create } from 'zustand';
import { internshipService, InternshipApplicationPayload, InternshipPlacementPayload } from '../services/internshipService';

export interface AppStudent {
  id: number;
  name: string;
  nis?: string;
  identifier?: string;
  kelas?: string;
  major?: string | { major_name: string };
}

export interface AppIndustry {
  id: number;
  name: string;
}

export interface AppTeacherProfile {
  id: number;
  name: string;
  nip?: string;
}

export interface AppUser {
  id: number;
  email: string;
  teacher?: AppTeacherProfile;
}

export interface InternshipApplication {
  id: number;
  application_number: string;
  industry_id: number;
  pembimbing_id: number;
  industry?: AppIndustry;
  pembimbing?: AppUser;
  students: AppStudent[];
  suggested_start_date: string;
  suggested_end_date: string;
  status: 'draft' | 'menunggu_acc_pengajuan' | 'pengajuan' | 'menunggu_acc_pengiriman' | 'pengiriman' | 'batal' | 'ditolak';
  academic_year?: string;
  application_letter_path?: string;
  placement_letter_path?: string;
  ba_path?: string;
  departure_date?: string;
  duration_option?: string;
  final_end_date?: string;
}

interface InternshipState {
  applications: InternshipApplication[];
  isLoading: boolean;
  fetchApplications: (type: 'pengajuan' | 'pengiriman' | 'riwayat') => Promise<void>;
  fetchPendingApprovals: (type: 'pengajuan' | 'pengiriman') => Promise<void>;
  submitApplication: (payload: InternshipApplicationPayload) => Promise<void>;
  submitPlacement: (id: number, payload: InternshipPlacementPayload) => Promise<void>;
  processHubinApproval: (id: number, action: 'approve' | 'reject', type: 'pengajuan' | 'pengiriman') => Promise<void>;
  extendInternship: (payload: ExtendInternshipPayload) => Promise<void>;
  withdrawStudent: (studentId: number) => Promise<void>;
}

export const useInternshipStore = create<InternshipState>((set, get) => ({
  applications: [],
  isLoading: false,

  fetchApplications: async (type) => {
    set({ isLoading: true });
    try {
      const data = await internshipService.getApplications(type);
      set({ applications: data, isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil data pengajuan", error);
      set({ isLoading: false });
    }
  },

  fetchPendingApprovals: async (type) => {
    set({ isLoading: true });
    try {
      const data = await internshipService.getPendingApprovals(type);
      set({ applications: data, isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil antrian ACC Hubin", error);
      set({ isLoading: false });
    }
  },

  submitApplication: async (payload) => {
    set({ isLoading: true });
    try {
      await internshipService.submitApplication(payload);
      get().fetchApplications('pengajuan');
    } finally {
      set({ isLoading: false });
    }
  },

  submitPlacement: async (id, payload) => {
    set({ isLoading: true });
    try {
      await internshipService.submitPlacement(id, payload);
      get().fetchApplications('pengiriman');
    } finally {
      set({ isLoading: false });
    }
  },

  processHubinApproval: async (id, action, type) => {
    set({ isLoading: true });
    try {
      await internshipService.processApproval(id, action, type);
      get().fetchPendingApprovals(type);
    } finally {
      set({ isLoading: false });
    }
  },

  extendInternship: async (payload) => {
    set({ isLoading: true });
    try {
      await internshipService.extendInternship(payload);
      await get().fetchApplications('riwayat');
    } finally {
      set({ isLoading: false });
    }
  },

  withdrawStudent: async (studentId) => {
    set({ isLoading: true });
    try {
      await internshipService.withdrawInternship(studentId);
      await get().fetchApplications('riwayat');
    } finally {
      set({ isLoading: false });
    }
  }
}));