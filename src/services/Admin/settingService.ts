import api from "../../lib/axios";

export interface SystemSettings {
  app_name: string;
  school_name: string;
  support_email: string; 
  school_logo: string;
  yayasan_name: string;
  npsn: string;
  nss: string;
  school_address: string;
  school_phone: string;
  school_website: string;
  pkl_registration_status: "Buka" | "Tutup";
  pkl_start_date: string;
  pkl_end_date: string;
  enable_notifications: string;
  maintenance_mode: string;
  [key: string]: string | undefined;
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