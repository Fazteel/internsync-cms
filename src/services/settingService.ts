import api from "../lib/axios";

export interface SystemSettings {
  app_name: string;
  school_name: string;
  helpdesk_email: string;
  pkl_registration_status: "Buka" | "Tutup";
  pkl_start_date: string;
  pkl_end_date: string;
  [key: string]: string;
}

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/api/v1/admin/settings');
    return response.data;
  },
  
  updateSettings: async (data: Partial<SystemSettings>) => {
    const response = await api.post('/api/v1/admin/settings', data);
    return response.data;
  }
};