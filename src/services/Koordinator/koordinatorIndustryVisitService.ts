import api from "../../lib/axios";

export interface KoordinatorVisitPayload {
  pembimbing_id: number | string;
  industry_id: number | string;
  planned_date: string;
  purpose: string;
}

export const koordinatorVisitService = {
  getVisits: async () => {
    const response = await api.get("/api/v1/koordinator/visits");
    return response.data;
  },

  getFormOptions: async () => {
    const response = await api.get("/api/v1/koordinator/visits/options");
    return response.data;
  },

  submitVisit: async (data: KoordinatorVisitPayload) => {
    const response = await api.post("/api/v1/koordinator/visits", data);
    return response.data;
  }
};