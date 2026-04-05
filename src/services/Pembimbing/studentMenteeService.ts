import api from "../../lib/axios";

export const fetchStudentsService = async () => {
  const res = await api.get("/api/v1/pembimbing/students");
  return res.data;
};

export const fetchStudentDetailService = async (id: string) => {
  const res = await api.get(`/api/v1/pembimbing/students/${id}`);
  return res.data;
};

export const reportProblemService = async (id: string, reason: string) => {
  await api.put(`/api/v1/pembimbing/students/${id}/report-problem`, { reason });
};