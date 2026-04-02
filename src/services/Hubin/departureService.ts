import api from "../../lib/axios";

export const departureService = {
  getDepartures: async () => {
    const response = await api.get('/api/v1/hubin/departures');
    return response.data;
  },
  verifyDeparture: async (id: number, action: 'approve' | 'reject', reason?: string) => {
    const response = await api.post(`/api/v1/hubin/departures/${id}/verify`, { action, reason });
    return response.data;
  },
 generateSurat: async (id: number) => {
    const response = await api.post(`/api/v1/hubin/departures/${id}/generate-surat`);
    return response.data;
  },
  viewSurat: async (id: number) => {
    const response = await api.get(`/api/v1/hubin/departures/${id}/view-surat`);
    window.open(response.data.file_url, '_blank');
  }
};