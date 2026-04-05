import api from "../../lib/axios";

export const fetchLogbooksService = async () => {
  const res = await api.get("/api/v1/pembimbing/logbooks");
  return res.data;
};

export const verifyLogbookService = async (
  id: number,
  status: "approved" | "revised",
  revisionNote?: string
) => {
  await api.put(`/api/v1/pembimbing/logbooks/${id}/verify`, {
    status,
    revisionNote,
  });
};

export const bulkVerifyLogbooksService = async (
  ids: number[],
  status: string
) => {
  await api.put(`/api/v1/pembimbing/logbooks/bulk-verify`, {
    ids,
    status,
  });
};