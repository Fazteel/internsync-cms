import api from "../../lib/axios";

export interface VisitPayload {
  industry_id: string;
  planned_date: string;
  purpose: string;
}

export const industryVisitService = {
  getVisits: async () => {
    const response = await api.get("/api/v1/pembimbing/visits");
    return response.data;
  },

  getLetterUrl: async (id: number) => {
    const response = await api.get(`/api/v1/pembimbing/visits/${id}/sppd`);
    return response.data.file_url;
  }
};