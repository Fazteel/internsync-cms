import api from "../../lib/axios";

export const reportService = {
    getMasterData: async () => {
        const response = await api.get("/api/v1/hubin/reports/master");
        return response.data;
    },

    exportMaster: async (format: "excel" | "pdf") => {
        try {
            const response = await api.get(`/api/v1/hubin/reports/export/${format}`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/json, application/octet-stream'
                }
            });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Gagal generate file');
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Master_Rekap_PKL.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export Error:", error);
            throw error;
        }
    }
};