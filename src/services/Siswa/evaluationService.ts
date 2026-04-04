import api from "../../lib/axios";

export const evaluationService = {
  getEvaluation: async () => {
    const response = await api.get("/api/v1/siswa/my-evaluation");
    return response.data;
  },
  downloadPdf: async () => {
    const response = await api.get("/api/v1/siswa/my-evaluation/download", {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Lembar_Penilaian_PKL.pdf');
    document.body.appendChild(link);
    link.click();
  }
};