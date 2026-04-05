import api from "../../lib/axios";

export const fetchMyPlacementService = async () => {
  const res = await api.get("/api/v1/siswa/my-placement");
  return res.data;
};