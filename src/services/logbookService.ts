import api from "../lib/axios";

export const logbookService = {
  getLogbooks: async () => {
    const response = await api.get('/api/v1/siswa/logbooks');
    return response.data;
  },

  storeLogbook: async (data: { date: string; activity: string; attachment: File }) => {
    const formData = new FormData();
    formData.append('date', data.date);
    formData.append('activity', data.activity);
    formData.append('attachment', data.attachment);

    const response = await api.post('/api/v1/siswa/logbooks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateLogbook: async (id: number, data: { activity: string; attachment?: File | null }) => {
    const formData = new FormData();
    formData.append('activity', data.activity);
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }
    formData.append('_method', 'PUT');

    const response = await api.post(`/api/v1/siswa/logbooks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};