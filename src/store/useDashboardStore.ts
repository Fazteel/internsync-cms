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

// --- INTERFACE HUBIN ---
interface HubinMetrics {
  total_industri: number;
  total_requests: number;
}

// --- INTERFACE SISWA ---
interface SiswaMetrics {
  approved_count: number;
  revision_count: number;
}
interface SiswaLogbook {
  id: number;
  date: string;
  activity: string;
  status: "Approved" | "Pending" | "Revision";
}
interface SiswaProgress {
  total_days: number;
  days_passed: number;
  days_remaining: number;
  percentage: number;
}

// --- INTERFACE PEMBIMBING ---
interface PembimbingMetrics {
  total_bimbingan: number;
  menunggu_verifikasi: number;
  kunjungan_bulan_ini: number;
}

interface PendingLogbook {
  id: number;
  studentName: string;
  industry: string;
  date: string;
  activity: string;
}

interface PembimbingChart {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

interface HubinApprovalEntry {
  id: number;
  requester: string;
  role: string;
  type: string;
  date: string;
}

interface SebaranIndustri {
  name: string;
  count: number;
  percentage: number;
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
  // --- STATE DATA ---
  stats: SystemStats;
  logs: AuditLog[];
  hubinMetrics: HubinMetrics;
  hubinTable: HubinApprovalEntry[];
  hubinSebaran: SebaranIndustri[];
  koordinatorMetrics: KoordinatorMetrics;
  koordinatorTable: KoordinatorTableEntry[];
  koordinatorChart: ChartData[];
  siswaMetrics: SiswaMetrics;
  siswaRecentLogbooks: SiswaLogbook[];
  siswaProgress: SiswaProgress;
  pembimbingMetrics: PembimbingMetrics;
  pembimbingPendingLogbooks: PendingLogbook[];
  pembimbingChart: PembimbingChart;

  // --- GLOBAL STATE ---
  isLoading: boolean;
  lastUpdated: string; // Tambahin ini buat nampung waktu cache

  // --- ACTIONS ---
  fetchDashboardData: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchHubinDashboard: () => Promise<void>;
  fetchKoordinatorDashboard: () => Promise<void>;
  fetchSiswaDashboard: () => Promise<void>;
  fetchPembimbingDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // --- INITIAL STATES ---
  stats: { totalStudents: 0, totalTeachers: 0, totalIndustries: 0, systemStatus: "Memuat..." },
  logs: [],
  hubinMetrics: { total_industri: 0, total_requests: 0 },
  hubinTable: [],
  hubinSebaran: [],
  koordinatorMetrics: { total_aktif: 0, belum_ditempatkan: 0, industri_aktif: 0 },
  koordinatorTable: [],
  koordinatorChart: [{ name: "Diberangkatkan", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }],
  siswaMetrics: { approved_count: 0, revision_count: 0 },
  siswaRecentLogbooks: [],
  siswaProgress: { total_days: 0, days_passed: 0, days_remaining: 0, percentage: 0 },
  pembimbingMetrics: { total_bimbingan: 0, menunggu_verifikasi: 0, kunjungan_bulan_ini: 0 },
  pembimbingPendingLogbooks: [],
  pembimbingChart: { categories: [], series: [] },

  isLoading: false,
  lastUpdated: "--:--",

  // --- FUNGSI FETCH DENGAN UPDATE TIMESTAMP ---

  fetchDashboardData: async () => {
    try {
      const response = await api.get('/api/v1/admin/dashboard/stats');
      set({
        stats: response.data,
        lastUpdated: response.data.last_updated || "--:--"
      });
    } catch (error) {
      console.error("Gagal load stats admin", error);
    }
  },

  fetchHubinDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/hubin/dashboard/stats');
      set({
        hubinMetrics: response.data.metrics,
        hubinTable: response.data.table,
        hubinSebaran: response.data.sebaran,
        lastUpdated: response.data.last_updated || "--:--",
        isLoading: false
      });
    } catch (error) {
      console.error("Gagal load data hubin", error);
      set({ isLoading: false });
    }
  },

  fetchKoordinatorDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/koordinator/dashboard/stats');
      const data = response.data;

      set({
        koordinatorMetrics: {
          total_aktif: data.metrics.siswa_aktif_pkl,
          belum_ditempatkan: data.metrics.belum_ditempatkan,
          industri_aktif: data.sebaran_industri?.length || 0
        },
        koordinatorTable: data.recent_placements || [],
        koordinatorChart: data.monthly_chart?.datasets || [],
        lastUpdated: data.last_updated || "--:--",
        isLoading: false
      });
    } catch (error) {
      console.error("Gagal load data koordinator", error);
      set({ isLoading: false });
    }
  },

  fetchSiswaDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/siswa/dashboard/stats');
      set({
        siswaMetrics: response.data.metrics,
        siswaRecentLogbooks: response.data.recent_logbooks,
        siswaProgress: response.data.progress,
        lastUpdated: response.data.last_updated || "--:--",
        isLoading: false
      });
    } catch (error) {
      console.error("Gagal load data dashboard siswa", error);
      set({ isLoading: false });
    }
  },

  fetchPembimbingDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/v1/pembimbing/dashboard');
      set({
        pembimbingMetrics: response.data.metrics,
        pembimbingPendingLogbooks: response.data.pending_logbooks,
        pembimbingChart: response.data.chart,
        lastUpdated: response.data.last_updated || "--:--",
        isLoading: false
      });
    } catch (error) {
      console.error("Gagal load dashboard pembimbing", error);
      set({ isLoading: false });
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
}));