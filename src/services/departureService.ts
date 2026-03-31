import api from "../lib/axios";

export const departureService = {
  getDepartures: async () => {
    const response = await api.get('/api/v1/hubin/departures');
    return response.data;
  },
  verifyDeparture: async (id: number, action: 'approve' | 'reject', reason?: string) => {
    const response = await api.post(`/api/v1/hubin/departures/${id}/verify`, { action, reason });
    return response.data;
  },
  downloadSurat: async (id: number, studentName: string) => {
    const response = await api.get(`/api/v1/hubin/departures/${id}/print`, { responseType: 'blob' });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Surat_Pengantar_${studentName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};