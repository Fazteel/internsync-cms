import { create } from 'zustand';
import { settingService } from '../../services/Admin/settingService';

interface SettingState {
  settings: Record<string, string>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: (data: Record<string, string>) => Promise<void>;
}

export const useSettingStore = create<SettingState>((set) => ({
  settings: {},
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await settingService.getSettings();
      set({ settings: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  saveSettings: async (data) => {
    await settingService.updateSettings(data);
    set((state) => ({ settings: { ...state.settings, ...data } }));
  }
}));