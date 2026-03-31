import { create } from 'zustand';
import api from '../lib/axios';

// --- INTERFACE ADMIN ---
interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalIndustries: number;
  systemStatus: string;
}

interface AuditLog {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user?: { name: string };
}

// --- INTERFACE KOORDINATOR ---
interface KoordinatorMetrics {
  total_aktif: number;
  belum_ditempatkan: number;
  industri_aktif: number;
}

interface KoordinatorTableEntry {
  id: number;
  name: string;
  nis: string;
  major: string;
  industry: string;
  status: "Aktif" | "Belum Ditempatkan" | "Selesai";
}

interface ChartData {
  name: string;
  data: number[];
}

interface DashboardState {
  // State Admin
  stats: SystemStats;
  logs: AuditLog[];
  
  // State Koordinator
  koordinatorMetrics: KoordinatorMetrics;
  koordinatorTable: KoordinatorTableEntry[];
  koordinatorChart: ChartData[];

  // Global State
  isLoading: boolean;
  
  // Actions Admin
  fetchDashboardData: () => Promise<void>; 
  fetchLogs: () => Promise<void>; 
  
  // Actions Koordinator
  fetchKoordinatorDashboard: () => Promise<void>; 
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // --- INITIAL STATE ADMIN ---
  stats: {
    totalStudents: 0,
    totalTeachers: 0,
    totalIndustries: 0,
    systemStatus: "Memuat...",
  },
  logs: [],

  // --- INITIAL STATE KOORDINATOR ---
  koordinatorMetrics: { total_aktif: 0, belum_ditempatkan: 0, industri_aktif: 0 },
  koordinatorTable: [],
  koordinatorChart: [{ name: "Diberangkatkan", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }],

  isLoading: false,

  // --- FUNGSI FETCH ADMIN ---
  fetchDashboardData: async () => {
    try {
      const response = await api.get('/api/v1/admin/dashboard/stats');
      set({ stats: response.data });
    } catch (error) {
      console.error("Gagal load stats admin", error);
    }
  },

  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/admin/logs');
      set({ logs: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal load logs admin", error);
      set({ isLoading: false });
    }
  },

  // --- FUNGSI FETCH KOORDINATOR ---
  fetchKoordinatorDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/koordinator/dashboard/stats');
      set({ 
        koordinatorMetrics: response.data.metrics, 
        koordinatorTable: response.data.table, 
        koordinatorChart: [response.data.chart], 
        isLoading: false 
      });
    } catch (error) {
      console.error("Gagal load data koordinator", error);
      set({ isLoading: false });
    }
  }
}));