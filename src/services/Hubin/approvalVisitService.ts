import api from "../../lib/axios";

export const approvalVisitService = {
  getVisit: async () => {
    const response = await api.get("/api/v1/hubin/visit-approvals");
    return response.data;
  },
  updateVisit: async (
    id: number,
    status: "Pending" | "Approved" | "Rejected",
    feedback?: string,
  ) => {
    const response = await api.put(
      `/api/v1/hubin/visit-approvals/${id}/verify`,
      { status, feedback },
    );
    return response.data;
  },
  generateLetter: async (id: number) => {
    const response = await api.post(
      `/api/v1/hubin/visit-approvals/${id}/generate`,
    );
    return response.data.file_url;
  },
  viewLetter: async (id: number) => {
    const response = await api.get(`/api/v1/hubin/visit-approvals/${id}/view`);
    return response.data.file_url;
  },
};
