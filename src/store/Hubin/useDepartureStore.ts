import { create } from 'zustand';
import { departureService } from '../../services/Hubin/departureService';

export interface DepartureData {
  id: number;
  nis: string;
  studentName: string;
  major: string;
  industry: string;
  startDate: string;
  endDate: string;
  status: "Menunggu" | "Disetujui" | "Dibatalkan";
  industry_id: number | null;
  pembimbing_id: number | null;
  has_letter: string | null;
}

interface DepartureState {
  departures: DepartureData[];
  isLoading: boolean;
  fetchDepartures: () => Promise<void>;
  verifyDeparture: (id: number, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  generateSurat: (id: number) => Promise<void>;
  viewSurat: (id: number) => Promise<void>;
}

export const useDepartureStore = create<DepartureState>((set) => ({
  departures: [],
  isLoading: false,

  fetchDepartures: async () => {
    set({ isLoading: true });
    try {
      const data = await departureService.getDepartures();
      set({ departures: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error(error);
    }
  },
  verifyDeparture: async (id, action, reason) => {
    await departureService.verifyDeparture(id, action, reason);
  },
  generateSurat: async (id) => {
    await departureService.generateSurat(id);
  },
  viewSurat: async (id) => {
    await departureService.viewSurat(id);
  }
}));