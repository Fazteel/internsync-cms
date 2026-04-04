import api from "../../lib/axios";
import { SummaryFilter } from "../../store/Koordinator/useSummaryStore";

export const summaryService = {
    getSummary: async (params: SummaryFilter) => {
        const response = await api.get("/api/v1/koordinator/summary", { params });
        return response.data;
    },
    exportExcel: async (filters: SummaryFilter) => {
        const response = await api.get("/api/v1/koordinator/summary/export/excel", {
            params: filters,
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Rekap_Siswa.xlsx');
        document.body.appendChild(link);
        link.click();
    },
    exportPdf: async (id: number) => {
        const response = await api.get(`/api/v1/koordinator/summary/export/pdf/${id}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Rapor_Siswa_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
    }
};
