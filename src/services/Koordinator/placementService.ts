import api from "../../lib/axios";

export interface PlacementPayload {
  student_id: number;
  industry_id: number;
  duration: number;
  start_date: string;
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

  getPlottingStudents: async () => {
    const response = await api.get('/api/v1/koordinator/plotting-pembimbing');
    return response.data;
  },

  getTeachers: async () => {
    const response = await api.get('/api/v1/koordinator/teachers');
    return response.data;
  },

  assignTeacher: async (student_id: number, pembimbing_id: number) => {
    const response = await api.post('/api/v1/koordinator/plotting-pembimbing', {
      student_id,
      pembimbing_id
    });
    return response.data;
  }
};