import { create } from 'zustand';
import { industryService, IndustryPayload } from '../services/industryService';

export interface Industry {
  id: number;
  name: string;
  address: string | null;
  hr_name: string;
  hr_email: string | null;
  hr_phone: string | null;
  kuota_siswa: number;
  is_active: boolean;
  mou_file: string | null;
}

interface IndustryState {
  industries: Industry[];
  isLoading: boolean;
  fetchIndustries: (search?: string) => Promise<void>;
  addIndustry: (data: IndustryPayload) => Promise<void>;
  editIndustry: (id: number, data: IndustryPayload) => Promise<void>;
  removeIndustry: (id: number) => Promise<void>;
}

export const useIndustryStore = create<IndustryState>((set) => ({
  industries: [],
  isLoading: false,

  fetchIndustries: async (search = "") => {
    set({ isLoading: true });
    try {
      const data = await industryService.getIndustries(search);
      set({ industries: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addIndustry: async (data) => {
    await industryService.createIndustry(data);
  },

  editIndustry: async (id, data) => {
    await industryService.updateIndustry(id, data);
  },

  removeIndustry: async (id) => {
    await industryService.deleteIndustry(id);
  }
}));