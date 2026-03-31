import api from "../lib/axios";

export interface IndustryPayload {
  name: string;
  address?: string;
  hr_name: string;
  hr_email?: string;
  hr_phone?: string;
  kuota_siswa: number;
  is_active: boolean;
  mou_file?: File | null;
}

export const industryService = {
  getIndustries: async (search: string = "") => {
    const response = await api.get(`/api/v1/hubin/industries?search=${search}`);
    return response.data;
  },

  createIndustry: async (data: IndustryPayload) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof IndustryPayload];
      if (value !== undefined && value !== null) {
        if (key === 'is_active') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    const response = await api.post('/api/v1/hubin/industries', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateIndustry: async (id: number, data: IndustryPayload) => {
    const formData = new FormData();
    
    formData.append('_method', 'PUT');

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof IndustryPayload];
      if (value !== undefined && value !== null) {
        if (key === 'is_active') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    const response = await api.post(`/api/v1/hubin/industries/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteIndustry: async (id: number) => {
    const response = await api.delete(`/api/v1/hubin/industries/${id}`);
    return response.data;
  }
};