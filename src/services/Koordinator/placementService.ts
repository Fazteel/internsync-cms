import api from "../../lib/axios";

export interface PlacementPayload {
  student_id: number;
  industry_id: number;
  duration: number;
  is_extended?: boolean; 
  start_date: string;
  extension_month?: number | null;
}

export const placementService = {
  getStudents: async () => {
    const response = await api.get('/api/v1/koordinator/placements');
    return response.data;
  },
  
  getActiveIndustries: async () => {
    const response = await api.get('/api/v1/koordinator/placements/industries');
    return response.data;
  },

  assignPlacement: async (data: PlacementPayload) => {
    const response = await api.post('/api/v1/koordinator/placements', data);
    return response.data;
  },
};